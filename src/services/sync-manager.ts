import { AppData, GitHubConfig, GoogleDriveConfig, SupabaseConfig, SyncProviderType, SyncResult, SyncStatus } from '../types';
import { pullFromGoogleDrive, pushToGoogleDrive } from './google-drive-sync';
import { pullFromGitHub, pushToGitHub } from './github-sync';
import { readDataFromFileHandle, writeDataToFileHandle } from './cloud-drive-file';
import { pullFromSupabase, pushToSupabase } from './supabase-sync';
import { loadAppData, saveAppData } from './storage';

export class SyncManager {
  private activeProvider: SyncProviderType = 'supabase';
  private supabaseConfig: SupabaseConfig | null = null;
  private cloudFileHandle: FileSystemFileHandle | null = null;
  private cloudFileName = '';
  private googleConfig: GoogleDriveConfig | null = null;
  private githubConfig: GitHubConfig = { token: '', owner: '', repo: '', path: 'data.json' };
  private status: SyncStatus = 'idle';
  private message = '';
  private lastSynced?: string;

  constructor(options?: {
    provider?: SyncProviderType;
    supabaseConfig?: SupabaseConfig | null;
    cloudFileHandle?: FileSystemFileHandle | null;
    cloudFileName?: string;
    googleConfig?: GoogleDriveConfig | null;
    githubConfig?: GitHubConfig;
  }) {
    if (options?.provider) this.activeProvider = options.provider;
    if (options?.supabaseConfig !== undefined) this.supabaseConfig = options.supabaseConfig;
    if (options?.cloudFileHandle !== undefined) this.cloudFileHandle = options.cloudFileHandle;
    if (options?.cloudFileName) this.cloudFileName = options.cloudFileName;
    if (options?.googleConfig !== undefined) this.googleConfig = options.googleConfig;
    if (options?.githubConfig) this.githubConfig = options.githubConfig;
  }

  public setProvider(provider: SyncProviderType) {
    this.activeProvider = provider;
  }

  public getProvider(): SyncProviderType {
    return this.activeProvider;
  }

  public setCloudFile(handle: FileSystemFileHandle | null, name = '') {
    this.cloudFileHandle = handle;
    this.cloudFileName = name || handle?.name || '';
  }

  public getCloudFile(): { handle: FileSystemFileHandle | null; name: string } {
    return {
      handle: this.cloudFileHandle,
      name: this.cloudFileName
    };
  }

  public setSupabaseConfig(config: SupabaseConfig | null) {
    this.supabaseConfig = config;
  }

  public getSupabaseConfig(): SupabaseConfig | null {
    return this.supabaseConfig;
  }

  public setGoogleConfig(config: GoogleDriveConfig | null) {
    this.googleConfig = config;
  }

  public getGoogleConfig(): GoogleDriveConfig | null {
    return this.googleConfig;
  }

  public setGitHubConfig(config: GitHubConfig) {
    this.githubConfig = config;
  }

  public getGitHubConfig(): GitHubConfig {
    return this.githubConfig;
  }

  public getStatus(): { status: SyncStatus; message: string; lastSynced?: string } {
    return {
      status: this.status,
      message: this.message,
      lastSynced: this.lastSynced
    };
  }

  public isConnected(): boolean {
    if (this.activeProvider === 'supabase') {
      return !!this.supabaseConfig?.user;
    }
    if (this.activeProvider === 'cloud-file') {
      return !!this.cloudFileHandle;
    }
    if (this.activeProvider === 'google-drive') {
      return !!this.googleConfig && Date.now() < this.googleConfig.expiresAt;
    }
    if (this.activeProvider === 'github') {
      return !!(this.githubConfig.token && this.githubConfig.owner && this.githubConfig.repo);
    }
    return true; // Local is always connected
  }

  /**
   * Pulls data from the active provider.
   */
  public async pull(): Promise<SyncResult> {
    this.status = 'syncing';
    this.message = 'Pulling data...';

    try {
      if (this.activeProvider === 'supabase') {
        const res = await pullFromSupabase();
        await saveAppData(res.data);

        this.status = 'success';
        this.message = 'Supabase 클라우드에서 불러왔습니다.';
        this.lastSynced = res.timestamp;

        return {
          data: res.data,
          source: 'supabase',
          timestamp: this.lastSynced
        };
      }
      if (this.activeProvider === 'cloud-file') {
        if (!this.cloudFileHandle) {
          throw new Error('NO_CLOUD_FILE_CONNECTED');
        }

        const data = await readDataFromFileHandle(this.cloudFileHandle);
        await saveAppData(data);

        this.status = 'success';
        this.message = `클라우드 드라이브(${this.cloudFileName || this.cloudFileHandle.name})에서 불러왔습니다.`;
        this.lastSynced = new Date().toISOString();

        return {
          data,
          source: 'cloud-file',
          timestamp: this.lastSynced
        };
      }

      if (this.activeProvider === 'google-drive') {
        if (!this.googleConfig || Date.now() > this.googleConfig.expiresAt) {
          throw new Error('GOOGLE_AUTH_REQUIRED');
        }

        const res = await pullFromGoogleDrive(this.googleConfig);
        this.googleConfig.fileId = res.fileId;
        await saveAppData(res.data);

        this.status = 'success';
        this.message = 'Google Drive sync complete';
        this.lastSynced = new Date().toISOString();

        return {
          data: res.data,
          source: 'google-drive',
          timestamp: this.lastSynced,
          versionToken: res.fileId
        };
      }

      if (this.activeProvider === 'github') {
        if (!this.githubConfig.token || !this.githubConfig.owner || !this.githubConfig.repo) {
          throw new Error('GITHUB_CONFIG_REQUIRED');
        }

        const res = await pullFromGitHub(this.githubConfig);
        this.githubConfig.lastKnownSha = res.sha;
        await saveAppData(res.data);

        this.status = 'success';
        this.message = 'GitHub sync complete';
        this.lastSynced = new Date().toISOString();

        return {
          data: res.data,
          source: 'github',
          timestamp: this.lastSynced,
          versionToken: res.sha
        };
      }

      // Local provider
      const localData = await loadAppData();
      if (!localData) {
        throw new Error('NO_LOCAL_DATA');
      }

      this.status = 'success';
      this.message = 'Local data loaded';
      this.lastSynced = localData.lastModified;

      return {
        data: localData,
        source: 'local',
        timestamp: this.lastSynced
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      this.status = errMsg.includes('Conflict') ? 'conflict' : 'error';
      this.message = errMsg;
      throw err;
    }
  }

  /**
   * Pushes data to the active provider.
   */
  public async push(data: AppData): Promise<{ versionToken?: string }> {
    this.status = 'syncing';
    this.message = 'Pushing data...';

    try {
      // Always persist locally first
      await saveAppData(data);

      if (this.activeProvider === 'supabase') {
        const res = await pushToSupabase(data);
        this.status = 'success';
        this.message = 'Supabase 클라우드에 자동 저장되었습니다.';
        this.lastSynced = res.timestamp;
        return {};
      }

      if (this.activeProvider === 'cloud-file') {
        if (!this.cloudFileHandle) {
          throw new Error('NO_CLOUD_FILE_CONNECTED');
        }

        await writeDataToFileHandle(this.cloudFileHandle, data);

        this.status = 'success';
        this.message = `클라우드 드라이브(${this.cloudFileName || this.cloudFileHandle.name})에 자동 저장되었습니다.`;
        this.lastSynced = new Date().toISOString();

        return {};
      }

      if (this.activeProvider === 'google-drive') {
        if (!this.googleConfig || Date.now() > this.googleConfig.expiresAt) {
          throw new Error('GOOGLE_AUTH_REQUIRED');
        }

        const res = await pushToGoogleDrive(this.googleConfig, data);
        this.googleConfig.fileId = res.fileId;

        this.status = 'success';
        this.message = 'Google Drive upload complete';
        this.lastSynced = new Date().toISOString();

        return { versionToken: res.fileId };
      }

      if (this.activeProvider === 'github') {
        if (!this.githubConfig.token || !this.githubConfig.owner || !this.githubConfig.repo) {
          throw new Error('GITHUB_CONFIG_REQUIRED');
        }

        const res = await pushToGitHub(this.githubConfig, data);
        this.githubConfig.lastKnownSha = res.sha;

        this.status = 'success';
        this.message = 'GitHub upload complete';
        this.lastSynced = new Date().toISOString();

        return { versionToken: res.sha };
      }

      // Local
      this.status = 'success';
      this.message = 'Saved locally';
      this.lastSynced = new Date().toISOString();
      return {};
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      this.status = errMsg.includes('Conflict') ? 'conflict' : 'error';
      this.message = errMsg;
      throw err;
    }
  }

  /**
   * Triggers a browser download of AppData as a JSON file.
   */
  public exportAsJSON(data: AppData, fileName = 'math_for_dummy_backup.json'): void {
    if (typeof window === 'undefined') return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
