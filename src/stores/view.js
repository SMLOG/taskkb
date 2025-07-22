import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useViewStore = defineStore('view', () => {
  // State
  const activeView = ref(localStorage.getItem('preferredView') || '');
  
  // Constants
  const VIEW_OPTIONS = [
    { value: '', label: 'List' },
    { value: 'cards', label: 'Card' },
    { value: 'calendar', label: 'Calendar' }
  ];
  
  // Getters
  const viewOptions = computed(() => VIEW_OPTIONS);
  const isValidView = computed(() => 
    VIEW_OPTIONS.some(opt => opt.value === activeView.value)
  );
  
  // Actions
  function setActiveView(view) {
    if (VIEW_OPTIONS.some(opt => opt.value === view)) {
      activeView.value = view;
      localStorage.setItem('preferredView', view);
    }
  }
  
  return {
    activeView,
    viewOptions,
    isValidView,
    setActiveView
  };
});