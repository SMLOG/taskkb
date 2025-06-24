<template>
      <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Authorization required</h2>
      <p class="mb-4 text-gray-600 dark:text-gray-300">Authorize this app in {{ params.name }}:</p>
      <div> <button @click="authorize"
          class="bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600 transition duration-200">
          Authorize </button></div>
      <div class="mt-4 flex items-center justify-center">
        <input type="checkbox" id="rememberMe" v-model="rememberMe"
          class="mr-2 h-4 w-4 text-blue-600 dark:text-blue-500 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400" />
        <label for="rememberMe" class="text-gray-700 dark:text-gray-300">Remember me</label>
      </div>
</template>

<script setup>
import { ref } from 'vue';
import { getStorageBridgeByName } from '@/api/bridge';
import { useUserStore } from '@/stores/userStore';

const emit = defineEmits(["confirm","cancel"]);


const props = defineProps({
  params: {
  }
});


const rememberMe = ref(false);


const authorize = async () => {
  try {
    console.log('auth')
    const storageBridge = await getStorageBridgeByName(props.params.auth.mode);
    const auth  =  await storageBridge.authorize(props.params.auth,rememberMe.value);

    const userStore = useUserStore();

    userStore.addOrUpdateUser(auth);

    emit("confirm",auth)

  } catch (error) {
    emit("cancel",error)

  }
};



</script>

<style scoped>
/* No additional styles needed as Tailwind CSS handles it */
</style>