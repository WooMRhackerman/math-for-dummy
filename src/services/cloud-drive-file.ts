import { get, set, del } from 'idb-keyval';
import { AppData } from '../types';

const CLOUD_FILE_HANDLE_KEY = 'math_for_dummy_cloud_file_handle';
const CLOUD_FILE_NAME_KEY = 'math_for_dummy_cloud_file_name';

export interface CloudDriveFileState {
  connected: boolean;
  fileName?: string;
  lastSynced?: string;
  supported: boolean;
}

/**
 * Checks if the browser supports the File System Access API (Chrome, Edge, Opera, etc.)
 */
export function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showOpenFilePicker' in window && 'showSaveFilePicker' in window;
}

/**
 * Loads the saved FileSystemFileHandle from IndexedDB.
 */
export async function loadCloudDriveFileHandle(): Promise<FileSystemFileHandle | null> {
  if (!isFileSystemAccessSupported()) return null;
  try {
    const handle = await get<FileSystemFileHandle>(CLOUD_FILE_HANDLE_KEY);
    if (!handle) return null;

    // Verify permission
    const queryRes = await handle.queryPermission({ mode: 'readwrite' });
    if (queryRes === 'granted') {
      return handle;
    }
    // If prompt is required, we return handle; the caller can prompt when needed
    return handle;
  } catch (err) {
    console.error('Failed to load cloud drive file handle:', err);
    return null;
  }
}

/**
 * Saves a FileSystemFileHandle to IndexedDB.
 */
export async function saveCloudDriveFileHandle(handle: FileSystemFileHandle): Promise<void> {
  try {
    await set(CLOUD_FILE_HANDLE_KEY, handle);
    await set(CLOUD_FILE_NAME_KEY, handle.name);
  } catch (err) {
    console.error('Failed to save file handle:', err);
  }
}

/**
 * Loads the saved connected file name.
 */
export async function loadCloudDriveFileName(): Promise<string> {
  try {
    const name = await get<string>(CLOUD_FILE_NAME_KEY);
    return name || '';
  } catch {
    return '';
  }
}

/**
 * Clears the connected cloud drive file handle from IndexedDB.
 */
export async function clearCloudDriveFileHandle(): Promise<void> {
  try {
    await del(CLOUD_FILE_HANDLE_KEY);
    await del(CLOUD_FILE_NAME_KEY);
  } catch (err) {
    console.error('Failed to clear file handle:', err);
  }
}

/**
 * Prompts the user to pick an existing math data file from Google Drive / OneDrive / Local folder.
 */
export async function pickCloudDriveFile(): Promise<{
  handle: FileSystemFileHandle;
  data: AppData;
  fileName: string;
}> {
  if (!isFileSystemAccessSupported()) {
    throw new Error('FILE_SYSTEM_ACCESS_NOT_SUPPORTED');
  }

  const [handle] = await window.showOpenFilePicker({
    types: [
      {
        description: 'Math Study Data (JSON)',
        accept: {
          'application/json': ['.json']
        }
      }
    ],
    multiple: false
  });

  const file = await handle.getFile();
  const text = await file.text();
  const data: AppData = JSON.parse(text);

  if (!data.decks || !Array.isArray(data.decks)) {
    throw new Error('INVALID_DATA_FORMAT');
  }

  await saveCloudDriveFileHandle(handle);

  return {
    handle,
    data,
    fileName: handle.name
  };
}

/**
 * Prompts the user to create a new file in their Google Drive / OneDrive / Local folder.
 */
export async function createCloudDriveFile(data: AppData): Promise<{
  handle: FileSystemFileHandle;
  fileName: string;
}> {
  if (!isFileSystemAccessSupported()) {
    throw new Error('FILE_SYSTEM_ACCESS_NOT_SUPPORTED');
  }

  const handle = await window.showSaveFilePicker({
    suggestedName: 'math_study_data.json',
    types: [
      {
        description: 'Math Study Data (JSON)',
        accept: {
          'application/json': ['.json']
        }
      }
    ]
  });

  await writeDataToFileHandle(handle, data);
  await saveCloudDriveFileHandle(handle);

  return {
    handle,
    fileName: handle.name
  };
}

/**
 * Reads AppData directly from the connected FileSystemFileHandle.
 */
export async function readDataFromFileHandle(handle: FileSystemFileHandle): Promise<AppData> {
  const perm = await handle.queryPermission({ mode: 'read' });
  if (perm !== 'granted') {
    const req = await handle.requestPermission({ mode: 'read' });
    if (req !== 'granted') {
      throw new Error('PERMISSION_DENIED');
    }
  }

  const file = await handle.getFile();
  const text = await file.text();
  const data: AppData = JSON.parse(text);

  if (!data.decks || !Array.isArray(data.decks)) {
    throw new Error('INVALID_DATA_FORMAT');
  }

  return data;
}

/**
 * Writes AppData directly to the connected FileSystemFileHandle.
 */
export async function writeDataToFileHandle(
  handle: FileSystemFileHandle,
  data: AppData
): Promise<void> {
  const perm = await handle.queryPermission({ mode: 'readwrite' });
  if (perm !== 'granted') {
    const req = await handle.requestPermission({ mode: 'readwrite' });
    if (req !== 'granted') {
      throw new Error('PERMISSION_DENIED');
    }
  }

  const writable = await handle.createWritable();
  await writable.write(JSON.stringify(data, null, 2));
  await writable.close();
}
