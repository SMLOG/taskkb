import { useRoute } from 'vue-router';
import { ref, watch } from 'vue';
import { useAppStore } from '@/stores/appStore';
import { useUserStore } from '@/stores/userStore';
import { parseHash } from '@/lib/parse';

export function useHash(authDlg) {
  // Reactive state for file and tab
  const file = ref('');
  const tab = ref('');
  const type = ref('');

  const appStore = useAppStore();

  // Get the current route
  const route = useRoute();

  // Function to update state from hash
  const updateHash = (hash) => {
    const { file: newFile, tab: newTab, storageType } = parseHash(hash);
    file.value = newFile;
    tab.value = newTab;
    type.value = storageType;
    
    (async()=>{
        try{
            await appStore.loadFile(storageType, newFile, newTab);
        }catch(error){
           await authDlg.value.open({mode:storageType},true);
           await appStore.loadFile(storageType, newFile, newTab);

        }
    })();
   
  };

  // Initial parse
  updateHash(route.hash || window.location.hash);

  // Watch route.hash for changes
  watch(() => route.hash, (newHash) => {
    updateHash(newHash);
  });

  // Fallback: Listen to browser hashchange events
  window.addEventListener('hashchange', () => {
    updateHash(window.location.hash);
  });

  function resetHash() {
    window.location.hash = window.location.hash.replace(/\/([GB])-([^/]+)\/([^/?]+)/g, '');
  }

  return {
    type,
    file,
    tab,
    resetHash,
  };
}