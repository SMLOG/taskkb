import Json from '@/lib/Json';
import { pickUrl } from './urlPickfile';
import {writeObjectToJsonAttachment as deviceWriteObjectToJsonAttachment} from './device';


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

 return  deviceWriteObjectToJsonAttachment(dataObject, {...path,mode:'D'});

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