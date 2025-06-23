import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
  // State
  const users = ref([]);
  const curIndex = ref(-1);
  const cacheFolders = ref([]);

  // Restore state from sessionStorage on initialization
  if (typeof window !== 'undefined') {
    const savedState = sessionStorage.getItem('userStore');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        users.value = parsedState.users || [];
        curIndex.value = parsedState.curIndex ?? -1;
        cacheFolders.value = parsedState.cacheFolders || [];
      } catch (error) {
        console.error('Failed to parse sessionStorage state:', error);
      }
    }
  }

  // Helper function to save state to sessionStorage
  const saveState = () => {
    if (typeof window !== 'undefined') {
      try {
        const state = {
          users: users.value,
          curIndex: curIndex.value,
          cacheFolders: cacheFolders.value,
        };
        sessionStorage.setItem('userStore', JSON.stringify(state));
      } catch (error) {
        console.error('Failed to save state to sessionStorage:', error);
      }
    }
  };

  function addOrUpdateUser({ mode, modeName, username, email, accessToken }) {
    if (!username?.trim() || !email?.trim()) {
      console.warn('Username and email are required.');
      return;
    }
    const existingUser = users.value.find(user => user.mode === mode && user.email === email);
    if (existingUser) {
      Object.assign(existingUser, { mode, modeName, username, email, accessToken });
      curIndex.value = users.value.indexOf(existingUser);
    } else {
      users.value.push({ mode, modeName, username, email, accessToken });
      curIndex.value = users.value.length - 1;
    }
    saveState(); // Save state after modification
  }

  function removeUser(email) {
    users.value = users.value.filter((user) => user.email !== email);
    saveState(); // Save state after modification
  }

  function updateUser(oldEmail, updatedUser) {
    const index = users.value.findIndex((user) => user.email === oldEmail);
    if (index !== -1) {
      users.value[index] = { ...users.value[index], ...updatedUser };
      saveState(); // Save state after modification
    }
  }

  // Getters
  const userCount = () => users.value.length;
  const getUserByEmail = (email) => users.value.find((user) => user.email === email);
  const getUser = () => {
    return users.value.length ? users.value[curIndex.value] : null;
  };

  function logout(){
    users.value.length = 0;
    curIndex.value=-1;
    sessionStorage.removeItem('userStore');
  }
  return {
    users,
    addOrUpdateUser,
    removeUser,
    updateUser,
    userCount,
    getUserByEmail,
    getUser,
    cacheFolders,logout
  };
});