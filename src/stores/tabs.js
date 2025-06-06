import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
export const useTabsStore = defineStore('tabs', () => {
  // Reactive state
  const tabsState = ref({
    tabs: [], // Array of { id, tabName, config, data }
    curTab: -1, // Index of active tab, -1 if no tabs
  });

  // Actions
  const addTab = (tabId, tabName) => {
    tabsState.value.tabs.push({
      id: tabId,
      tabName,
      config: {cols:[]}, // Empty config
      data: {}, // Initial data
    });
    tabsState.value.curTab = tabsState.value.tabs.length - 1; // Set to new tab's index
    saveToStorage();
  };

  const setTabData = (tabId, data) => {
    const tab = tabsState.value.tabs.find(t => t.id === tabId);
    if (tab) {
      tab.data = { ...tab.data, ...data };
      saveToStorage();
    }
  };

  const getTabData = (tabId) => {
    const tab = tabsState.value.tabs.find(t => t.id === tabId);
    return tab ? tab.data : { content: '' }; // Fallback to empty data
  };

  const getCurTabData = () => {
    return tabsState.value.tabs[tabsState.value.curTab];
  };

  const setActiveTab = (tabIndex) => {
    if (tabIndex >= 0 && tabIndex < tabsState.value.tabs.length) {
      tabsState.value.curTab = tabIndex;
      saveToStorage();
    }
  };

  const saveToStorage = () => {
    console.log('saveto')
    localStorage.setItem('tabsState', JSON.stringify(tabsState.value));
  };

  const loadFromStorage = () => {
    const saved = localStorage.getItem('tabsState');
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.assign(tabsState.value, {
        tabs: parsed.tabs || [],
        curTab: parsed.curTab >= 0 && parsed.curTab < (parsed.tabs?.length || 0) ? parsed.curTab : -1,
      });
    }
  };
  loadFromStorage();
  return {
    tabsState,
    addTab,
    setTabData,
    getTabData,
    getCurTabData,
    setActiveTab,
    saveToStorage,
    loadFromStorage,
  };
});