import { defineStore } from 'pinia';
import { ref } from 'vue'
import { useUserStore } from './userStore';

export const useModeStore = defineStore('mode', () => {

  const mode = ref("L");
  const fileName = ref("Untitled.treegrid");
  const showMode = ref(false);
  const showAuth = ref(false);
  const parentFolder = ref(null);



  return {
    mode,
    fileName,showMode,showAuth,parentFolder
  };
});