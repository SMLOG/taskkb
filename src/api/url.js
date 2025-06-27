import { jsonParse } from '@/lib/parse';

// Check if File System Access API is supported
const isFileSystemAccessSupported = 'showOpenFilePicker' in window && 'showSaveFilePicker' in window;

// In-memory cache for File objects, FileSystemFileHandle, and URL data
const fileCache = new Map();

// SessionStorage key for storing file metadata
const SESSION_STORAGE_KEY = 'cachedFiles';

// Function to load cached file names from sessionStorage
const loadCachedFilesFromSessionStorage = () => {
  const cachedFiles = sessionStorage.getItem(SESSION_STORAGE_KEY);
  return cachedFiles ? JSON.parse(cachedFiles) : [];
};

// Function to save file name to sessionStorage
const saveFileToSessionStorage = (fileName) => {
  const cachedFiles = loadCachedFilesFromSessionStorage();
  if (!cachedFiles.includes(fileName)) {
    cachedFiles.push(fileName);
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(cachedFiles));
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

// Function to pick a file using File System Access API or fallback to input element
export const pickFile = async () => {
  if (isFileSystemAccessSupported) {
    try {
      const [file, fileHandle, fileId] = await pick();
      return { mode: 'D', file: { handle: fileHandle, name: file.name, id: fileId } };
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('File selection was canceled');
      }
      throw error;
    }
  } else {
    // Fallback to traditional file input
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,.treegridio';
      input.onchange = (event) => {
        const file = event.target.files[0];
        if (!file) {
          reject(new Error('No file picked'));
        } else {
          const fileId = file.name; // Use file name as unique ID
          fileCache.set(fileId, { file, handle: null }); // Cache File with null handle
          saveFileToSessionStorage(fileId); // Save file name to sessionStorage
          resolve({ mode: 'D', file: { name: file.name, id: fileId, rawFile: file } });
        }
      };
      input.click();
    });
  }
};

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
      const content = jsonParse(text);
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

  // Handle file-based input
  let file;
  const cached = fileCache.get(path.id);
  if (cached) {
    file = cached.file; // Use cached File object
  } else if (isFileSystemAccessSupported) {
    try {
      const [afile] = await pick();
      file = afile;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('File selection was canceled');
      }
      throw error;
    }
  } else if (path.rawFile) {
    file = path.rawFile;
    fileCache.set(path.id, { file, handle: null }); // Cache File with null handle
    saveFileToSessionStorage(path.id); // Update sessionStorage
  } else {
    throw { code: 404, error: `No data found with filename ${path.id}` };
  }

  try {
    const text = await file.text();
    const content = jsonParse(text);
    return { content, path: { ...path, fileName: path.id } };
  } catch (error) {
    throw { code: 404, error: `Failed to read or parse file ${path.id}: ${error.message}` };
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

  const jsonString = JSON.stringify(dataObject, null, 2);

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

export const type = "Browser";