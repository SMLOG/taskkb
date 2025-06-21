<template>
  <div v-if="isOpen"
    class="fixed inset-0 flex items-center justify-center z-50 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-all duration-300">
    <div
      class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-4 rounded-lg w-96 text-gray-900 dark:text-gray-100">
      <div class="mb-4">
        <label for="saveAs" class="block mb-2 font-medium">Save as:</label>
        <input v-model="fileName" id="saveAs" type="text"
          class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-colors duration-200">
      </div>

      <div class="mb-4">
        <label for="where" class="block mb-2 font-medium">Where:</label>
        <select v-model="selectIndexRef" id="where"
          class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-colors duration-200"
          @change="changeMode">

          <option v-for="(option, i) in cacheFolders" :value="i"> {{ (nameMap[option.mode] ? nameMap[option.mode] + " - " : "")
            +option.name }}</option>
          <option v-if="cacheFolders.length" disabled>-----------------</option>
          <option v-for="(option, i) in modesRef" :value="cacheFolders.length + i">{{
            (nameMap[option.mode] ? nameMap[option.mode] + " - " : "") + option.name }}</option>
        </select>
      </div>

      <div class="flex justify-between">
        <button @click="cancel"
          class="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
          Cancel
        </button>
        <button @click="authAndSave"
          class="px-4 py-2 bg-green-500 dark:bg-green-600 text-white rounded hover:bg-green-600 dark:hover:bg-green-700 transition-colors duration-200">
          Save
        </button>
      </div>
    </div>
  </div>
  <AuthorizationDialog v-if="showAuth" @confirm="handleConfirm" @close="handleCancel" />
</template>

<script setup>
import { ref } from 'vue';
import { useModeStore } from "@/stores/modeStore";
import { useAppStore } from "@/stores/appStore";
import { getStorageBridgeByName } from '@/api/bridge';
import AuthorizationDialog from '@/components/storage/AuthorizationDialog.vue';

import { storeToRefs } from 'pinia';

const { fileName, mode, cacheFolders, parentFolder } = storeToRefs(useModeStore());

const showAuth = ref(false);

const nameMap = {
  "G": "Google Drive"
}
const modesRef = ref([
  { mode: 'G', name: "My Drive" }
  , { mode: 'G', name: "Pick a folder...", folder: true }
  , { mode: 'L', name: "Browser" }
  , { mode: 'D', name: "Device" }
])

const getSelected = () => {
  const allOptions = [...cacheFolders.value, ...modesRef.value]
  const selectOption = allOptions[selectIndexRef.value];
  return selectOption;
}
const changeMode = () => {
  const selectOption = getSelected();;
  if (selectOption.folder) {
    (async () => {
      const { pickFolder } = await getStorageBridgeByName(selectOption.mode);
      if (pickFolder) {
        try {
          const folder = await pickFolder();
          let exits = cacheFolders.value.filter(f => f.id == folder.id);
          if (exits.length > 0) {
            let i = cacheFolders.value.indexOf(exits[0]);
            selectIndexRef.value = i;
          } else {
            cacheFolders.value.unshift({ mode: selectOption.mode, ...folder })
            console.log('folder', folder)
            selectIndexRef.value = 0;
          }

        } catch (error) {

          const df = modesRef.value.filter(e => e.mode === selectOption.mode)[0];
          const allOptions = [...cacheFolders.value, ...modesRef.value]
          selectIndexRef.value = allOptions.indexOf(df);
        }

      }

      console.log(selectOption)

    })();
  }
}
const selectIndexRef = ref(0);
const isOpen = ref(false);

const cancel = () => {
  isOpen.value = false;
};

const resolvePromise = ref(null);
const rejectPromise = ref(null);

const handleConfirm = () => {
  resolvePromise.value();
};

const handleCancel = () => {
  rejectPromise.value();
};

const authAndSave = async () => {
  const selected = getSelected();
  mode.value = selected.mode;
  const modeStore = useModeStore();

  if (!await modeStore.authUser(selected.mode)) {

    try {
      await new Promise((resolve, reject) => {
        showAuth.value = true;
        resolvePromise.value = resolve;
        rejectPromise.value = reject;
      });
    isOpen.value = false;

    } catch (error) {
      showAuth.value = false;

    }
  }
  parentFolder.value = cacheFolders.value.length > selectIndexRef.value ? selectIndexRef.value : -1;
  await useAppStore().saveData();


};

defineExpose({
  open() {
    isOpen.value = true;
  }
});
</script>