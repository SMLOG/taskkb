import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const VIEW_OPTIONS = [
  { value: '', label: 'List' },
  { value: 'plan', label: 'Plan' },
  { value: 'code', label: 'Source Code',show:false },
  { value: 'cards', label: 'Card' },
  { value: 'calendar', label: 'Calendar' }
];

export const useViewStore = defineStore('view', () => {
  // State
  const activeView = ref(localStorage.getItem('preferredView') || '');
  
  // Constants

  
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