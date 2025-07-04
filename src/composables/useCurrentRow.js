// composables/useCurrentRow.js
import { ref, computed, readonly } from 'vue'

export function useCurrentRow() {
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
  
  return {
    currentRow: readonly(currentRow), // Make state read-only externally
    hasCurrentRow,
    currentRowId,
    setCurrentRow,
    clearCurrentRow
  }
}