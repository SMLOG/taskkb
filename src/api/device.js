import { jsonParse } from '@/lib/parse';

// Check if File System Access API is supported
const isFileSystemAccessSupported = 'showOpenFilePicker' in window && 'showSaveFilePicker' in window;

// In-memory cache for File objects and FileSystemFileHandle
const fileCache = new Map();

// Function to pick a file using File System Access API or fallback to input element
export const pickFile = async () => {
  if (isFileSystemAccessSupported) {
    try {
      const [fileHandle] = await window.showOpenFilePicker({
        types: [
          {
            description: 'JSON Files',
            accept: { 'application/json': ['.json', '.treegridio'] },
          },
        ],
      });
      const file = await fileHandle.getFile();
      const fileId = file.name; // Use file name as unique ID
      fileCache.set(fileId, { file, handle: fileHandle }); // Cache both File and handle
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
          resolve({ mode: 'D', file: { name: file.name, id: fileId, rawFile: file } });
        }
      };
      input.click();
    });
  }
};

// Read JSON content from a file
export async function readJsonAttachment(path) {
  if (!path || typeof path !== 'object' || !path.id) {
    throw new Error('Invalid or missing path');
  }

  let file;
  const cached = fileCache.get(path.id);
  if (cached) {
    file = cached.file; // Use cached File object
  } else if (isFileSystemAccessSupported && cached?.handle) {
    try {
      file = await cached.handle.getFile();
      fileCache.set(path.id, { file, handle: path.handle }); // Cache both File and handle
    } catch (error) {
      throw { code: 404, error: `No data found with filename ${path.id}` };
    }
  } else if (path.rawFile) {
    file = path.rawFile;
    fileCache.set(path.id, { file, handle: null }); // Cache File with null handle
  } else if(window.showOpenFilePicker){
    const [fileHandle] = await window.showOpenFilePicker({
        types: [
          {
            description: 'JSON Files',
            accept: { 'application/json': ['.json','.treegridio'] },
          },
        ],
      });
       file = await fileHandle.getFile();

      const fileId = file.name; // Use file name as unique ID
      fileCache.set(fileId, { file, handle: fileHandle }); // Cache both File and handle
  }else {
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
        throw new Error(`No file handle available for ${path.fileName}. Cannot overwrite file.`);
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
    return { ...path, id: path.fileName };
  }
};

export const type = "Browser";