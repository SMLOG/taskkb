// stores/hashStore.js
import { defineStore } from 'pinia'
import { useRoute } from 'vue-router'
import { ref, watch } from 'vue'
import { useAppStore} from '@/stores/appStore'
import { useUserStore} from '@/stores/userStore'
import {parseHash} from '@/lib/parse';

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

    appStore.loadFile(storageType,newFile,newTab);

  }

  // Initial parse
  updateHash(route.hash || window.location.hash)

  // Watch Vue Router's route.hash for changes
  /*watch(
    () => route.hash,
    (newHash) => {
      updateHash(newHash || window.location.hash)
    },
    { immediate: true } // Run immediately to catch initial hash
  )*/

  // Fallback: Listen to browser hashchange events
  window.addEventListener('hashchange', () => {
    updateHash(window.location.hash)
  })

  return {
    type,
    file,
    tab
  }
})