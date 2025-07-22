// stores/currentRow.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCurrentRowStore = defineStore('currentRow', () => {
  // State
  const currentRow = ref(null)
  const currentRowParent = ref(null)
  const currentDepth = ref(null)
  // Getters
  const hasCurrentRow = computed(() => currentRow.value !== null)
  const currentRowId = computed(() => currentRow.value?.id || null)
  
  // Actions
  function setCurrentRow(parent,row,depth) {
    currentRow.value = row
    currentRowParent.value = parent;
    currentDepth.value = depth;
  }
  
  function clearCurrentRow() {
    currentRow.value = null;
    currentRowParent.value = null;

  }
  function isCurrentRow(row){
   return currentRow.value !== null && row===currentRow.value
  }

  
  function getCurrent(){
    return {parent:currentRowParent.value,row:currentRow.value,depth:currentDepth.value};
  }
  return {
    currentRow,
    hasCurrentRow,
    currentRowId,
    setCurrentRow,
    clearCurrentRow,isCurrentRow,getCurrent
  }
})