<template>
  <div class="bg-gray-900 fixed inset-0 z-50 flex items-center justify-center h-screen">
    <div class="bg-gray-800 rounded-lg shadow-lg p-6 w-80 relative">
      <button 
        class="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors duration-200"
        title="Close"
        aria-label="Close modal"
        @click="close"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
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
import { useAppStore } from '@/stores/appStore';

const users = ref(['John Doe', 'Jane Smith']);
const selectedUser = ref(users.value[0]);

const close = ()=>{
  useAppStore().updateShowUp(0)
}
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
/* Additional styles for the close button */
button[aria-label="Close modal"] {
padding: 4px;
border-radius: 50%;
}

button[aria-label="Close modal"]:hover {
background-color: rgba(255, 255, 255, 0.1);
}
</style>