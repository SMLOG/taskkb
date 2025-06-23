import { jsonParse } from '@/lib/parse';
import { loadScript } from '@/lib/net';

// Constants
const clientId = '111515033736-dffaqu4qg36n2ovfhpaa7qgtndd3u4q2.apps.googleusercontent.com';

let tokenClient = null;




// Fetch user info from Google API
export const fetchUserInfo = async (token) => {
    try {
        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
            const userData = await response.json();
            return {
                username: userData.name || userData.email.split('@')[0],
                email: userData.email,
            };
        } else {
            const errorData = await response.json();
            throw new Error(`Failed to fetch user info: ${errorData.error.message}`);
        }
    } catch (error) {
        console.error('Error fetching user info:', error);
        console.error('Failed to fetch user info: ' + error.message);
        return null;
    }
};

// Initialize Google Sign-In
const initGoogleSignIn = async () => {
    let returnInfo = {};
    if (typeof google === 'undefined' || !google.accounts.oauth2) {
        try {
            await loadScript('https://accounts.google.com/gsi/client');
            await loadScript('https://apis.google.com/js/api.js');
        } catch (error) {
            console.error('Script loading error:', error);
        }
    }

    // Ensure Google API is loaded
    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
        console.error('Google API script not loaded.');
        throw new Error('Google API is not available. Please try again later.');
    }


    // Create a promise to handle token response
    const tokenResponse = await new Promise((resolve, reject) => {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
            callback: async (tokenResponse) => {
                console.log('Token Response:', tokenResponse);
                if (tokenResponse?.access_token) {
                    resolve(tokenResponse);
                } else {
                    console.error('No access token received:', tokenResponse);
                    reject(new Error('Failed to obtain access token.'));
                }
            },
            error_callback: (error) => {
                reject(error);
            },
        });

        // Trigger the token request
        tokenClient.requestAccessToken({ prompt: 'consent' });
    });


    returnInfo.accessToken = tokenResponse.access_token;

    // Fetch user info
    const userInfo = await fetchUserInfo(tokenResponse.access_token);
    if (userInfo?.email) {
        await loadPicker();
        returnInfo = { ...returnInfo, ...userInfo };
        return returnInfo;
    }

    console.error('Invalid user info:', userInfo);
    throw new Error('Failed to fetch user information.');





};

export async function authorize(auth, rememberMe) {
    console.log('Initializing token client');
    if (auth.accessToken) return auth;
    else return await initGoogleSignIn(auth, rememberMe);

}


const loadPicker = async () => {
    if (typeof gapi === 'undefined') {
        console.error('Google API Client Library not loaded');
        return;
    }
    return new Promise((resolve) => {
        gapi.load('picker', { callback: resolve });
    })
};

// Refresh access token
const refreshAccessToken = async () => {
    return new Promise((resolve, reject) => {
        if (tokenClient) {
            tokenClient.requestAccessToken({
                prompt: '',
                callback: async (tokenResponse) => {
                    if (tokenResponse && tokenResponse.access_token) {
                        accessToken.value = tokenResponse.access_token;
                        // Update userStore with new accessToken
                        const userInfo = await fetchUserInfo(tokenResponse.access_token);
                        if (userInfo) {
                            const existingUser = userStore.getUserByEmail(userInfo.email);
                            if (existingUser) {
                                userStore.updateUser(userInfo.email, {
                                    accessToken: tokenResponse.access_token,
                                });
                                console.log('Access token updated in store for:', userInfo.email);
                            }
                        }
                        resolve(accessToken.value);
                    } else {
                        reject(new Error('Failed to refresh access token'));
                    }
                },
            });
        } else {
            reject(new Error('Token client not initialized'));
        }
    });
};

// Pick folder with write permission filter
export const pickFolder = async (auth) => {
    const authInfo = await authorize(auth);
    await loadPicker();
    const doc = await new Promise((resolve, reject) => {

        const pickerCallback = (data) => {
            if (data.action === google.picker.Action.PICKED) {
                resolve(data.docs[0]);
            }
        };
        const picker = new google.picker.PickerBuilder()
            .setOAuthToken(authInfo.accessToken)
            .addView(
                new google.picker.DocsView()
                    .setIncludeFolders(true)
                    .setSelectFolderEnabled(true)
                    .setParent('root')
            )
            .addView(
                new google.picker.DocsView(google.picker.ViewId.DOCS).setLabel('Google Drive').setMimeTypes('application/vnd.google-apps.document')
            )
            .addView(
                new google.picker.DocsView(google.picker.ViewId.SHARED_WITH_ME).setLabel('Shared drives')
            )
            .addView(
                new google.picker.DocsView(google.picker.ViewId.RECENTLY_PICKED).setLabel('Recent')
            )
            .enableFeature(google.picker.Feature.SUPPORT_DRIVES)
            .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
            .setCallback(pickerCallback)
            .build();
        picker.setVisible(true);
    });
    console.log(doc)
    authInfo.parent = doc;
    return authInfo;

};

// Pick file
const pickFile = async () => {
    await authorize();
    const view = new google.picker.DocsView(google.picker.ViewId.DOCS).setMimeTypes('text/plain');

    const picker = new google.picker.PickerBuilder()
        .addView(view)
        .setOAuthToken(accessToken.value)
        .setCallback((data) => {
            if (data.action === google.picker.Action.PICKED) {
                selectedFileId.value = data.docs[0].id;
                console.error('Selected file: ' + data.docs[0].name);
            }
        })
        .build();
    picker.setVisible(true);
};

const writeFile = async (dataObj, path, auth) => {
    if (!dataObj || typeof dataObj !== 'object') {
        throw new Error('Invalid or missing data object');

    }
    if (path && typeof path !== 'object') {
        throw new Error('Invalid path');
    }

    const parentFolderId = path?.parent?.id;
    if (parentFolderId) {
        let permissionData;
        const permissionCheck = await fetch(
            `https://www.googleapis.com/drive/v3/files/${parentFolderId}/permissions/me?supportsAllDrives=true`,
            {
                method: 'GET',
                headers: new Headers({ Authorization: `Bearer ${auth.accessToken}` }),
            }
        );

        if (permissionCheck.status === 401) {
            auth.accessToken = await refreshAccessToken();
            const retryCheck = await fetch(
                `https://www.googleapis.com/drive/v3/files/${parentFolderId}/permissions/me?supportsAllDrives=true`,
                {
                    headers: new Headers({ Authorization: `Bearer ${auth.accessToken}` }),
                }
            );

            if (!retryCheck.ok) {
                const errorData = await retryCheck.json();
                throw new Error(`Failed to verify permissions: ${errorData.error.message}`);
            }

            permissionData = await retryCheck.json();
        } else if (!permissionCheck.ok) {
            const errorData = await permissionCheck.json();
            throw new Error(`Failed to check permissions: ${errorData.error.message}`);
        } else {
            permissionData = await permissionCheck.json();
        }

        if (!['writer', 'owner'].includes(permissionData.role)) {
            throw new Error('You do not have write permission for the selected folder. Please choose another folder.');
        }

    }

    // Serialize dataObj to JSON
    const fileContent = JSON.stringify(dataObj, null, 2); // Pretty-print JSON for readability
    const blob = new Blob([fileContent], { type: 'application/json' });
    const form = new FormData();

    // Determine if we're creating a new file or updating an existing one
    const isUpdate = path?.id !== undefined && path?.id?.trim() !== '';
    const url = isUpdate
        ? `https://www.googleapis.com/upload/drive/v3/files/${path?.id?.trim()}?uploadType=multipart&fields=id&supportsAllDrives=true`
        : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true';
    const method = isUpdate ? 'PATCH' : 'POST';

    // Include metadata only for new files
    if (!isUpdate) {
        const fileMetadata = {
            name: path.fileName, // Changed to .json to reflect content type
            mimeType: 'application/json', // Set MIME type to JSON
            parents: parentFolderId ? [parentFolderId] : [],
        };
        form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
    }

    form.append('file', blob);



    const boundary = `boundary_${crypto.randomUUID().replace(/-/g, '')}`;

    // Prepare metadata
    const metadata = { name: path.fileName };

    // Encode JSON data as base64
    const base64Data = btoa(fileContent);
    // Construct multipart body
    const body = [
        `--${boundary}`,
        'Content-Type: application/json; charset=UTF-8',
        '',
        JSON.stringify(metadata),
        `--${boundary}`,
        'Content-Transfer-Encoding: base64',
        '',
        base64Data,
        `--${boundary}--`,
    ].join('\r\n');



    // Send request
    const response = await fetch(url, {
        method,
        headers: {
            'Authorization': `Bearer ${auth.accessToken}`,
            'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Upload failed: ${error.error.message}`);
    }



    const data = await response.json();
    if (response.ok) {
        console.log(data);
        console.log(`File ${isUpdate ? 'updated' : 'created'}:`, data);
        return data;
    }

    throw new Error(`Error ${isUpdate ? 'updating' : 'creating'} file:`, data);


};

// Read selected file
const readFile = async (path, auth) => {
    if (!auth?.accessToken) {
        throw new Error('No access token found. Please sign in again.');
    }
    if (!path?.id) {
        throw new Error('Please select a file to read first.');
    }


    // Step 1: Fetch file metadata (version, modifiedTime, lastModifyingUser, etc.)
    const metadataResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${path.id}?fields=id,name,version,modifiedTime,description,lastModifyingUser&supportsAllDrives=true`,
        {
            method: 'GET',
            headers: new Headers({ Authorization: `Bearer ${auth.accessToken}` }),
        }
    );

    if (!metadataResponse.ok) {
        const errorData = await metadataResponse.json();
        throw new Error('Error fetching metadata:', errorData);
    }

    const metadata = await metadataResponse.json();
    console.log('File Metadata:', metadata);

    const contentResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${path.id}?alt=media&supportsAllDrives=true`,
        {
            method: 'GET',
            headers: new Headers({ Authorization: `Bearer ${auth.accessToken}` }),
        }
    );

    if (contentResponse.ok) {
        const content = await contentResponse.text();
        return {
            content, // File content as text
            metadata, // File metadata (version, modifiedTime, lastModifyingUser, etc.)
        };
    }
    const errorData = await contentResponse.json();
    throw new Error('Error reading file content:', errorData);


};



export async function readJsonAttachment(path, auth) {
    if (!path || typeof path !== 'object') {
        throw 'Invalid path';
    }

    let result = await readFile(path, auth);
    let content = result?.content ? jsonParse(result.content) : null;
    return { path, content, };


}

export async function writeObjectToJsonAttachment(dataObject, path, auth) {
    return await writeFile(dataObject, path, auth);

}

export const type = "GoogleDrive";