// stores/currentRow.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCurrentRowStore = defineStore('currentRow', () => {
  // State
  const currentRow = ref(null)
  
  // Getters
  const hasCurrentRow = computed(() => currentRow.value !== null)
  const currentRowId = computed(() => currentRow.value?.id || null)
  
  // Actions
  function setCurrentRow(row) {
    currentRow.value = row
  }
  
  function clearCurrentRow() {
    currentRow.value = null
  }
  function isCurrentRow(row){
   return currentRow.value !== null && row.id==currentRow.value.id
  }
  
  return {
    currentRow,
    hasCurrentRow,
    currentRowId,
    setCurrentRow,
    clearCurrentRow,isCurrentRow
  }
})