// stores/userStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  // State: List of users with username, email, and accessToken
  const users = ref([
  ]);




  // Actions: Methods to manipulate the state
  function addUser(username, email, accessToken = null) {
    if (username && email) {
      users.value.push({ username, email, accessToken});
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

  // Getters: Computed properties
  const userCount = () => users.value.length;
  const getUserByEmail = (email) => users.value.find((user) => user.email === email);
  const getUser = ()=>{
    if(users.value.length){
      return users.value[0];
    }else return null;
  }



  return {
    users,
    addUser,
    removeUser,
    updateUser,
    userCount,
    getUserByEmail,getUser
  };
});