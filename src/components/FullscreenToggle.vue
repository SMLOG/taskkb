<template>
    <button @click="toggleFullscreen" class="btn-secondary text-xs sm:text-sm">
      <span class="hidden sm:inline">{{ isFullscreen ? '⤣ Exit' : '⤢ Fullscreen' }}</span>
      <span class="sm:hidden">{{ isFullscreen ? '⤣' : '⤢' }}</span>
    </button>
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import { showNotification } from '@/composables/useSystem';
  
  const isFullscreen = ref(false);
  
  const handleFullscreenChange = () => {
    isFullscreen.value = !!document.fullscreenElement;
  };
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error('Error entering fullscreen:', err);
        showNotification('Failed to enter fullscreen', 'error');
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error('Error exiting fullscreen:', err);
        showNotification('Failed to exit fullscreen', 'error');
      });
    }
  };
  
  onMounted(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
  });
  
  onBeforeUnmount(() => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
  });
  </script>