<template>
  <div>
    <button @click="handleSignInClick" class="bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600 transition duration-200">
      <slot>Sign in with Google</slot>
    </button>
    <button v-if="isAuthenticated" @click="pickFolder">Pick Folder to Write</button>
    <button v-if="isAuthenticated" @click="writeFile" :disabled="!selectedFolderId">Write to Drive</button>
    <button v-if="isAuthenticated" @click="pickFile">Pick File to Read</button>
    <button v-if="isAuthenticated" @click="readFile" :disabled="!selectedFileId">Read from Drive</button>
    <pre>{{ fileContent }}</pre>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useUserStore } from '@/stores/userStore';

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
const initGoogleSignIn = () => {
  if (typeof google === 'undefined' || !google.accounts.oauth2) {
    console.error('Google Sign-In library not loaded');
    alert('Failed to load Google Sign-In library. Please try again.');
    return;
  }
  initializeGSI();
};

// Initialize token client
const initializeGSI = () => {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
    callback: async (tokenResponse) => {
      console.log('Token Response:', tokenResponse);
      if (tokenResponse && tokenResponse.access_token) {
        accessToken.value = tokenResponse.access_token;
        isAuthenticated.value = true;
        isTokenRequested = false;

        // Fetch user info and add to userStore with accessToken
        const userInfo = await fetchUserInfo(tokenResponse.access_token);
        if (userInfo) {
          const existingUser = userStore.getUserByEmail(userInfo.email);
          if (!existingUser) {
            userStore.addUser(userInfo.username, userInfo.email, tokenResponse.access_token);
            console.log('User added to store:', { ...userInfo, accessToken: tokenResponse.access_token });
          } else {
            // Update existing user with new accessToken
            userStore.updateUser(userInfo.email, {
              username: userInfo.username,
              accessToken: tokenResponse.access_token,
            });
            console.log('User updated in store:', { ...userInfo, accessToken: tokenResponse.access_token });
          }
        }

        loadPicker();
      } else {
        console.error('No access token received:', tokenResponse);
        alert('Failed to obtain access token.');
      }
    },
    error_callback: (error) => {
      console.error('Token initialization error:', error);
      alert('Error initializing token client: ' + error.message);
    },
  });
};

const handleSignInClick = () => {
    if (tokenClient) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        console.error('Token client not initialized');
        alert('Token client not ready. Please try again.');
        initializeGSI();
    }
};

// Handle Sign-In response (global callback)
window.handleCredentialResponse = (response) => {
  console.log('Credential Response:', response);
  if (response && response.credential) {
    if (tokenClient) {
      if (!isTokenRequested) {
        isTokenRequested = true;
        tokenClient.requestAccessToken({ prompt: 'consent' });
      }
    } else {
      console.error('Token client not initialized');
      alert('Token client not ready. Please try again.');
      initializeGSI();
      tokenClient.requestAccessToken({ prompt: 'consent' });
    }
  } else {
    console.error('Invalid credential response:', response);
    alert('Sign-in failed. Please try again.');
  }
};

// Load Google API Client Library for Picker
const loadPicker = () => {
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

// Write file to selected folder
const writeFile = async () => {
  if (!accessToken.value) {
    alert('No access token found. Please sign in again.');
    return;
  }
  if (!selectedFolderId.value) {
    alert('Please select a folder first.');
    return;
  }

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
      const retryCheck = await fetch(
        `https://www.googleapis.com/drive/v3/files/${selectedFolderId.value}/permissions/me?supportsAllDrives=true`,
        {
          headers: new Headers({ Authorization: `Bearer ${accessToken.value}` }),
        }
      );

      if (!retryCheck.ok) {
        const errorData = await retryCheck.json();
        throw new Error(`Failed to verify permissions after token refresh: ${errorData.error.message}`);
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
  }

  const fileMetadata = {
    name: 'sample.txt',
    mimeType: 'text/plain',
    parents: [selectedFolderId.value],
  };
  const fileContent = 'Hello, World!';
  const blob = new Blob([fileContent], { type: 'text/plain' });
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
  form.append('file', blob);

  try {
    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true',
      {
        method: 'POST',
        headers: new Headers({ Authorization: `Bearer ${accessToken.value}` }),
        body: form,
      }
    );
    const data = await response.json();
    if (response.ok) {
      console.log('File written:', data);
      alert('File written: ' + data.name);
    } else {
      console.error('Error writing file:', data);
      alert('Error writing file: ' + data.error.message);
    }
  } catch (error) {
    console.error('Error writing file:', error);
    alert('Error writing file: ' + error.message);
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

// Load scripts on mount
onMounted(async () => {
  try {
    await loadScript('https://accounts.google.com/gsi/client', initGoogleSignIn);
    await loadScript('https://apis.google.com/js/api.js');
  } catch (error) {
    console.error('Script loading error:', error);
    alert('Failed to load required scripts. Please try again.');
  }
});

// Clean up on unmount
onUnmounted(() => {
  delete window.handleCredentialResponse;
});
</script>

<style scoped>
.info {
  color: blue;
  margin: 10px 0;
}
</style>