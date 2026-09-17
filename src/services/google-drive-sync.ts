import { AppData, GoogleDriveConfig, GoogleUserInfo } from '../types';

export const APP_DATA_FILENAME = 'math_for_dummy_data.json';
export const DRIVE_APPDATA_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';

// Public OAuth2 Web Client ID (Google OAuth Client IDs for web apps are public identifiers)
// Can be customized via Vite environment variable VITE_GOOGLE_CLIENT_ID
export const DEFAULT_GOOGLE_CLIENT_ID = 
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GOOGLE_CLIENT_ID) ||
  '798154134907-u06ks4a5h3h6n1r9v52pvh2uof4o3d1q.apps.googleusercontent.com';

export class GoogleAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GoogleAuthError';
  }
}

export class GoogleDriveError extends Error {
  public status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'GoogleDriveError';
    this.status = status;
  }
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: GoogleTokenResponse) => void;
            error_callback?: (error: unknown) => void;
          }) => {
            requestAccessToken: (options?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  error?: string;
  error_description?: string;
}

/**
 * Ensures the Google Identity Services (GIS) script is loaded into the document.
 */
export async function loadGoogleIdentityScript(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (window.google?.accounts?.oauth2) return;

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new GoogleAuthError('Failed to load Google Identity script')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new GoogleAuthError('Failed to load Google Identity script'));
    document.head.appendChild(script);
  });
}

/**
 * Initiates the Google OAuth 2.0 Token Flow via GIS popup.
 */
export async function requestGoogleAccessToken(
  clientId = DEFAULT_GOOGLE_CLIENT_ID
): Promise<{ accessToken: string; expiresAt: number }> {
  await loadGoogleIdentityScript();

  const oauth2 = window.google?.accounts?.oauth2;
  if (!oauth2) {
    throw new GoogleAuthError('Google Identity Services not initialized.');
  }

  return new Promise((resolve, reject) => {
    try {
      const client = oauth2.initTokenClient({
        client_id: clientId,
        scope: DRIVE_APPDATA_SCOPE,
        callback: (response: GoogleTokenResponse) => {
          if (response.error) {
            reject(new GoogleAuthError(response.error_description || response.error));
            return;
          }

          const expiresAt = Date.now() + (response.expires_in || 3600) * 1000;
          resolve({
            accessToken: response.access_token,
            expiresAt
          });
        },
        error_callback: (err) => {
          reject(new GoogleAuthError(String(err)));
        }
      });

      client.requestAccessToken({ prompt: '' });
    } catch (err) {
      reject(new GoogleAuthError(err instanceof Error ? err.message : String(err)));
    }
  });
}

/**
 * Fetches basic user profile info from Google OAuth2 userinfo endpoint.
 */
export async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    throw new GoogleDriveError(`Failed to fetch user profile (${res.status})`, res.status);
  }

  const json = await res.json();
  return {
    id: json.sub,
    name: json.name || json.email.split('@')[0],
    email: json.email,
    picture: json.picture
  };
}

/**
 * Searches the user's hidden appDataFolder for the math study data file.
 */
export async function findAppDataFileId(
  accessToken: string,
  fileName = APP_DATA_FILENAME
): Promise<string | null> {
  const query = encodeURIComponent(`name = '${fileName}' and trashed = false`);
  const url = `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${query}&fields=files(id,name,modifiedTime)`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    throw new GoogleDriveError(`Google Drive search error (${res.status})`, res.status);
  }

  const json = await res.json();
  if (json.files && json.files.length > 0) {
    return json.files[0].id;
  }
  return null;
}

/**
 * Downloads AppData from Google Drive appDataFolder.
 */
export async function pullFromGoogleDrive(
  config: GoogleDriveConfig
): Promise<{ data: AppData; fileId: string; modifiedTime?: string }> {
  if (Date.now() > config.expiresAt) {
    throw new GoogleAuthError('TOKEN_EXPIRED');
  }

  let fileId = config.fileId;
  if (!fileId) {
    fileId = (await findAppDataFileId(config.accessToken)) || undefined;
  }

  if (!fileId) {
    throw new GoogleDriveError('FILE_NOT_FOUND', 404);
  }

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${config.accessToken}`
    }
  });

  if (res.status === 404) {
    throw new GoogleDriveError('FILE_NOT_FOUND', 404);
  }

  if (!res.ok) {
    throw new GoogleDriveError(`Failed to download data (${res.status})`, res.status);
  }

  const data: AppData = await res.json();
  return {
    data,
    fileId
  };
}

/**
 * Pushes AppData to Google Drive appDataFolder (creates new or updates existing).
 */
export async function pushToGoogleDrive(
  config: GoogleDriveConfig,
  data: AppData
): Promise<{ fileId: string }> {
  if (Date.now() > config.expiresAt) {
    throw new GoogleAuthError('TOKEN_EXPIRED');
  }

  let fileId = config.fileId;
  if (!fileId) {
    fileId = (await findAppDataFileId(config.accessToken)) || undefined;
  }

  const jsonString = JSON.stringify(data, null, 2);

  if (fileId) {
    // Update existing file
    const uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
    const res = await fetch(uploadUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8'
      },
      body: jsonString
    });

    if (!res.ok) {
      throw new GoogleDriveError(`Failed to update file in Google Drive (${res.status})`, res.status);
    }

    return { fileId };
  } else {
    // Create new file inside appDataFolder using multipart upload
    const boundary = '-------MathForDummyBoundary' + Math.random().toString(36).substring(2);
    const metadata = {
      name: APP_DATA_FILENAME,
      parents: ['appDataFolder']
    };

    const multipartBody = 
      `--${boundary}\r\n` +
      `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
      `${JSON.stringify(metadata)}\r\n` +
      `--${boundary}\r\n` +
      `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
      `${jsonString}\r\n` +
      `--${boundary}--`;

    const uploadUrl = `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`;
    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartBody
    });

    if (!res.ok) {
      throw new GoogleDriveError(`Failed to create file in Google Drive (${res.status})`, res.status);
    }

    const json = await res.json();
    return { fileId: json.id };
  }
}
