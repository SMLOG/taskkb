<template>
    <div class="max-w-md mx-2 mt-1 relative">
      <div class="flex space-x-2">
        <button
          @click="share"
          class="bg-blue-500 text-white dark:bg-blue-700 dark:text-gray-100 px-1.5 py-0.5 text-xs rounded hover:bg-blue-600 dark:hover:bg-blue-800 flex items-center transition-colors duration-200"
        >
          <svg class="w-3 h-3 mr-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7l-7.05 4.11c-.54-.5-1.25-.81-2.04-.81-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"
            />
          </svg>
          Share
        </button>
        <button
          @click="toggleShowProfile"
          class="bg-blue-500 text-white dark:bg-blue-700 dark:text-gray-100 p-0.5 rounded-full hover:bg-blue-600 dark:hover:bg-blue-800 flex items-center justify-center w-6 h-6 transition-colors duration-200"
        >
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
            />
          </svg>
        </button>


      </div>

      <!-- Profile Footer -->
      <div v-if="isProfileVisible"  class="absolute z-99  w-80 m-1 right-0 bg-white dark:bg-gray-800 p-4 border-t border-gray-300 dark:border-gray-600">
        <Profile/>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import Profile from './Profile.vue';
  
  const isProfileVisible = ref(false);
  
  const share = () => {
    alert('Sharing functionality to be implemented');
  };
  
  const toggleShowProfile = () => {
    isProfileVisible.value = !isProfileVisible.value;
  };
  </script>
  
  <style scoped>
  /* Optional: Custom styles for fine-grained control */
  button {
    transition-property: background-color, color;
    transition-duration: 200ms;
    transition-timing-function: ease-in-out;
  }
  </style>