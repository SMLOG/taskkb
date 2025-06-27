import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useRecentStore = defineStore('recents', () => {
  // Initialize recents from localStorage or empty array
  const recents = ref(loadFromLocalStorage());

  // Load recents from localStorage
  function loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('recents');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate: ensure it's an array of objects with id and timestamp
        if (Array.isArray(parsed) && parsed.every(item => item && typeof item === 'object' && item.id && item.timestamp)) {
          // Sort by timestamp (newest first)
          return parsed.sort((a, b) => b.timestamp - a.timestamp);
        }
      }
      return [];
    } catch (error) {
      console.warn('Failed to load recents from localStorage:', error);
      return [];
    }
  }

  // Save recents to localStorage
  function saveToLocalStorage() {
    try {
      localStorage.setItem('recents', JSON.stringify(recents.value));
    } catch (error) {
      console.warn('Failed to save recents to localStorage:', error);
    }
  }

  // Watch recents for changes and save to localStorage

  function addOrUpdateRemoveRecent(path, isRemove) {
    if (!path || !path.id) {
      console.warn('Invalid path object provided');
      return;
    }

    if (isRemove) {
      // Remove path by id
      recents.value = recents.value.filter(item => item.id !== path.id);
    } else {
      // Find existing path by id
      const index = recents.value.findIndex(item => item.id === path.id);
      
      const updatedItem = { ...path, timestamp: Date.now() };
      
      if (index !== -1) {
        // Update existing path
        recents.value[index] = updatedItem;
      } else {
        // Add new path to start
        recents.value.unshift(updatedItem);
        // Limit to 10 recent items
        recents.value = recents.value.slice(0, 10);
      }
      // Sort by timestamp (newest first)
      recents.value = recents.value.sort((a, b) => b.timestamp - a.timestamp);
    }
    saveToLocalStorage();
  }

  return {
    recents,
    addOrUpdateRemoveRecent
  };
});