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
      @removeTab="showRmoveConfirmRef=index"
      @click="appStore.setActiveTab(index)"
      draggable="true"
      @dragstart="handleDragStart($event, index)"
      @dragenter.prevent="handleDragEnter($event, index)"
      @dragover.prevent="handleDragOver($event, index)"
      @dragend="handleDragEnd"
      :class="{'dragging': draggedIndex === index, 'drag-over': dragOverIndex === index}"
    />
    <slot></slot>
  </div>
</template>

<script setup>
import { useAppStore } from "@/stores/appStore";
import Tab from '@/components/Tab.vue';
import { ref } from 'vue';

const appStore = useAppStore();
const tabsContainer = ref(null);

const draggedIndex = ref(null);
const dragOverIndex = ref(null);

const handleDragStart = (e, index) => {
  draggedIndex.value = index;
  e.dataTransfer.effectAllowed = 'move';
  // Set a custom drag image for better visual feedback
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
  
  // Reset drag state
  draggedIndex.value = null;
  dragOverIndex.value = null;
  e.target.classList.remove('dragging');
};
</script>

<style scoped>
@reference "@/assets/main.css";

.tab {
  position: relative;
  transition: all 0.2s ease-in-out;
  user-select: none;
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
  cursor:move;
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
</style>