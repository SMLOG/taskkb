<template>
  <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg shadow-lg relative">
      <button @click="$emit('close')" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white absolute right-0 top-0">
        <span class="text-xl">×</span>
      </button>
    <!-- Display users from the store -->
    <div v-for="user in userStore.users" :key="user.email" class="flex items-center space-x-3 mb-4">
      <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
        <span class="text-white font-bold text-xl">{{ user.username[0] }}</span>
      </div>
      <div>
        <p class="text-sm text-gray-900 dark:text-white">{{ user.username }}</p>
        <p class="text-xs text-gray-600 dark:text-gray-400">{{ user.email }}</p>
      </div>
    </div>
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Google Drive</p>
    <div class="flex justify-between">
      <button @click="addNewUser" class="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-2 px-4 rounded border border-gray-300 dark:border-gray-600">Add account</button>
      <button @click="$emit('sign-out')" class="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-2 px-4 rounded border border-gray-300 dark:border-gray-600">Sign out</button>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/userStore';

// Access the user store
const userStore = useUserStore();

defineEmits(['close', 'add-account', 'sign-out']);
</script>

<style scoped>
/* Add any additional custom styles here if needed */
</style>