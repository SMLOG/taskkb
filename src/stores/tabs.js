// stores/tabsStore.js
import { defineStore } from 'pinia';

export const useTabsStore = defineStore('tabs', {
  state: () => ({
    tabs: [
      { title: 'Tab 1', content: 'Content for Tab 1' },
    ],
    activeTab: 0,
  }),
  actions: {
    addTab() {
      const newTabNumber = this.tabs.length + 1;
      this.tabs.push({
        title: `Tab ${newTabNumber}`,
        content: `Content for Tab ${newTabNumber}`,
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
