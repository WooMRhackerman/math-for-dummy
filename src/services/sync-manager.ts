import { AppData, GitHubConfig, GoogleDriveConfig, SyncProviderType, SyncResult, SyncStatus } from '../types';
import { pullFromGoogleDrive, pushToGoogleDrive } from './google-drive-sync';
import { pullFromGitHub, pushToGitHub } from './github-sync';
import { loadAppData, saveAppData } from './storage';

export class SyncManager {
  private activeProvider: SyncProviderType = 'google-drive';
  private googleConfig: GoogleDriveConfig | null = null;
  private githubConfig: GitHubConfig = { token: '', owner: '', repo: '', path: 'data.json' };
  private status: SyncStatus = 'idle';
  private message = '';
  private lastSynced?: string;

  constructor(options?: {
    provider?: SyncProviderType;
    googleConfig?: GoogleDriveConfig | null;
    githubConfig?: GitHubConfig;
  }) {
    if (options?.provider) this.activeProvider = options.provider;
    if (options?.googleConfig !== undefined) this.googleConfig = options.googleConfig;
    if (options?.githubConfig) this.githubConfig = options.githubConfig;
  }

  public setProvider(provider: SyncProviderType) {
    this.activeProvider = provider;
  }

  public getProvider(): SyncProviderType {
    return this.activeProvider;
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
      if (this.activeProvider === 'google-drive') {
        if (!this.googleConfig || Date.now() > this.googleConfig.expiresAt) {
          throw new Error('GOOGLE_AUTH_REQUIRED');
        }

        const res = await pullFromGoogleDrive(this.googleConfig);
        // Save fileId back to config
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
