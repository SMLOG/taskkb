<template>
    <div class="fixed inset-0 z-99 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white p-6 rounded-lg shadow-lg text-center">
        <h2 class="text-lg font-semibold">Authorization required</h2>
        <p class="mb-4">Authorize this app in OneDrive:</p>

        <GoogleDrivePicker>Authorize</GoogleDrivePicker>
        <div class="mt-4">
          <input type="checkbox" id="rememberMe" v-model="rememberMe" class="mr-2" />
          <label for="rememberMe">Remember me</label>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import GoogleDrivePicker from '@/components/storage/GoogleDrivePicker.vue';

  const rememberMe = ref(false);
  
  const authorize = () => {
    // Handle the authorization logic here
    console.log('Authorization clicked:', rememberMe.value);
  };
  </script>
  
  <style scoped>
  /* No additional styles needed as Tailwind CSS handles it */
  </style>