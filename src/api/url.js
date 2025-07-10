import { Json.parse } from '@/lib/parse';
import { pickUrl } from './urlPickfile';

// Check if File System Access API is supported
const isFileSystemAccessSupported = 'showOpenFilePicker' in window && 'showSaveFilePicker' in window;

// In-memory cache for File objects, FileSystemFileHandle, and URL data
const fileCache = new Map();

// SessionStorage key for storing file metadata
const SESSION_STORAGE_KEY = 'cachedFiles';

// Function to load cached file names from sessionStorage
const loadCachedFilesFromSessionStorage = () => {
  const cachedFiles = sessionStorage.getItem(SESSION_STORAGE_KEY);
  return cachedFiles ? Json.parse(cachedFiles) : [];
};

// Function to save file name to sessionStorage
const saveFileToSessionStorage = (fileName) => {
  const cachedFiles = loadCachedFilesFromSessionStorage();
  if (!cachedFiles.includes(fileName)) {
    cachedFiles.push(fileName);
    sessionStorage.setItem(SESSION_STORAGE_KEY, Json.stringify(cachedFiles));
  }
};

async function pick() {
  const [fileHandle] = await window.showOpenFilePicker({
    types: [
      {
        description: 'JSON Files',
        accept: { '*/*': ['.json', '.treegridio'] },
      },
    ],
  });
  const file = await fileHandle.getFile();
  const fileId = file.name; // Use file name as unique ID
  fileCache.set(fileId, { file, handle: fileHandle }); // Cache both File and handle
  saveFileToSessionStorage(fileId); // Save file name to sessionStorage
  return [file, fileHandle, fileId];
}


// Helper function to check if a string is a URL
const isURL = (str) => {
  return /^https?:\/\//i.test(str);
};

// Read JSON content from a file or URL
export async function readJsonAttachment(path) {
  if (!path || typeof path !== 'object' || !path.id) {
    throw new Error('Invalid or missing path');
  }

  // Handle URL-based input
  if (isURL(path.id)) {
    try {
      const response = await fetch(path.id);
      if (!response.ok) {
        throw new Error(`Failed to fetch URL ${path.id}: ${response.statusText}`);
      }
      const text = await response.text();
      const content = Json.parse(text);
      // Cache the URL data as a File object for consistency
      const fileName = new URL(path.id).pathname.split('/').pop() || 'url_data.json';
      const file = new File([text], fileName, { type: 'application/json' });
      fileCache.set(fileName, { file, handle: null });
      saveFileToSessionStorage(fileName);
      return { content, path: { ...path, fileName } };
    } catch (error) {
      throw { code: 404, error: `Failed to read or parse URL ${path.id}: ${error.message}` };
    }
  }

};

// Write JSON content to a file
export async function writeObjectToJsonAttachment(dataObject, path) {
  if (!dataObject || typeof dataObject !== 'object') {
    throw new Error('Invalid or missing data object');
  }
  if (!path || typeof path !== 'object' || !path.fileName) {
    throw new Error('Invalid or missing path');
  }

  const jsonString = Json.stringify(dataObject, null, 2);

  if (isFileSystemAccessSupported) {
    try {
      // Retrieve fileHandle from cache
      const cached = fileCache.get(path.fileName);
      const fileHandle = cached?.handle;
      if (!fileHandle) {
        // Check sessionStorage and prompt re-selection if needed
        const cachedFiles = loadCachedFilesFromSessionStorage();
        if (cachedFiles.includes(path.fileName)) {
          const [newFileHandle] = await window.showOpenFilePicker({
            types: [
              {
                description: 'JSON Files',
                accept: { 'application/json': ['.json', '.treegridio'] },
              },
            ],
            suggestedName: path.fileName,
          });
          const file = await newFileHandle.getFile();
          fileCache.set(path.fileName, { file, handle: newFileHandle });
          saveFileToSessionStorage(path.fileName); // Update sessionStorage
          return writeObjectToJsonAttachment(dataObject, { ...path, handle: newFileHandle }); // Retry with new handle
        } else {
          throw new Error(`No file handle available for ${path.fileName}. Cannot overwrite file.`);
        }
      }
      // Verify write permission
      const permission = await fileHandle.queryPermission({ mode: 'readwrite' });
      if (permission !== 'granted') {
        await fileHandle.requestPermission({ mode: 'readwrite' });
      }
      const writable = await fileHandle.createWritable();
      await writable.write(jsonString);
      await writable.close();
      // Update cache with new File object and existing handle after writing
      const file = await fileHandle.getFile();
      fileCache.set(path.fileName, { file, handle: fileHandle });
      saveFileToSessionStorage(path.fileName); // Update sessionStorage
      return { ...path, id: path.fileName, handle: fileHandle };
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('File write permission was denied');
      }
      throw error;
    }
  } else {
    // Fallback to download file (no direct overwrite possible, so prompt download)
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = path.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    // Update cache with new Blob-based File object
    const file = new File([blob], path.fileName, { type: 'application/json' });
    fileCache.set(path.fileName, { file, handle: null }); // No handle for fallback
    saveFileToSessionStorage(path.fileName); // Update sessionStorage
    return { ...path, id: path.fileName };
  }
};

export function authorize() {
  return true;
}

const typeCode = 'U';
export const pickFile = async () => {
  const file = await pickUrl();
  return { mode: typeCode, file: { ...file, id: file.filename } };
};

export const type = "Browser";