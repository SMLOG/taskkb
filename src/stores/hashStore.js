// stores/hashStore.js
import { defineStore } from 'pinia'
import { useRoute } from 'vue-router'
import { ref, watch } from 'vue'
import { useAppStore} from '@/stores/appStore'
import { useUserStore} from '@/stores/userStore'
import {parseHash} from '@/lib/parse';
import { useAuthDialog } from '@/composables/useAuthDialog';


export const useHashStore = defineStore('hash', () => {
  // Reactive state for file and tab
  const file = ref('')
  const tab = ref('')
  const type = ref('')

  const userStore = useUserStore()
  const appStore = useAppStore()


  // Parse hash function (same as before)


  // Get the current route
  const route = useRoute()

  // Function to update state from hash
  const updateHash = (hash) => {
    const { file: newFile, tab: newTab,storageType } = parseHash(hash)
    file.value = newFile
    tab.value = newTab
    type.value = storageType;
    (async()=>{
      try{
          await appStore.loadFile(storageType, newFile, newTab);
      }catch(error){
         await useAuthDialog().globalAuthDlg.value.open({mode:storageType},true);
         await appStore.loadFile(storageType, newFile, newTab);

      }
  })();

  }

  // Initial parse
  updateHash(route.hash || window.location.hash)


  // Fallback: Listen to browser hashchange events
  window.addEventListener('hashchange', () => {
    updateHash(window.location.hash)
  })

  function resetHash(){
    window.location.hash = window.location.hash.replace( /\/([GB])-([^/]+)\/([^/?]+)/g,'');
  }

  return {
    type,
    file,
    tab,resetHash
  }
})