import { defineStore } from 'pinia';
import { ref } from 'vue'

export const useModeStore = defineStore('mode', () => {

  const mode = ref("browser");
  const fileName = ref("Untitled.treegrid");
  const showMode = ref(false);
  const showAuth = ref(false);
  const cacheFolders = ref([]);


  return {
    mode,
    fileName,showMode,showAuth,cacheFolders
  };
});