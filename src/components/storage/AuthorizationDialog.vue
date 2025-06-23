<template>
  <div v-if="isOpen"
    class="fixed inset-0 z-999 flex items-center justify-center bg-black/40 dark:bg-black/60  transition-all duration-300">
    <div
      class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center relative border border-gray-200 dark:border-gray-700">
      <button @click="closePopup"
        class="absolute top-2 right-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl font-bold transition-colors"
        aria-label="Close">
        ×
      </button>
      <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Authorization required</h2>
      <p class="mb-4 text-gray-600 dark:text-gray-300">Authorize this app in {{ name }}:</p>
      <div> <button @click="authorize"
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
import { useUserStore } from '@/stores/userStore';

const isOpen = ref(false);


const rememberMe = ref(false);

const closePopup = () => {
  isOpen.value = false;
  returnReject.value();
};
const authorize = async () => {
  try {
    console.log('auth')
    const storageBridge = await getStorageBridgeByName(selectedAuth.value.mode);
    const auth  =  await storageBridge.authorize(selectedAuth,rememberMe.value);

    isOpen.value = false;
    const userStore = useUserStore();

    userStore.addOrUpdateUser(auth);

    returnResolve.value(auth);
  } catch (error) {

  }
};

const returnResolve = ref(null);
const returnReject = ref(null);
const selectedAuth = ref(null);
const name = ref(null);
defineExpose({
  async open(selectedAuthValue, selectedAuthName) {
    return new Promise((resolve, reject) => {
      selectedAuth.value = selectedAuthValue;
      name.value = selectedAuthName;
      returnResolve.value = resolve;
      returnReject.value = reject;
      isOpen.value = true;
    })
  }
});

</script>

<style scoped>
/* No additional styles needed as Tailwind CSS handles it */
</style>