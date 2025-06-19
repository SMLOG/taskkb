<template>
  <div class="fixed inset-0 z-99 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-all duration-300">
    <div class="bg-white p-6 rounded-lg shadow-lg text-center relative">
      <button 
        @click="closePopup" 
        class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
        aria-label="Close"
      >
        &times;
      </button>
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
const emit = defineEmits(['cancel']);

const rememberMe = ref(false);

const authorize = () => {
  // Handle the authorization logic here
  console.log('Authorization clicked:', rememberMe.value);
};

const closePopup = () => {
  // Handle closing the popup
  // You might want to emit an event or update a parent component's state
  emit('cancel');
};
</script>

<style scoped>
/* No additional styles needed as Tailwind CSS handles it */
</style>