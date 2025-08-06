import Json from '@/lib/Json';
import { pickFile as pf } from './browserPickfile';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

// Firebase configuration (replace with your actual config)
const firebaseConfig = {
    apiKey: "AIzaSyAkqX4_fR5nlz95-tw38eUX5Z-3XZrZnpc",
    authDomain: "treegrid-78b5c.firebaseapp.com",
    projectId: "treegrid-78b5c",
    storageBucket: "treegrid-78b5c.firebasestorage.app",
    messagingSenderId: "537063362185",
    appId: "1:537063362185:web:7ddbdd9af21fcbd691c058",
    measurementId: "G-4P2V3F7102"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const typeCode = 'B';

export const pickFile = async () => {
    const file = await pf();
    return { mode: typeCode, file: { ...file, id: file.filename } };
};

export async function readJsonAttachment(path) {
    if (!path || typeof path !== 'object' || !path.id) {
        throw new Error('Invalid or missing path');
    }

    try {
        const docRef = doc(db, 'files', path.id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            throw { code: 404, error: `No data found with filename ${path.id}` };
        }

        const storedData = docSnap.data();
        const content = Json.parse(storedData.data);
        return { content, path: { ...path, fileName: path.id } };
    } catch (error) {
        throw { code: error.code || 500, error: error.message || `Error reading data for ${path.id}` };
    }
}

export async function writeObjectToJsonAttachment(dataObject, path) {
    if (!dataObject || typeof dataObject !== 'object') {
        throw new Error('Invalid or missing data object');
    }
    if (!path || typeof path !== 'object' || !path.fileName) {
        throw new Error('Invalid or missing path');
    }

    try {
        const jsonString = Json.stringify(dataObject, null, 2);
        const docRef = doc(db, 'files', path.fileName);
        await setDoc(docRef, { data: jsonString });

        return { ...path, id: path.fileName };
    } catch (error) {
        throw { code: error.code || 500, error: error.message || `Error writing data for ${path.fileName}` };
    }
}

export const type = "Browser";