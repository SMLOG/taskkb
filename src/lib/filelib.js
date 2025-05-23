// Initialize IndexedDB
let db;
const dbRequest = indexedDB.open('tododb', 1);
dbRequest.onupgradeneeded = (event) => {
    db = event.target.result;
    db.createObjectStore('files', { keyPath: 'id' });
};
dbRequest.onsuccess = (event) => {
    db = event.target.result;
};

// Global variables
let fileHandle = null;

// Open a local file
export async function openFile(setValue) {
    try {
        [fileHandle] = await window.showOpenFilePicker({
            types: [{ description: 'JSON FILE', accept: { 'text/*': ['.json'] } }]
        });
        const file = await fileHandle.getFile();
        const content = await file.text();
        setValue(content);

    } catch (err) {
        if (err.name !== 'AbortError') {
        }
    }
}

// Save to local file
export async function saveFile(content) {
    if (!fileHandle) {
        return;
    }
    try {
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
    } catch (err) {
    }
}

// Save to IndexedDB
export function saveToIndexedDB(content) {
    const transaction = db.transaction(['files'], 'readwrite');
    const store = transaction.objectStore('files');
    store.put({ id: 'currentFile', content });
}

// Load from IndexedDB
export function loadFromIndexedDB(setValue) {
    const transaction = db.transaction(['files'], 'readonly');
    const store = transaction.objectStore('files');
    const request = store.get('currentFile');
    request.onsuccess = () => {
        if (request.result) {
            setValue(request.result.content);
        }
    };
}