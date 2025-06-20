import { jsonParse } from '@/lib/parse';
import { useUserStore } from '@/stores/userStore';
import { ref} from 'vue';

// Constants
const clientId = '111515033736-dffaqu4qg36n2ovfhpaa7qgtndd3u4q2.apps.googleusercontent.com';

// Reactive state
const isAuthenticated = ref(false);
const accessToken = ref(null);
const selectedFolderId = ref(null);
const selectedFileId = ref(null);
const fileContent = ref('');
let tokenClient = null;
let isTokenRequested = false;

// Initialize user store
const userStore = useUserStore();

// Dynamically load scripts
const loadScript = (src, onload) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      onload && onload();
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
};

// Fetch user info from Google API
const fetchUserInfo = async (token) => {
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
    alert('Failed to fetch user info: ' + error.message);
    return null;
  }
};

// Initialize Google Sign-In
const initGoogleSignIn = async () => {
  if (typeof google === 'undefined' || !google.accounts.oauth2) {
    console.error('Google Sign-In library not loaded');
    return;
  }
  await initializeGSI();
};

async function initializeGSI() {
    // Ensure Google API is loaded
    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
      console.error('Google API script not loaded.');
      throw new Error('Google API is not available. Please try again later.');
    }
  
    try {
      // Create a promise to handle token response
      const tokenPromise = new Promise((resolve, reject) => {
        const tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
          callback: async (tokenResponse) => {
            console.log('Token Response:', tokenResponse);
            if (tokenResponse?.access_token) {
              try {
                accessToken.value = tokenResponse.access_token;
                isAuthenticated.value = true;
                isTokenRequested = false;
  
                // Fetch user info
                const userInfo = await fetchUserInfo(tokenResponse.access_token);
                if (userInfo?.email) {
                  const existingUser = userStore.getUserByEmail(userInfo.email);
                  if (!existingUser) {
                    userStore.addUser(userInfo.username, userInfo.email, tokenResponse.access_token);
                    console.log('User added to store:', { ...userInfo, accessToken: tokenResponse.access_token });
                  } else {
                    userStore.updateUser(userInfo.email, {
                      username: userInfo.username,
                      accessToken: tokenResponse.access_token,
                    });
                    console.log('User updated in store:', { ...userInfo, accessToken: tokenResponse.access_token });
                  }
  
                  // Load Google Picker
                  await loadPicker();
                  resolve(tokenClient); // Resolve with tokenClient
                } else {
                  console.error('Invalid user info:', userInfo);
                  reject(new Error('Failed to fetch user information.'));
                }
              } catch (userError) {
                console.error('Error in token callback:', userError);
                reject(userError);
              }
            } else {
              console.error('No access token received:', tokenResponse);
              reject(new Error('Failed to obtain access token.'));
            }
          },
          error_callback: (error) => {
            console.error('Token initialization error:', error);
            reject(error);
          },
        });
  
        // Trigger the token request
        tokenClient.requestAccessToken({ prompt: 'consent' });
      });
  
      return await tokenPromise; // Wait for token response and return tokenClient
    } catch (error) {
      console.error('Error in initializeGSI:', error);
      throw new Error('Error initializing GSI: ' + error.message);
    }
  }



async function handleSignInClick() {
    let tokenClient;
    try {
      if (!tokenClient) {
        console.log('Initializing token client');
        tokenClient = await initializeGSI(clientId, accessToken, isAuthenticated, isTokenRequested, userStore);
      } else {
        console.log('Requesting access token');
        await new Promise((resolve, reject) => {
          tokenClient.requestAccessToken({
            prompt: 'consent',
            callback: () => resolve(), // Callback is already handled in initializeGSI
            error_callback: (error) => reject(error),
          });
        });
      }
    } catch (error) {
      console.error('Error in handleSignInClick:', error);
      alert('Sign-in failed: ' + error.message);
    }
  }


const loadPicker = async () => {
  if (typeof gapi === 'undefined') {
    console.error('Google API Client Library not loaded');
    alert('Failed to load Google API Client Library. Please try again.');
    return;
  }
  gapi.load('picker', { callback: () => console.log('Picker API loaded') });
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
const pickFolder = async () => {
  if (!accessToken.value) {
    alert('Please sign in first.');
    return;
  }

  const pickerCallback = (data) => {
    if (data.action === google.picker.Action.PICKED) {
      selectedFolderId.value = data.docs[0].id;
      alert('Selected folder: ' + data.docs[0].name);
    }
  };
  const picker = new google.picker.PickerBuilder()
    .setOAuthToken(accessToken.value)
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
};

// Pick file
const pickFile = async () => {
  if (!accessToken.value) {
    alert('Please sign in first.');
    return;
  }

  const view = new google.picker.DocsView(google.picker.ViewId.DOCS).setMimeTypes('text/plain');

  const picker = new google.picker.PickerBuilder()
    .addView(view)
    .setOAuthToken(accessToken.value)
    .setCallback((data) => {
      if (data.action === google.picker.Action.PICKED) {
        selectedFileId.value = data.docs[0].id;
        alert('Selected file: ' + data.docs[0].name);
      }
    })
    .build();
  picker.setVisible(true);
};

const writeFile = async (fileId, dataObj) => {
    if (!accessToken.value) {
      alert('No access token found. Please sign in again.');
      return;
    }

    // Skip permission check if folderId is empty or null (save to root)
    if (selectedFolderId.value) {
      let permissionData;
      try {
        const permissionCheck = await fetch(
          `https://www.googleapis.com/drive/v3/files/${selectedFolderId.value}/permissions/me?supportsAllDrives=true`,
          {
            method: 'GET',
            headers: new Headers({ Authorization: `Bearer ${accessToken.value}` }),
          }
        );

        if (permissionCheck.status === 401) {
          console.warn('Access token expired, refreshing...');
          accessToken.value = await refreshAccessToken();
          console.log( accessToken.value)
          const retryCheck = await fetch(
            `https://www.googleapis.com/drive/v3/files/${selectedFolderId.value}/permissions/me?supportsAllDrives=true`,
            {
              headers: new Headers({ Authorization: `Bearer ${accessToken.value}` }),
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
          alert('You do not have write permission for the selected folder. Please choose another folder.');
          return;
        }
      } catch (error) {
        console.error('Error checking folder permissions:', error);
        alert('Unable to verify folder permissions: ' + error.message);
        return;
      }
    }

    // Serialize dataObj to JSON
    const fileContent = JSON.stringify(dataObj, null, 2); // Pretty-print JSON for readability
    const blob = new Blob([fileContent], { type: 'application/json' });
    const form = new FormData();

    // Determine if we're creating a new file or updating an existing one
    const isUpdate = fileId && fileId.trim() !== '';
    const url = isUpdate
      ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart&supportsAllDrives=true`
      : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true';
    const method = isUpdate ? 'PATCH' : 'POST';

    // Include metadata only for new files
    if (!isUpdate) {
      const fileMetadata = {
        name: 'sample.json', // Changed to .json to reflect content type
        mimeType: 'application/json', // Set MIME type to JSON
        parents: selectedFolderId.value ? [selectedFolderId.value] : [],
      };
      form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
    }

    form.append('file', blob);
    console.log( accessToken.value)
    try {
      const response = await fetch(url, {
        method: method,
        headers: new Headers({ Authorization: `Bearer ${accessToken.value}` }),
        body: form,
      });
      const data = await response.json();
      if (response.ok) {
        console.log(`File ${isUpdate ? 'updated' : 'created'}:`, data);
        alert(`File ${isUpdate ? 'updated' : 'created'}: ${data.name}`);
      } else {
        console.error(`Error ${isUpdate ? 'updating' : 'creating'} file:`, data);
        alert(`Error ${isUpdate ? 'updating' : 'creating'} file: ${data.error.message}`);
      }
    } catch (error) {
      console.error(`Error ${isUpdate ? 'updating' : 'creating'} file:`, error);
      alert(`Error ${isUpdate ? 'updating' : 'creating'} file: ${error.message}`);
    }
};

// Read selected file
const readFile = async () => {
  if (!accessToken.value) {
    alert('No access token found. Please sign in again.');
    return;
  }
  if (!selectedFileId.value) {
    alert('Please select a file to read first.');
    return;
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${selectedFileId.value}?alt=media&supportsAllDrives=true`,
      {
        method: 'GET',
        headers: new Headers({ Authorization: `Bearer ${accessToken.value}` }),
      }
    );
    if (response.ok) {
      fileContent.value = await response.text();
    } else {
      const errorData = await response.json();
      console.error('Error reading file:', errorData);
      alert('Error reading file: ' + errorData.error.message);
    }
  } catch (error) {
    console.error('Error reading file:', error);
    alert('Error reading file: ' + error.message);
  }
};

// Initialize Google API client with provided clientId
export async function initGoogleDriveClient() {
    const clientId = '111515033736-dffaqu4qg36n2ovfhpaa7qgtndd3u4q2.apps.googleusercontent.com';

    try {
        await loadScript('https://accounts.google.com/gsi/client', initGoogleSignIn);
        await loadScript('https://apis.google.com/js/api.js');
      } catch (error) {
        console.error('Script loading error:', error);
        alert('Failed to load required scripts. Please try again.');
      }


    return new Promise((resolve, reject) => {
        if (isGapiInitialized) {
            resolve();
            return;
        }

        // Check if gapi is defined
        if (typeof gapi === 'undefined') {
            const error = new Error('Google API Client Library (gapi) is not loaded. Ensure <script src="https://apis.google.com/js/api.js"></script> is included in your HTML.');
            console.error(error.message);
            reject(error);
            return;
        }

        gapi.load('client:auth2', () => {
            gapi.client
                .init({
                    clientId: clientId,
                    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
                    scope: 'https://www.googleapis.com/auth/drive.file',
                })
                .then(() => {
                    // Attempt silent sign-in
                    const authInstance = gapi.auth2.getAuthInstance();
                    if (!authInstance.isSignedIn.get()) {
                        authInstance.signIn({ prompt: 'none' }).catch((error) => {
                            console.warn('Silent sign-in failed, user may need to sign in manually:', error);
                            // Proceed anyway; sign-in will be handled in read/write functions
                        });
                    }
                    isGapiInitialized = true;
                    resolve();
                })
                .catch((error) => {
                    console.error('Error initializing Google API client:', error);
                    reject(error);
                });
        });
    });
}

let isGapiInitialized;
// Read JSON file from Google Drive using file ID
export async function readJsonAttachment(fileId) {
    if (!fileId || typeof fileId !== 'string') {
        return { error: 'Invalid or missing file ID' };
    }

    try {
        await loadScript('https://accounts.google.com/gsi/client', initGoogleSignIn);
        await loadScript('https://apis.google.com/js/api.js');
      } catch (error) {
        console.error('Script loading error:', error);
        alert('Failed to load required scripts. Please try again.');
      }
    try {
        // Auto-initialize if not already initialized

        if (!isGapiInitialized) {
            await handleSignInClick();
        }

        // Ensure user is signed in
        const authInstance = gapi.auth2.getAuthInstance();
        if (!authInstance.isSignedIn.get()) {
            try {
                await authInstance.signIn({ prompt: 'select_account' });
            } catch (error) {
                console.error('Sign-in failed:', error);
                return { error: 'User authentication required' };
            }
        }

        // Get the file content
        const fileResponse = await gapi.client.drive.files.get({
            fileId: fileId,
            alt: 'media',
        });

        const content = jsonParse(fileResponse.body);
        return { content };
    } catch (error) {
        console.error(`Error reading from Google Drive: ${error.message}`);
        return { error: `Failed to read file with ID ${fileId}: ${error.message}` };
    }
}

export async function writeObjectToJsonAttachment(dataObject, fileId) {
    if (!dataObject || typeof dataObject !== 'object') {
        return { success: false, error: 'Invalid or missing data object' };
    }
    if (fileId && typeof fileId !== 'string') {
        return { success: false, error: 'Invalid file ID' };
    }

    try {
        // Auto-initialize if not already initialized
        if (!isGapiInitialized) {
            await handleSignInClick();
        }

        await writeFile(fileId, dataObject);

        return { success: true, fileId: fileId || 'new-file-id' }; // Note: writeFile doesn't return fileId for new files; adjust as needed
    } catch (error) {
        console.error(`Error writing to Google Drive: ${error.message}`);
        return { success: false, error: fileId ? `Failed to update file with ID ${fileId}: ${error.message}` : `Failed to create file: ${error.message}` };
    }
}

export const type = "GoogleDrive";