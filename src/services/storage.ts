import { get, set } from 'idb-keyval';
import { AppData, GitHubConfig, Language } from '../types';

const APP_DATA_KEY = 'math_for_dummy_data';
const GITHUB_CONFIG_KEY = 'math_for_dummy_gh_config';
const LANGUAGE_KEY = 'math_for_dummy_language';

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
