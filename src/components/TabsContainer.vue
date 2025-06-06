<script setup>
import { computed, ref, onMounted } from 'vue';
import { useTabsStore } from '@/stores/tabs';
import { v4 as uuidv4 } from 'uuid';
import TabContent from './TabContent.vue';

// Initialize Pinia store
const tabsStore = useTabsStore();

// Input for new tab name
const newTabName = ref('');

// Computed properties
const tabs = computed(() => tabsStore.tabsState.tabs);
const activeTabId = computed(() => {
  const index = tabsStore.tabsState.curTab;
  return index >= 0 && index < tabs.value.length ? tabs.value[index].id : '';
});

const tabIndex = computed(() => {
  return tabsStore.tabsState.curTab;
});


// Add a new tab with user-defined name
const addTab = () => {
  const tabName = newTabName.value.trim() || `Tab ${tabs.value.length + 1}`;
  const newTabId = uuidv4();
  tabsStore.addTab(newTabId, tabName);
  newTabName.value = ''; // Clear input
};

// Switch tabs by index
const switchTab = (tabIndex) => {
  tabsStore.setActiveTab(tabIndex);
};
const activeTabData = computed(() => {
  const index = tabsStore.tabsState.curTab;
  return index >= 0 && index < tabs.value.length ? tabs.value[index] : null;
});
// Initialize tabs
onMounted(() => {
  tabsStore.loadFromStorage();
  if (tabs.value.length === 0) {
    const initialTabId = uuidv4();
    tabsStore.addTab(initialTabId, 'Tab 1');
  }
});
</script>

<template>
  <div class="max-w-2xl mx-auto p-4 sm:p-6">
    <!-- Tab navigation -->
    <div class="flex flex-wrap gap-2 mb-4">
      <button
        v-for="(tab, index) in tabs"
        :key="tab.id"
        :class="[
          'px-4 py-2 rounded-md transition-colors',
          index === tabsStore.tabsState.curTab
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        ]"
        @click="switchTab(index)"
      >
        {{ tab.tabName }}
      </button>
    </div>

    <!-- Form to add new tab -->
    <div class="flex gap-2 mb-4">
      <input
        v-model="newTabName"
        placeholder="Enter tab name"
        class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        @keyup.enter="addTab"
      />
      <button
        @click="addTab"
        class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
      >
        + Add Tab
      </button>
    </div>

    <!-- Tab content -->
    <keep-alive>
      <component
        :is="TabContent"
        :tabId="activeTabId"
        :tabIndex="tabIndex"
        v-if="activeTabId"
      />
    </keep-alive>
  </div>
</template>