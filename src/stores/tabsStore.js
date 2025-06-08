// stores/tabsStore.js
import { defineStore } from 'pinia';

export const useTabsStore = defineStore('tabs', {
  state: () => ({
    tabs: [],
    activeTab: -1,
  }),
  actions: {
    addTab(tabId,title) {
      this.tabs.push({
      id: tabId,
      title,
      config: {cols:[]}, // Empty config
      data: {}, // Initial data
      });
      this.activeTab = this.tabs.length - 1;
    },
    removeTab(index) {
      this.tabs.splice(index, 1);
      if (this.tabs.length === 0) {
        this.activeTab = 0;
      } else if (this.activeTab >= this.tabs.length) {
        this.activeTab = this.tabs.length - 1;
      } else if (this.activeTab > index) {
        this.activeTab--;
      }
    },
    setActiveTab(index) {
      this.activeTab = index;
    },
  },
});
