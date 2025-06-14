import { jsonParse } from '@/lib/parse';

export async function readJsonAttachment(filename) {
    if (!filename || typeof filename !== 'string') {
        return { error: 'Invalid or missing filename' };
    }

    try {
        const storageKey = `${filename}`;
        const storedData = localStorage.getItem(storageKey);

        if (!storedData) {
            return { error: `No data found with filename ${filename}` };
        }

        const content = jsonParse(storedData);
        return { content };
    } catch (error) {
        console.error(`Error reading from localStorage: ${error.message}`);
        return { error: error.message };
    }
}

export async function writeObjectToJsonAttachment(dataObject, filename) {
    if (!dataObject || typeof dataObject !== 'object') {
        return { success: false, error: 'Invalid or missing data object' };
    }
    if (!filename || typeof filename !== 'string') {
        return { success: false, error: 'Invalid or missing filename' };
    }

    try {
        const storageKey = `jira-${filename}`;
        const jsonString = JSON.stringify(dataObject, null, 2);
        
        localStorage.setItem(storageKey, jsonString);
        return { success: true };
    } catch (error) {
        console.error(`Error writing to localStorage: ${error.message}`);
        return { success: false, error: error.message };
    }
}