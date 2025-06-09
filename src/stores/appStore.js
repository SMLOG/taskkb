import { defineStore } from 'pinia';
import { ref } from 'vue';

function loopToSetDate(row) {
  if (row._tl) {
    let peroid = row._tl;
    if (!peroid.start || !peroid.end) {
      peroid.start = peroid.end = null;
    } else {
      peroid.start.date = new Date(peroid.start.date);
      peroid.end.date = new Date(peroid.end.date);
    }
  }
  if (row._childs) {
    for (let ch of row._childs) {
      loopToSetDate(ch);
    }
  }
}

export const useAppStore = defineStore('app', () => {
  // Tabs state
  const tabs = ref([]);
  const tabsDataMapRef = ref({});
  const activeTabRef = ref(-1);
  
  // Tree and config state
  const treeRef = ref({ _childs: [] });
  const configRef = ref({ cols: [] });

  // Initialize store
  async function init() {
    try {
   
      const storedTabs = localStorage.getItem('tabs');
      if (storedTabs) {
        tabs.value = JSON.parse(storedTabs);
        tabs.value.forEach(tab => {
          if (tab.data && tab.data._childs) {
            for (let r of tab.data._childs) {
              loopToSetDate(r);
            }
          }
        });
      }

      const activeTab = localStorage.getItem('activeTab');
      if(activeTab<tabs.value.length&&tabs.value>=0){
        activeTabRef.value = activeTab;
      }


    } catch (error) {
      console.error('Failed to initialize store:', error);
    }
  }

  // Save current tab's tree and config data
  async function saveCurrentTabData() {
    try {
      if (activeTabRef.value >= 0 && activeTabRef.value < tabs.value.length) {
        const tab = tabs.value[activeTabRef.value];
        
        // Save to localStorage
        localStorage.setItem('tabs', JSON.stringify(tabs.value));
        localStorage.setItem('activeTab', activeTabRef.value);
        localStorage.setItem(`${tab.id}-data`, JSON.stringify(treeRef.value));
        localStorage.setItem(`${tab.id}-config`, JSON.stringify(configRef.value));
      }
    } catch (error) {
      console.error('Failed to save current tab data:', error);
    }
  }

  // Tab management actions
  async function addTab(tabId, title) {
    try {
      const tab = {
        id: tabId,
        title

      };
      const tabData={        
        config: { cols: [] },
      data: { _childs: [] }
    }

      tabs.value.push(tab);
      tabsDataMapRef.value[tab.id]=tabData;
      activeTabRef.value = tabs.value.length - 1;
      
      // Update current tree and config to new tab's data
      treeRef.value = tabData.data;
      configRef.value = tabData.config;
      
      // Save to localStorage
      await saveCurrentTabData();
    } catch (error) {
      console.error('Failed to add tab:', error);
    }
  }

  async function removeTab(index) {
    try {
        let tab = tabs.value[id];
        tabs.value.splice(index, 1);
        delete tabsDataMapRef.value[tab.id];
        
      if (tabs.value.length === 0) {
        activeTabRef.value = -1;
        treeRef.value = { _childs: [] };
        configRef.value = { cols: [] };
      } else if (activeTabRef.value >= tabs.value.length) {
        activeTabRef.value = tabs.value.length - 1;
        await setActiveTab(activeTabRef.value);
      } else if (activeTabRef.value > index) {
        activeTabRef.value--;
        await setActiveTab(activeTabRef.value);
      }
    } catch (error) {
      console.error('Failed to remove tab:', error);
    }
  }

  async function  loadTabData(tab){
    let data = JSON.parse(localStorage.getItem(`${tab.id}-data`));
    let config = JSON.parse(localStorage.getItem(`${tab.id}-config`));
    tabsDataMapRef.value[tab.id]= {data,config};
  }

  async function setActiveTab(index) {
    try {
      if (index >= 0 && index < tabs.value.length) {
        activeTabRef.value = index;
        const tab = tabs.value[index];

        if(!tabsDataMapRef.value[tab.id]){
            loadTabData(tab);
        }
        const tabData = tabsDataMapRef.value[tab.id];

        treeRef.value = tabData.data;
        configRef.value = tabData.config;
      }
    } catch (error) {
      console.error('Failed to set active tab:', error);
    }
  }

  // Save tree data
  async function saveData() {
    try {
      await saveCurrentTabData(); // Ensure tab data is updated
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }

  // Save config
  async function saveConfig() {
    try {
      await saveCurrentTabData(); // Ensure tab config is updated
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  }

  // Initialize store
  init().catch(error => console.error('Init failed:', error));

  return {
    tabs,
    activeTabRef,
    treeRef,
    configRef,
    addTab,
    removeTab,
    setActiveTab,
    saveData,
    saveConfig,
    saveCurrentTabData
  };
});