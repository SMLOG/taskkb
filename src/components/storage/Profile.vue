<template>
    <div class="bg-gray-800 px-4 rounded-lg shadow-lg">
      <div class="flex justify-end">
        <button @click="$emit('close')" class="text-gray-400 hover:text-white">
          <span class="text-xl">×</span>
        </button>
      </div>
      <!-- Display users from the store -->
      <div v-for="user in userStore.users" :key="user.email" class="flex items-center space-x-3 mb-4">
        <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
          <span class="text-white font-bold text-xl">{{ user.username[0] }}</span>
        </div>
        <div>
          <p class="text-sm">{{ user.username }}</p>
          <p class="text-xs text-gray-400">{{ user.email }}</p>
        </div>
      </div>
      <p class="text-sm text-gray-600 mb-4">Google Drive</p>
      <div class="flex justify-between">
        <button @click="addNewUser" class="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded">Add account</button>
        <button @click="$emit('sign-out')" class="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded">Sign out</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useUserStore } from '@/stores/userStore';
  
  // Access the user store
  const userStore = useUserStore();
  
  // Example method to add a new user
  function addNewUser() {
    // Replace with actual input values, e.g., from a form
    userStore.addUser(`user${userStore.userCount() + 1}`, `user${userStore.userCount() + 1}@example.com`);
  }
  
  // Define emits
  defineEmits(['close', 'add-account', 'sign-out']);
  </script>
  
  <style scoped>
  /* Add any additional custom styles here if needed */
  </style>