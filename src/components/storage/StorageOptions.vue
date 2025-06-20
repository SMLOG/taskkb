<template>
    <div class="bg-gray-900 fixed inset-0 z-50 flex items-center justify-center flex items-center justify-center h-screen z-99999">
      <div class="bg-gray-800 rounded-lg shadow-lg p-6 w-80">
        <div class="flex items-center mb-4">
          <h2 class="text-white text-lg font-semibold">Google Drive</h2>
        </div>
        <button class="w-full bg-blue-600 text-white font-bold py-2 rounded-lg mb-2 hover:bg-blue-500" @click="createNewTreeGrid">
          Create Tree Grid
        </button>
        <button class="w-full bg-blue-600 text-white font-bold py-2 rounded-lg mb-2 hover:bg-blue-500" @click="openExistingTreeGrid">
          Open Existing Tree Grid
        </button>
        <div class="mb-4">
          <label class="text-white" for="user-select">Change user:</label>
          <select id="user-select" class="block w-full mt-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring focus:ring-blue-500" v-model="selectedUser">
            <option v-for="user in users" :key="user">{{ user }}</option>
          </select>
        </div>
        <button class="w-full text-blue-400 hover:underline" @click="changeStorage">Change storage</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const users = ref(['John Doe', 'Jane Smith']);
  const selectedUser = ref(users.value[0]);
  
  const createNewTreeGrid = () => {
    console.log('Creating new TreeGrid...');
    // Add your logic here
  };
  
  const openExistingTreeGrid = () => {
    console.log('Opening existing TreeGrid...');
    // Add your logic here
  };
  
  const changeStorage = () => {
    console.log('Changing storage...');
    // Add your logic here
  };
  </script>
  
  <style scoped>
  /* You can add additional styles here */
  </style>