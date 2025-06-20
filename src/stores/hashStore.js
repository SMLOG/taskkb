// stores/hashStore.js
import { defineStore } from 'pinia'
import { useRoute } from 'vue-router'
import { ref, watch } from 'vue'

export const useHashStore = defineStore('hash', () => {
  // Reactive state for file and tab
  const file = ref('')
  const tab = ref('')
  const type = ref('')

  // Parse hash function (same as before)
  const parseHash = (hash) => {
    let file = ''
    let tab = ''
    let storageType = ''
  
    if (!hash || !hash.includes('#/')) {
      return { file, tab }
    }
  
    const pattern = /\/([GB])-([^/]+)\/([^/?]+)/
    const match = hash.match(pattern)
  
    if (match) {
      storageType = match[1]
      file = match[2]
      tab = match[3]
      console.log(storageType,file,tab)
    } else if (hash) {
      console.warn(`Invalid hash format: "${hash}". Expected: contains #/file-xxx/tab-xxx`)
    }
  
    return { file, tab,storageType }
  }

  // Get the current route
  const route = useRoute()

  // Function to update state from hash
  const updateHash = (hash) => {
    const { file: newFile, tab: newTab,storageType } = parseHash(hash)
    file.value = newFile
    tab.value = newTab
    type.value = storageType;
  }

  // Initial parse
  updateHash(route.hash || window.location.hash)

  // Watch Vue Router's route.hash for changes
  watch(
    () => route.hash,
    (newHash) => {
      updateHash(newHash || window.location.hash)
    },
    { immediate: true } // Run immediately to catch initial hash
  )

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