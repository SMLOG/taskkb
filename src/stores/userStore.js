import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
  // State: List of users
  const users = ref([
    { username: 'defaultUser', email: 'default@example.com' }, // Example initial data
  ]);

  // Actions: Methods to manipulate the state
  function addUser(username, email) {
    if (username && email) {
      users.value.push({ username, email });
    }
  }

  function removeUser(email) {
    users.value = users.value.filter((user) => user.email !== email);
  }

  function updateUser(oldEmail, updatedUser) {
    const index = users.value.findIndex((user) => user.email === oldEmail);
    if (index !== -1) {
      users.value[index] = { ...users.value[index], ...updatedUser };
    }
  }

  // Getters: Computed properties (optional, for derived state)
  const userCount = () => users.value.length;
  const getUserByEmail = (email) => users.value.find((user) => user.email === email);

  // Expose state, actions, and getters
  return {
    users,
    addUser,
    removeUser,
    updateUser,
    userCount,
    getUserByEmail,
  };
});