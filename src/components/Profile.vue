<template>
    <div class="bg-gray-800 px-4 rounded-lg shadow-lg">
      <div class="flex justify-end">
        <button @click="$emit('close')" class="text-gray-400 hover:text-white">
          <span class="text-xl">×</span>
        </button>
      </div>
      <div class="flex items-center space-x-3 mb-4">
        <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
          <span class="text-white font-bold text-xl">a</span>
        </div>
        <div>
          <p class="text-sm">username</p>
          <p class="text-xs text-gray-400">email</p>
        </div>
      </div>
      <p class="text-sm text-gray-500 mb-4">Google Drive</p>
      <div class="flex justify-between">
        <button @click="$emit('add-account')" class="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded">Add account</button>
        <button @click="$emit('sign-out')" class="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded">Sign out</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'GoogleDriveUI',
    emits: ['close', 'add-account', 'sign-out']
  }
  </script>
  
  <style scoped>
  /* Add any additional custom styles here if needed */
  </style>