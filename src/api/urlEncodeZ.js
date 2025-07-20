import Json from '@/lib/Json';
import { pickUrl } from './urlPickfile';
import {writeObjectToJsonAttachment as deviceWriteObjectToJsonAttachment} from './device';


async function compressAndEncode(str) {
  // Gzip compress
  const stream = new Blob([str]).stream();
  const compressedStream = stream.pipeThrough(new CompressionStream('gzip'));
  const compressedBlob = await new Response(compressedStream).blob();
  
  // Read as Base64
  const base64 = await new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(compressedBlob);
  });
  
  // URI encode
  return encodeURIComponent(base64);
}

async function decodeAndDecompress(encodedStr) {
  // URI decode
  const base64 = decodeURIComponent(encodedStr);
  
  // Convert from Base64
  const byteString = atob(base64);
  const bytes = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    bytes[i] = byteString.charCodeAt(i);
  }
  
  // Gzip decompress
  const stream = new Blob([bytes]).stream();
  const decompressedStream = stream.pipeThrough(new DecompressionStream('gzip'));
  return await new Response(decompressedStream).text();
}



// Read JSON content from a file or URL
export async function readJsonAttachment(path) {
  if (!path || typeof path !== 'object' || !path.id) {
    throw new Error('Invalid or missing path');
  }

 
    try {
      
      const text = await  decodeAndDecompress(path.id);
      const content = Json.parse(text);
      // Cache the URL data as a File object for consistency
      const fileName = '';
      return { content, path: { ...path, fileName } };
    } catch (error) {
      throw { code: 404, error: `Failed to read or parse URL ${path.id}: ${error.message}` };
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

  const jsonStr = await compressAndEncode( Json.stringify(dataObject, null, 2));
 return { ...path, id: jsonStr}; // deviceWriteObjectToJsonAttachment(dataObject, {...path,mode:'Z'});

};

export function authorize() {
  return true;
}

const typeCode = 'Z';
export const pickFile = async () => {
  const file = await pickUrl();
  return { mode: typeCode, file: { ...file, id: file.filename } };
};

export const type = "urlz";