import { jsonParse } from '@/lib/parse';
import { pickFile as pf } from './browserPickfile';

// Function to open the IndexedDB database
function openDatabase(dbName, storeName) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);
        
        request.onerror = (event) => {
            reject(event.target.error);
        };
        
        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            // Create the "files" object store if it doesn't exist
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: 'id' });
            }
        };
    });
}

export const pickFile = async () => {
    const file = await pf();
    return { mode: 'L', file: { ...file, id: file.filename } };
};

export async function readJsonAttachment(path) {
    if (!path || typeof path !== 'object') {
        throw new Error('Invalid or missing path');
    }

    const db = await openDatabase('myDatabase', 'files');
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['files'], 'readonly');
        const store = transaction.objectStore('files');
        const request = store.get(path.id);

        request.onerror = (event) => {
            reject({ code: 404, error: `No data found with filename ${path.id}` });
        };

        request.onsuccess = (event) => {
            const storedData = event.target.result;
            if (!storedData) {
                reject({ code: 404, error: `No data found with filename ${path.id}` });
            } else {
                const content = jsonParse(storedData.data);
                resolve({ content, path: { ...path, fileName: path.id } });
            }
        };
    });
}

export async function writeObjectToJsonAttachment(dataObject, path) {
    if (!dataObject || typeof dataObject !== 'object') {
        throw new Error('Invalid or missing data object');
    }
    if (!path || typeof path !== 'object') {
        throw new Error('Invalid or missing path');
    }

    const db = await openDatabase('myDatabase', 'files');
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['files'], 'readwrite');
        const store = transaction.objectStore('files');

        const jsonString = JSON.stringify(dataObject, null, 2);
        const request = store.put({ id: path.fileName, data: jsonString });

        request.onerror = (event) => {
            reject(event.target.error);
        };

        request.onsuccess = () => {
            resolve({ ...path, id: path.fileName });
        };
    });
}

export const type = "Browser";