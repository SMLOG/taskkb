// stores/tabsStore.js
import { defineStore } from 'pinia';
import { useTreeStore } from './treeStore'
export const useTabsStore = defineStore('tabs', {
  state: () => ({
    tabs: [],
    activeTab: -1,
  }),
  actions: {
    addTab(tabId,title) {

      const tab = {
      id: tabId,
      title,
      config: {cols:[]}, // Empty config
      data: {}, // Initial data
      };
      this.tabs.push(tab);
      this.activeTab = this.tabs.length - 1;

     const treeStore = useTreeStore();
     treeStore.loadTabData(tab);
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

    const tab = this.tabs[index];
     const treeStore = useTreeStore();
     treeStore.loadTabData(tab);
    },
  },
});
