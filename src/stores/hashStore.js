// stores/hashStore.js
import { defineStore } from 'pinia'
import { useRoute } from 'vue-router'
import { ref, watch } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { useUserStore } from '@/stores/userStore'
import { parseHash } from '@/lib/parse';
import {showDialog} from '@/composables/useSystem';
import NoFoundDlg from '@/components/dlg/NoFoundDlg.vue'
import Auth from '@/components/dlg/Auth.vue'


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
    const { file: newFile, tab: newTab, storageType } = parseHash(hash)
    file.value = newFile
    tab.value = newTab
    type.value = storageType;
    (async () => {
      try {
        await appStore.loadFile(storageType, newFile, newTab);
      } catch (error) {
        console.error(error)
        if(error?.code===404){
          await showDialog(NoFoundDlg);

        }else{
          await showDialog(Auth,{auth:useAppStore().path});
          await appStore.loadFile(storageType, newFile, newTab);
        }


      }
    })();

  }

  // Initial parse
  updateHash(route.hash || window.location.hash)


  // Fallback: Listen to browser hashchange events
  const hashLinstern = () => {
    updateHash(window.location.hash)
  }
  window.addEventListener('hashchange', hashLinstern)

  function resetHash() {
    window.location.hash = window.location.hash.replace(/\/([A-Z])-([^/]+)\/([^/?]+)/g, '');
  }

  function updatePath(path) {
    let newHash;
    let sp = window.location.hash.split('?');
    if(path ===null ){
       newHash = `#/${sp.length==2?"?"+sp[1]:''}`;
    }else{
       newHash = `#/${path.mode}-${path.id}/${path.tabId}${sp.length==2?"?"+sp[1]:''}`;

    }
   if(window.location.hash!==newHash){
      history.pushState(null, null, newHash);
   }


  }

  function redirect(path) {
    let newHash;
    let sp = window.location.hash.split('?');
    if (path === null) {
        newHash = `#/${sp.length == 2 ? "?" + sp[1] : ''}`;
    } else {
        newHash = `#/${path.mode}-${path.id}/${path.tabId}${sp.length == 2 ? "?" + sp[1] : ''}`;
    }
    if (window.location.hash !== newHash) {
        window.location.assign(newHash);
    }
}
  return {
    type,
    file,
    tab, resetHash, updatePath,redirect
  }
})