import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  findAppDataFileId, 
  pullFromGoogleDrive, 
  pushToGoogleDrive, 
  GoogleAuthError, 
  GoogleDriveError, 
  APP_DATA_FILENAME 
} from '../src/services/google-drive-sync';
import { AppData, GoogleDriveConfig } from '../src/types';

describe('Google Drive AppData Sync Service', () => {
  const mockConfig: GoogleDriveConfig = {
    accessToken: 'test_token_123',
    expiresAt: Date.now() + 3600000,
    fileId: 'mock_file_id_999'
  };

  const sampleAppData: AppData = {
    version: 1,
    lastModified: '2026-09-18T00:00:00.000Z',
    decks: [
      {
        id: 'deck-1',
        name: { ko: '초등 1학년 1학기 수학', en: 'Grade 1 Semester 1' },
        cards: [
          {
            id: 'card-1',
            grade: 1,
            semester: 1,
            unit: '1. 9까지의 수',
            domain: '수와 연산',
            tags: ['수 세기'],
            front: { ko: '$5$보다 $1$ 큰 수는?', en: 'Number $1$ greater than $5$?' },
            back: { ko: '$6$ 입니다. 한글 테스트', en: 'It is $6$.' },
            review: { repetitions: 0, interval: 0, easeFactor: 2.5, dueDate: '2026-09-18' }
          }
        ]
      }
    ]
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should reject expired tokens before making network requests', async () => {
    const expiredConfig: GoogleDriveConfig = {
      accessToken: 'expired_token',
      expiresAt: Date.now() - 1000
    };

    await expect(pullFromGoogleDrive(expiredConfig)).rejects.toThrow(GoogleAuthError);
    await expect(pushToGoogleDrive(expiredConfig, sampleAppData)).rejects.toThrow(GoogleAuthError);
  });

  it('should find existing fileId by querying appDataFolder', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        files: [{ id: 'found_id_777', name: APP_DATA_FILENAME }]
      })
    } as unknown as Response);

    const fileId = await findAppDataFileId('test_token');
    expect(fileId).toBe('found_id_777');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('spaces=appDataFolder'),
      expect.objectContaining({
        headers: { Authorization: 'Bearer test_token' }
      })
    );
  });

  it('should return null when file is not found in appDataFolder', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ files: [] })
    } as unknown as Response);

    const fileId = await findAppDataFileId('test_token');
    expect(fileId).toBeNull();
  });

  it('should pull AppData from Google Drive with UTF-8 Hangul and KaTeX', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => sampleAppData
    } as unknown as Response);

    const result = await pullFromGoogleDrive(mockConfig);
    expect(result.fileId).toBe('mock_file_id_999');
    expect(result.data.decks[0].name.ko).toBe('초등 1학년 1학기 수학');
    expect(result.data.decks[0].cards[0].back.ko).toContain('한글 테스트');
  });

  it('should throw GoogleDriveError(404) when download target does not exist', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Not found' })
    } as unknown as Response);

    await expect(pullFromGoogleDrive(mockConfig)).rejects.toThrow(GoogleDriveError);
  });

  it('should update existing file via PATCH when fileId exists in config', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'mock_file_id_999' })
    } as unknown as Response);

    const result = await pushToGoogleDrive(mockConfig, sampleAppData);
    expect(result.fileId).toBe('mock_file_id_999');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://www.googleapis.com/upload/drive/v3/files/mock_file_id_999?uploadType=media',
      expect.objectContaining({
        method: 'PATCH',
        headers: expect.objectContaining({
          Authorization: 'Bearer test_token_123',
          'Content-Type': 'application/json; charset=UTF-8'
        })
      })
    );
  });

  it('should create new file in appDataFolder via multipart upload when no fileId exists', async () => {
    // 1st fetch: findAppDataFileId returns null
    // 2nd fetch: multipart POST creates file
    globalThis.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ files: [] })
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: 'new_created_file_888' })
      } as unknown as Response);

    const configWithoutFile: GoogleDriveConfig = {
      accessToken: 'test_token_123',
      expiresAt: Date.now() + 3600000
    };

    const result = await pushToGoogleDrive(configWithoutFile, sampleAppData);
    expect(result.fileId).toBe('new_created_file_888');
    expect(globalThis.fetch).toHaveBeenLastCalledWith(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test_token_123',
          'Content-Type': expect.stringContaining('multipart/related; boundary=')
        })
      })
    );
  });
});
