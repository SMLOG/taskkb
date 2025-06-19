<template>
  <div v-if="isOpen" class="fixed inset-0 flex items-center justify-center z-50 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-all duration-300">
    <div class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-4 rounded-lg w-96 text-gray-900 dark:text-gray-100">
      <div class="mb-4">
        <label for="saveAs" class="block mb-2 font-medium">Save as:</label>
        <input 
          v-model="fileName" 
          id="saveAs" 
          type="text" 
          class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-colors duration-200"
        >
      </div>

      <div class="mb-4">
        <label for="where" class="block mb-2 font-medium">Where:</label>
        <select 
          v-model="storageLocation" 
          id="where" 
          class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-colors duration-200"
        >
        <option value="googlemy">Google Drive - My Drive</option>
        <option value="googlefolder">Google Drive - Pick a folder...</option>
        <option value="browser">Browser</option>
          <option value="device">Device</option>
        </select>
      </div>

      <div class="flex justify-between">
        <button 
          @click="cancel" 
          class="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
        >
          Cancel
        </button>
        <button 
          @click="save" 
          class="px-4 py-2 bg-green-500 dark:bg-green-600 text-white rounded hover:bg-green-600 dark:hover:bg-green-700 transition-colors duration-200"
        >
          Save
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['saved']);

const fileName = ref('Untitled.treegrid');
const storageLocation = ref('googleDrive');
const isOpen = ref(false);

const cancel = () => {
  isOpen.value = false;
};

const save = () => {
  isOpen.value = false;
  emit('saved', { fileName: fileName.value, storageLocation: storageLocation.value });
};

defineExpose({
  open() {
    isOpen.value = true;
  }
});
</script>