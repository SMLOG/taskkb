import { defineStore } from 'pinia';
import { ref } from 'vue'
import { useUserStore } from './userStore';

export const useModeStore = defineStore('mode', () => {

  const mode = ref("L");
  const fileName = ref("Untitled.treegrid");
  const showMode = ref(false);
  const showAuth = ref(false);
  const cacheFolders = ref([]);
  const parentFolder = ref(null);

  const authUser = async() =>{
    const userStore = useUserStore();
    const user = userStore.getUser();

    if(mode.value === 'G'){
      if(user){

      }
      showAuth.value = true;
    }
    return false;

  }

  return {
    mode,
    fileName,showMode,showAuth,cacheFolders,parentFolder,authUser
  };
});