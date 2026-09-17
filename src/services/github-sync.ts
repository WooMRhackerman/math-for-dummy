import { AppData, GitHubConfig } from '../types';

/**
 * Encodes a UTF-8 string (including Korean Hangul & Math symbols) to Base64 safely.
 */
export function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Decodes a Base64 string to a UTF-8 string safely.
 */
export function base64ToUtf8(base64: string): string {
  // Remove whitespace and newlines often inserted by GitHub API
  const cleanBase64 = base64.replace(/\s/g, '');
  const binary = atob(cleanBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export class SyncConflictError extends Error {
  constructor(message = 'Conflict: Remote file has been modified.') {
    super(message);
    this.name = 'SyncConflictError';
  }
}

/**
 * Pulls the data file from GitHub REST API.
 */
export async function pullFromGitHub(config: GitHubConfig): Promise<{ data: AppData; sha: string }> {
  const { token, owner, repo, path } = config;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  const res = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `Bearer ${token.trim()}`,
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });

  if (res.status === 404) {
    throw new Error('FILE_NOT_FOUND');
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`GitHub API error (${res.status}): ${errText}`);
  }

  const json = await res.json();
  const decodedStr = base64ToUtf8(json.content);
  const data: AppData = JSON.parse(decodedStr);

  return {
    data,
    sha: json.sha
  };
}

/**
 * Pushes local data file to GitHub REST API.
 */
export async function pushToGitHub(config: GitHubConfig, data: AppData): Promise<{ sha: string }> {
  const { token, owner, repo, path, lastKnownSha } = config;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  const jsonString = JSON.stringify(data, null, 2);
  const content = utf8ToBase64(jsonString);

  const payload: { message: string; content: string; sha?: string } = {
    message: `sync: update study data [${new Date().toISOString()}] [skip ci]`,
    content
  };

  if (lastKnownSha) {
    payload.sha = lastKnownSha;
  }

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `Bearer ${token.trim()}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28'
    },
    body: JSON.stringify(payload)
  });

  if (res.status === 409) {
    throw new SyncConflictError();
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`GitHub API error (${res.status}): ${errText}`);
  }

  const resJson = await res.json();
  return {
    sha: resJson.content.sha
  };
}
