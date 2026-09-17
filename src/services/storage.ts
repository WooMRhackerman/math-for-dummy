import { get, set, del } from 'idb-keyval';
import { AppData, GitHubConfig, GoogleDriveConfig, Language, SyncProviderType, Theme } from '../types';

const APP_DATA_KEY = 'math_for_dummy_data';
const GITHUB_CONFIG_KEY = 'math_for_dummy_gh_config';
const GOOGLE_CONFIG_KEY = 'math_for_dummy_google_config';
const SYNC_PROVIDER_KEY = 'math_for_dummy_active_sync_provider';
const LANGUAGE_KEY = 'math_for_dummy_language';
const THEME_KEY = 'math_for_dummy_theme';

export async function loadAppData(): Promise<AppData | null> {
  try {
    const data = await get<AppData>(APP_DATA_KEY);
    return data || null;
  } catch (err) {
    console.error('Failed to load AppData from IndexedDB:', err);
    return null;
  }
}

export async function saveAppData(data: AppData): Promise<void> {
  try {
    await set(APP_DATA_KEY, {
      ...data,
      lastModified: new Date().toISOString()
    });
  } catch (err) {
    console.error('Failed to save AppData to IndexedDB:', err);
    throw err;
  }
}

export async function loadGitHubConfig(): Promise<GitHubConfig | null> {
  try {
    const config = await get<GitHubConfig>(GITHUB_CONFIG_KEY);
    return config || null;
  } catch (err) {
    console.error('Failed to load GitHubConfig:', err);
    return null;
  }
}

export async function saveGitHubConfig(config: GitHubConfig): Promise<void> {
  try {
    await set(GITHUB_CONFIG_KEY, config);
  } catch (err) {
    console.error('Failed to save GitHubConfig:', err);
    throw err;
  }
}

export async function loadGoogleConfig(): Promise<GoogleDriveConfig | null> {
  try {
    const config = await get<GoogleDriveConfig>(GOOGLE_CONFIG_KEY);
    return config || null;
  } catch (err) {
    console.error('Failed to load GoogleDriveConfig:', err);
    return null;
  }
}

export async function saveGoogleConfig(config: GoogleDriveConfig): Promise<void> {
  try {
    await set(GOOGLE_CONFIG_KEY, config);
  } catch (err) {
    console.error('Failed to save GoogleDriveConfig:', err);
    throw err;
  }
}

export async function clearGoogleConfig(): Promise<void> {
  try {
    await del(GOOGLE_CONFIG_KEY);
  } catch (err) {
    console.error('Failed to clear GoogleDriveConfig:', err);
  }
}

export async function loadActiveSyncProvider(): Promise<SyncProviderType> {
  try {
    const provider = await get<SyncProviderType>(SYNC_PROVIDER_KEY);
    return provider || 'google-drive';
  } catch {
    return 'google-drive';
  }
}

export async function saveActiveSyncProvider(provider: SyncProviderType): Promise<void> {
  try {
    await set(SYNC_PROVIDER_KEY, provider);
  } catch (err) {
    console.error('Failed to save active sync provider:', err);
  }
}

export async function loadLanguage(): Promise<Language> {
  try {
    const lang = await get<Language>(LANGUAGE_KEY);
    return lang || 'ko';
  } catch {
    return 'ko';
  }
}

export async function saveLanguage(lang: Language): Promise<void> {
  try {
    await set(LANGUAGE_KEY, lang);
  } catch (err) {
    console.error('Failed to save Language preference:', err);
  }
}

export async function loadTheme(): Promise<Theme> {
  try {
    const theme = await get<Theme>(THEME_KEY);
    return theme || 'system';
  } catch {
    return 'system';
  }
}

export async function saveTheme(theme: Theme): Promise<void> {
  try {
    await set(THEME_KEY, theme);
  } catch (err) {
    console.error('Failed to save Theme preference:', err);
  }
}
