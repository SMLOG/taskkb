import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useRecentStore = defineStore('recents', () => {
  const recents = ref([]);
  
  function addOrUpdateRemoveRecent(path, isRemove) {
    if (!path || !path.id) return;
    
    if (isRemove) {
      // Remove path by id
      recents.value = recents.value.filter(item => item.id !== path.id);
    } else {
      // Find existing path by id
      const index = recents.value.findIndex(item => item.id === path.id);
      
      if (index !== -1) {
        // Update existing path
        recents.value[index] = { ...recents.value[index], ...path };
      } else {
        // Add new path
        recents.value.push(path);
      }
    }
  }
  
  return {
    recents,
    addOrUpdateRemoveRecent
  };
});