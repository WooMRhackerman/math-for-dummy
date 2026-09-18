import { AppData, GitHubConfig } from './index';

export type SyncProviderType = 'supabase' | 'google-drive' | 'cloud-file' | 'github' | 'local';

export interface SupabaseUser {
  id: string;
  email: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  user?: SupabaseUser | null;
}

export interface GoogleUserInfo {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

export interface GoogleDriveConfig {
  accessToken: string;
  expiresAt: number; // Unix timestamp ms
  fileId?: string;
  userInfo?: GoogleUserInfo;
  autoSync?: boolean;
}

export interface SyncResult {
  data: AppData;
  source: SyncProviderType;
  timestamp: string;
  versionToken?: string;
}

export interface SyncProvider {
  type: SyncProviderType;
  name: string;
  isAuthenticated: () => boolean;
  pull: () => Promise<SyncResult>;
  push: (data: AppData) => Promise<{ versionToken?: string }>;
}

export interface SyncState {
  provider: SyncProviderType;
  status: 'idle' | 'syncing' | 'success' | 'error' | 'conflict';
  message: string;
  lastSynced?: string;
  googleConfig: GoogleDriveConfig | null;
  githubConfig: GitHubConfig;
}
