import { jsonParse } from '@/lib/parse';

export async function readJsonAttachment(path) {
    if (!path || typeof path !== 'object') {
        throw new Error('Invalid or missing path')
    }

        const storageKey = `${path.id}`;
        const storedData = localStorage.getItem(storageKey);

        if (!storedData) {
            throw new Error(`No data found with filename ${path.id}`);
        }

        const content = jsonParse(storedData);
        return { content,path };
  
}

export async function writeObjectToJsonAttachment(dataObject, path) {
    if (!dataObject || typeof dataObject !== 'object') {
        throw new Error('Invalid or missing data object')
    }
    if (!path || typeof path !== 'object') {
        throw new Error('Invalid or missing path')
    }

        const storageKey = `${path.fileName}`;
        const jsonString = JSON.stringify(dataObject, null, 2);
        
        localStorage.setItem(storageKey, jsonString);
        return { id: path.fileName };

}
export const type = "Browser";