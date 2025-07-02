<template>
  <div class="text-left">
      <div class="mb-4">
        <label for="saveAs" class="block mb-2 font-medium">Description:</label>
        <textarea v-model="description" id="saveAs" type="text"
          class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-colors duration-200">
     </textarea>
        </div>

      <div class="flex justify-between">
        <button @click="cancel"
          class="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
          Cancel
        </button>
        <button @click="save"
          class="px-4 py-2 bg-green-500 dark:bg-green-600 text-white rounded hover:bg-green-600 dark:hover:bg-green-700 transition-colors duration-200">
          OK
        </button>
      </div>
    </div>
</template>

<script setup>
import { useAppStore } from '@/stores/appStore';
import { ref } from 'vue';


const emits= defineEmits(["confirm","cancel"]);

const description = ref(useAppStore().configRef.description);




const cancel = () => {
  emits("cancel")
};


const save = async () => {
  useAppStore().configRef.description = description.value;
  emits("confirm");

};


</script>