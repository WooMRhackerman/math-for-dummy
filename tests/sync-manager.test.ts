import { describe, it, expect } from 'vitest';
import { SyncManager } from '../src/services/sync-manager';

describe('SyncManager Multi-Provider Coordinator', () => {
  it('should initialize with default supabase provider', () => {
    const manager = new SyncManager();
    expect(manager.getProvider()).toBe('supabase');
    expect(manager.getStatus().status).toBe('idle');
  });

  it('should switch between providers cleanly', () => {
    const manager = new SyncManager();
    manager.setProvider('github');
    expect(manager.getProvider()).toBe('github');

    manager.setProvider('google-drive');
    expect(manager.getProvider()).toBe('google-drive');

    manager.setProvider('supabase');
    expect(manager.getProvider()).toBe('supabase');

    manager.setProvider('local');
    expect(manager.getProvider()).toBe('local');
    expect(manager.isConnected()).toBe(true);
  });

  it('should evaluate connection state accurately based on provider credentials', () => {
    const manager = new SyncManager();
    
    // Supabase default with no user -> not connected
    expect(manager.isConnected()).toBe(false);

    // Supabase with user -> connected
    manager.setSupabaseConfig({
      url: 'https://example.supabase.co',
      anonKey: 'anon-key',
      user: { id: '123', email: 'user@example.com' }
    });
    expect(manager.isConnected()).toBe(true);

    // Switch to Google Drive with no config -> not connected
    manager.setProvider('google-drive');
    expect(manager.isConnected()).toBe(false);

    // Google Drive with active config -> connected
    manager.setGoogleConfig({
      accessToken: 'valid_token',
      expiresAt: Date.now() + 3600000
    });
    expect(manager.isConnected()).toBe(true);

    // Google Drive with expired token -> not connected
    manager.setGoogleConfig({
      accessToken: 'expired_token',
      expiresAt: Date.now() - 1000
    });
    expect(manager.isConnected()).toBe(false);

    // Switch to Cloud File with no handle -> not connected
    manager.setProvider('cloud-file');
    expect(manager.isConnected()).toBe(false);

    // Cloud File with handle -> connected
    manager.setCloudFile({ name: 'math_study.json' } as unknown as FileSystemFileHandle);
    expect(manager.isConnected()).toBe(true);

    // GitHub with missing credentials -> not connected
    manager.setProvider('github');
    expect(manager.isConnected()).toBe(false);

    // GitHub with full credentials -> connected
    manager.setGitHubConfig({
      token: 'pat_123',
      owner: 'octocat',
      repo: 'my-math-repo',
      path: 'data.json'
    });
    expect(manager.isConnected()).toBe(true);
  });
});
