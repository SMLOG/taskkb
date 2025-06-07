<template>
  <div class="flex items-end bg-gray-200 rounded-lg shadow-sm" style="height: 40px;">
    <Tab
      v-for="(tab, index) in tabsStore.tabs"
      :key="index"
      :tab="tab"
      :isActive="tabsStore.activeTab === index"
      @removeTab="tabsStore.removeTab(index)"
      @click="tabsStore.setActiveTab(index)"
    />
    <button
      @click="tabsStore.addTab"
      class="plus-button text-gray-500 hover:text-blue-600 hover:bg-gray-300 rounded-full transition-all duration-200"
      title="Add New Tab"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { useTabsStore } from '@/stores/tabsStore';
import Tab from './Tab.vue';

const tabsStore = useTabsStore();
</script>

<style scoped>
/* Custom styles remain the same */
.tab {
  position: relative;
  clip-path: polygon(10px 0, calc(100% - 10px) 0, 100% 100%, 0 100%);
  transition: all 0.2s ease-in-out;
}
.tab.active {
  background-color: #ffffff;
  color: #1f2a44;
  z-index: 10;
}
.tab:not(.active) {
  background-color: #e5e7eb;
  color: #6b7280;
}
.tab:not(.active):hover {
  background-color: #d1d5db;
}
.tab:not(:last-child)::after {
  content: '';
  position: absolute;
  right: -1px;
  top: 10%;
  height: 80%;
  width: 1px;
  background-color: #d1d5db;
}
.close-btn {
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
}
.tab:hover .close-btn,
.tab.active .close-btn {
  opacity: 1;
}
.plus-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-left: 8px;
}
</style>