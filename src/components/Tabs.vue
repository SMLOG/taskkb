<template>
    <div class="tabs flex items-end flex-1">
    <Tab
      v-for="(tab, index) in appStore.tabs"
      :key="index"
      :tab="tab"
      :isActive="appStore.activeTabRef === index"
      @removeTab="showRmoveConfirmRef=index"
      @click="appStore.setActiveTab(index)"
    />
    <slot></slot>

  </div>

</template>

<script setup>
import { useAppStore } from "@/stores/appStore";
import Tab from '@/components/Tab.vue';
const appStore = useAppStore();

</script>

<style scoped>
@reference "@/assets/main.css";

.tab {
  position: relative;
  transition: all 0.2s ease-in-out;
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


</style>