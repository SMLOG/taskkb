<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-all duration-300">
    <div
      class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center relative border border-gray-200 dark:border-gray-700">
      <button @click="closePopup"
        class="absolute top-2 right-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl font-bold transition-colors"
        aria-label="Close">
        ×
      </button>
      <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Authorization required</h2>
      <p class="mb-4 text-gray-600 dark:text-gray-300">Authorize this app in {{ name }}:</p>
      <div> <button @click="handleSignInClick"
          class="bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600 transition duration-200">
          Authorize </button></div>
      <div class="mt-4 flex items-center justify-center">
        <input type="checkbox" id="rememberMe" v-model="rememberMe"
          class="mr-2 h-4 w-4 text-blue-600 dark:text-blue-500 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400" />
        <label for="rememberMe" class="text-gray-700 dark:text-gray-300">Remember me</label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { getStorageBridgeByName } from '@/api/bridge';

const props = defineProps({
  name: String,
  mode:String
});
const emits = defineEmits(['confirm', 'close']);

const rememberMe = ref(false);

const closePopup = () => {
  emits('close');
};
const handleSignInClick = async () => {
  try {
    const storageBridge = await getStorageBridgeByName(props.mode);
    await storageBridge.authorize(rememberMe.value);
    emits('confirm');
  } catch (error) {
    console.error("Authorization failed:", error);
   emits('close');

  }
};
</script>

<style scoped>
/* No additional styles needed as Tailwind CSS handles it */
</style>