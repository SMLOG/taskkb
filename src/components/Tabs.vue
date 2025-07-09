<template>
  <div 
    class="tabs flex items-end flex-1"
    ref="tabsContainer"
  >
    <Tab
      v-for="(tab, index) in appStore.tabs"
      :key="tab.id || index"
      :tab="tab"
      :isActive="appStore.activeTabRef === index"
      @removeTab="$emit('removeTab',index)"
      @click="appStore.setActiveTab(index)"
      draggable="true"
      @dragstart="handleDragStart($event, index)"
      @dragenter.prevent="handleDragEnter($event, index)"
      @dragover.prevent="handleDragOver($event, index)"
      @dragend="handleDragEnd"
      @touchstart="handleTouchStart($event, index)"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      :class="{
        'dragging': draggedIndex === index, 
        'drag-over': dragOverIndex === index,
        'touch-dragging': isTouchDragging && draggedIndex === index
      }"
    />
    <slot></slot>
  </div>
</template>

<script setup>
import { useAppStore } from "@/stores/appStore";
import Tab from '@/components/Tab.vue';
import { ref, onMounted, onUnmounted } from 'vue';

const appStore = useAppStore();
const tabsContainer = ref(null);

const draggedIndex = ref(null);
const dragOverIndex = ref(null);
const isTouchDragging = ref(false);
const touchStartX = ref(0);
const touchStartY = ref(0);
const touchCurrentX = ref(0);
const touchStartScrollLeft = ref(0);
const tabElementWidth = ref(0);

const handleDragStart = (e, index) => {
  draggedIndex.value = index;
  e.dataTransfer.effectAllowed = 'move';
  setTimeout(() => {
    e.target.classList.add('dragging');
  }, 0);
};

const handleDragEnter = (e, index) => {
  e.preventDefault();
  if (draggedIndex.value !== index) {
    dragOverIndex.value = index;
  }
};

const handleDragOver = (e, index) => {
  e.preventDefault();
  if (draggedIndex.value !== index) {
    dragOverIndex.value = index;
  }
  e.dataTransfer.dropEffect = 'move';
};

const handleDragEnd = (e) => {
  e.preventDefault();
  completeDrop();
  resetDragState();
};

// Touch event handlers
const handleTouchStart = (e, index) => {
  const touch = e.touches[0];
  touchStartX.value = touch.clientX;
  touchStartY.value = touch.clientY;
  touchCurrentX.value = touch.clientX;
  draggedIndex.value = index;
  isTouchDragging.value = false; // Will be set to true after movement threshold
  
  // Get the tab element dimensions
  const tabElement = e.currentTarget;
  tabElementWidth.value = tabElement.offsetWidth;
  
  // Store initial scroll position
  touchStartScrollLeft.value = tabsContainer.value.scrollLeft;
  
  // Prevent scroll during potential drag
  tabsContainer.value.style.overflowX = 'hidden';
  
  // Add active class after a small delay
  setTimeout(() => {
    if (draggedIndex.value === index) {
      tabElement.classList.add('touch-dragging');
    }
  }, 100);
};

const handleTouchMove = (e) => {
  if (draggedIndex.value === null) return;
  
  const touch = e.touches[0];
  touchCurrentX.value = touch.clientX;
  
  // Calculate movement distance
  const deltaX = touch.clientX - touchStartX.value;
  const deltaY = touch.clientY - touchStartY.value;
  
  // Check if movement exceeds threshold to start dragging
  if (!isTouchDragging.value && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
    isTouchDragging.value = Math.abs(deltaX) > Math.abs(deltaY);
  }
  
  if (isTouchDragging.value) {
    e.preventDefault();
    
    // Move the tab horizontally
    const tabElement = document.querySelector('.tab.touch-dragging');
    if (tabElement) {
      const dragOffset = deltaX;
      tabElement.style.transform = `translateX(${dragOffset}px)`;
      
      // Calculate which tab we're hovering over
      const containerRect = tabsContainer.value.getBoundingClientRect();
      const touchX = touch.clientX - containerRect.left;
      
      // Find the index of the tab we're hovering over
      let newDragOverIndex = null;
      const tabs = Array.from(tabsContainer.value.querySelectorAll('.tab'));
      let accumulatedWidth = 0;
      
      tabs.forEach((tab, index) => {
        const tabWidth = tab.offsetWidth;
        if (touchX >= accumulatedWidth && touchX < accumulatedWidth + tabWidth) {
          newDragOverIndex = index;
        }
        accumulatedWidth += tabWidth;
      });
      
      if (newDragOverIndex !== null && newDragOverIndex !== dragOverIndex.value) {
        dragOverIndex.value = newDragOverIndex;
      }
    }
  }
};

const handleTouchEnd = () => {
  if (isTouchDragging.value) {
    completeDrop();
  }
  resetDragState();
};

const completeDrop = () => {
  const dropIndex = dragOverIndex.value;
  
  if (draggedIndex.value !== null && dropIndex !== null && draggedIndex.value !== dropIndex) {
    // Reorder tabs in the store
    const newTabs = [...appStore.tabs];
    const [removed] = newTabs.splice(draggedIndex.value, 1);
    newTabs.splice(dropIndex, 0, removed);
    
    // Update tabs in the store
    appStore.setTabs(newTabs);
    
    // Update active tab if needed
    if (appStore.activeTabRef === draggedIndex.value) {
      appStore.setActiveTab(dropIndex);
    } else if (
      appStore.activeTabRef > draggedIndex.value && 
      appStore.activeTabRef <= dropIndex
    ) {
      appStore.setActiveTab(appStore.activeTabRef - 1);
    } else if (
      appStore.activeTabRef < draggedIndex.value && 
      appStore.activeTabRef >= dropIndex
    ) {
      appStore.setActiveTab(appStore.activeTabRef + 1);
    }
  }
};

const resetDragState = () => {
  // Reset all dragging styles
  const draggingElements = document.querySelectorAll('.tab.dragging, .tab.touch-dragging');
  draggingElements.forEach(el => {
    el.classList.remove('dragging', 'touch-dragging');
    el.style.transform = '';
  });
  
  // Reset state variables
  draggedIndex.value = null;
  dragOverIndex.value = null;
  isTouchDragging.value = false;
  
  // Restore container scrolling
  if (tabsContainer.value) {
    tabsContainer.value.style.overflowX = '';
  }
};

// Clean up event listeners
onUnmounted(() => {
  resetDragState();
});
</script>

<style scoped>
@reference "@/assets/main.css";

.tab {
  position: relative;
  transition: all 0.2s ease-in-out;
  user-select: none;
  touch-action: pan-x; /* Allow horizontal touch movement */
}

.tab.active {
  @apply bg-white text-gray-900 dark:bg-black dark:text-white z-1;
}

.tab:not(.active) {
  @apply bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300;
}

.tab:not(.active):hover {
  @apply bg-gray-200 dark:bg-gray-700;
}

.tab:not(:last-child)::after {
  content: '';
  position: absolute;
  right: -1px;
  top: 10%;
  height: 80%;
  width: 1px;
  @apply bg-gray-300 dark:bg-gray-600;
  z-index: 1;
}

.close-btn {
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
}

.tab:hover .close-btn,
.tab.active .close-btn {
  opacity: 1;
}

/* Drag and drop styles */
.tab.dragging {
  opacity: 0.5;
  transform: scale(0.95);
  cursor: move;
}

.tab.touch-dragging {
  opacity: 0.9;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.1s ease-out;
}

.tab.drag-over {
  position: relative;
}

.tab.drag-over::before {
  content: '';
  position: absolute;
  top: 0;
  left: -2px;
  height: 100%;
  width: 4px;
  @apply bg-blue-500;
  z-index: 2;
}

/* For mobile devices */
@media (pointer: coarse) {
  .tab {
    /* Increase touch target size */
    padding: 8px 16px;
  }
  
  .close-btn {
    /* Make close button easier to tap */
    padding: 8px;
    margin-left: 8px;
  }
}
</style>