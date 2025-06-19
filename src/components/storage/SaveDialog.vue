<template>
  <div v-if="isOpen" class="fixed inset-0 flex items-center justify-center z-50 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-all duration-300">
    <div class="bg-white border border-gray-300 p-4 rounded-lg w-96">
      <div class="mb-4">
        <label for="saveAs" class="block mb-2">Save as:</label>
        <input v-model="fileName" id="saveAs" type="text" class="w-full p-2 border rounded">
      </div>

      <div class="mb-4">
        <label for="where" class="block mb-2">Where:</label>
        <select v-model="storageLocation" id="where" class="w-full p-2 border rounded">
          <option value="GooleDrivePicker">Google Drive - My Drive</option>
          <option value="browser">Browser</option>
          <option value="device">Device</option>
        </select>
      </div>
      <div class="flex justify-between">
        <button @click="cancel" class="px-4 py-2 bg-white border rounded">Cancel</button>
        <button @click="save" class="px-4 py-2 bg-green-500 text-white rounded">Save</button>
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