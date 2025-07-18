// stores/currentRow.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCurrentRowStore = defineStore('currentRow', () => {
  // State
  const currentRow = ref(null)
  const currentRowParent = ref(null)
  
  // Getters
  const hasCurrentRow = computed(() => currentRow.value !== null)
  const currentRowId = computed(() => currentRow.value?.id || null)
  
  // Actions
  function setCurrentRow(parent,row) {
    currentRow.value = row
    currentRowParent.value = parent;
  }
  
  function clearCurrentRow() {
    currentRow.value = null;
    currentRowParent.value = null;

  }
  function isCurrentRow(row){
   return currentRow.value !== null && row===currentRow.value
  }
  function getCurrent(){
    return [currentRowParent.value,currentRow.value];
  }
  
  return {
    currentRow,
    hasCurrentRow,
    currentRowId,
    setCurrentRow,
    clearCurrentRow,isCurrentRow,getCurrent
  }
})