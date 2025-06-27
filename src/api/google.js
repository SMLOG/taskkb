import { jsonParse } from '@/lib/parse';
import { loadScript } from '@/lib/net';
import base64js from 'base64-js';

// Constants
const clientId = '111515033736-dffaqu4qg36n2ovfhpaa7qgtndd3u4q2.apps.googleusercontent.com';

let tokenClient = null;

function toBase64(fileContent) {
    try {
      // Handle string input
      if (typeof fileContent === 'string') {
        fileContent = new TextEncoder().encode(fileContent);
      }
      // Handle ArrayBuffer or Uint8Array
      return base64js.fromByteArray(fileContent);
    } catch (e) {
      console.error('Error encoding to Base64:', e);
      throw e;
    }
  }
  
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
        return null;
    }
};

async function loadJss() {
    if (typeof google === 'undefined' || !google.accounts.oauth2) {
        try {
            await loadScript('https://accounts.google.com/gsi/client');
            await loadScript('https://apis.google.com/js/api.js');
        } catch (error) {
            console.error('Script loading error:', error);
        }
    }
}

// Initialize Google Sign-In
const initGoogleSignIn = async () => {
    let returnInfo = {};
    await loadJss();

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
    await loadJss();

    console.log('Initializing token client');
    if (auth?.accessToken) return auth;
    else return await initGoogleSignIn(auth, rememberMe);
}

const loadPicker = async () => {
    if (typeof gapi === 'undefined') {
        console.error('Google API Client Library not loaded');
        return;
    }
    return new Promise((resolve) => {
        gapi.load('picker', { callback: resolve });
    });
};

// Load Google Drive Share Client
const loadShareClient = async () => {
    if (typeof gapi === 'undefined') {
        console.error('Google API Client Library not loaded');
        return;
    }
    return new Promise((resolve) => {
        gapi.load('drive-share', { callback: resolve });
    });
};

// Open Google Drive Share Dialog
export const openShareDialog = async (auth, fileId) => {
    if (!auth?.accessToken) {
        throw new Error('No access token found. Please sign in again.');
    }
    if (!fileId) {
        throw new Error('File or folder ID is required.');
    }

    const authInfo = await authorize(auth);
    await loadShareClient();

    try {
        const shareClient = new gapi.drive.share.ShareClient();
        shareClient.setOAuthToken(authInfo.accessToken);
        shareClient.setItemIds([fileId]);
        shareClient.showSettingsDialog();
        return { success: true, message: 'Share dialog opened successfully.' };
    } catch (error) {
        console.error('Error opening share dialog:', error);
        throw new Error(`Failed to open share dialog: ${error.message}`);
    }
};

// Get share link for a file or folder
export const getShareLink = async (auth, fileId) => {
    if (!auth?.accessToken) {
        throw new Error('No access token found. Please sign in again.');
    }
    if (!fileId) {
        throw new Error('File or folder ID is required.');
    }

    const authInfo = await authorize(auth);

    try {
        const response = await fetch(
            `https://www.googleapis.com/drive/v3/files/${fileId}?fields=webViewLink,permissions&supportsAllDrives=true`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${authInfo.accessToken}`,
                },
            }
        );

        if (!response.ok) {
            if (response.status === 401) {
                authInfo.accessToken = await refreshAccessToken();
                const retryResponse = await fetch(
                    `https://www.googleapis.com/drive/v3/files/${fileId}?fields=webViewLink,permissions&supportsAllDrives=true`,
                    {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${authInfo.accessToken}`,
                        },
                    }
                );

                if (!retryResponse.ok) {
                    const errorData = await retryResponse.json();
                    throw new Error(`Failed to fetch share link: ${errorData.error.message}`);
                }

                const data = await retryResponse.json();
                return data.webViewLink || null;
            } else {
                const errorData = await response.json();
                throw new Error(`Failed to fetch share link: ${errorData.error.message}`);
            }
        }

        const data = await response.json();
        return data.webViewLink || null;
    } catch (error) {
        console.error('Error fetching share link:', error);
        throw new Error(`Failed to fetch share link: ${error.message}`);
    }
};

// Refresh access token
const refreshAccessToken = async () => {
    return new Promise((resolve, reject) => {
        if (tokenClient) {
            tokenClient.requestAccessToken({
                prompt: '',
                callback: async (tokenResponse) => {
                    if (tokenResponse && tokenResponse.access_token) {
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
                        resolve(tokenResponse.access_token);
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
                new google.picker.DocsView(google.picker.ViewId.SHAREDADA).setLabel('Shared drives')
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
    console.log(doc);
    authInfo.parent = doc;
    return authInfo;
};

// Pick file
export const pickFile = async (auth) => {
    await loadJss();
    const newAuth = await authorize(auth);
    await loadPicker();
    const view = new google.picker.DocsView(google.picker.ViewId.DOCS).setMimeTypes('application/json').setQuery('*.treegridio');

    return new Promise((resolve, reject) => {
        const picker = new google.picker.PickerBuilder()
            .addView(view)
            .setOAuthToken(newAuth.accessToken)
            .setCallback((data) => {
                if (data.action === google.picker.Action.PICKED) {
                    console.log('Selected file: ' + data.docs[0].name);
                    resolve({ ...newAuth, file: data.docs[0] });
                }
            })
            .build();
        picker.setVisible(true);
    });
};

export const writeFile = async (dataObj, path, auth) => {
    if (!dataObj || typeof dataObj !== 'object') {
        throw new Error('Invalid or missing data object');
    }
    if (!path || typeof path !== 'object') {
        throw new Error('Invalid path');
    }

    const parentFolderId = path?.parent?.id;
    const fileContent = JSON.stringify(dataObj, null, 2);
    const isUpdate = path?.id && path?.id.trim() !== '';
    const url = isUpdate
        ? `https://www.googleapis.com/upload/drive/v3/files/${path.id.trim()}?uploadType=multipart&fields=id&supportsAllDrives=true`
        : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true';
    const method = isUpdate ? 'PATCH' : 'POST';

    const boundary = `boundary_${crypto.randomUUID().replace(/-/g, '')}`;
    const metadata = {
        name: path.fileName,
        mimeType: 'application/json',
        ...(isUpdate ? {} : { parents: parentFolderId ? [parentFolderId] : [] }),
    };
    const base64Data = toBase64(fileContent);
    const body = [
        `--${boundary}`,
        'Content-Type: application/json; charset=UTF-8',
        '',
        JSON.stringify(metadata),
        `--${boundary}`,
        'Content-Type: application/json',
        'Content-Transfer-Encoding: base64',
        '',
        base64Data,
        `--${boundary}--`,
    ].join('\r\n');

    const response = await fetch(url, {
        method,
        headers: {
            Authorization: `Bearer ${auth.accessToken}`,
            'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Upload failed: ${error.error.message}`);
    }

    const data = await response.json();
    console.log(`File ${isUpdate ? 'updated' : 'created'}:`, data);
    return data;
};

// Read selected file
const readFile = async (path, auth) => {
    if (!auth?.accessToken) {

        throw 'No access token found. Please sign in again.';
    }
    if (!path?.id) {
        throw new Error('Please select a file to read first.');
    }

    // Fetch file metadata
    const metadataResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${path.id}?fields=id,name,version,modifiedTime,description,lastModifyingUser&supportsAllDrives=true`,
        {
            method: 'GET',
            headers: new Headers({ Authorization: `Bearer ${auth.accessToken}` }),
        }
    );

    if (!metadataResponse.ok) {
        const errorData = await metadataResponse.json();
        throw errorData?.error;
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
            content,
            metadata,
        };
    }
    const errorData = await contentResponse.json();
    throw new Error('Error reading file content:', errorData);
};

export async function readJsonAttachment(path, auth) {
    if (!path || typeof path !== 'object') {
        throw new Error('Invalid path');
    }

    let result = await readFile(path, auth);
    let content = result?.content ? jsonParse(result.content) : null;
    let fileName = result?.metadata?.name;
    return { path: { ...path, fileName }, content };
}

export async function writeObjectToJsonAttachment(dataObject, path, auth) {
    return await writeFile(dataObject, path, auth);
}

export const isAuth = true;
export const type = "GoogleDrive";