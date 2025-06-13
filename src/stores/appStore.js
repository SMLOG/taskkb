import { defineStore } from 'pinia';
import { ref } from 'vue';
import { readJsonAttachment, writeObjectToJsonAttachment } from '@/api/jira';
import { loopToSetDate } from '../lib/row-utils';

export const useAppStore = defineStore('app', () => {
  // Tabs state
  const tabs = ref([]);
  const tabsDataMapRef = ref({});
  const activeTabRef = ref(-1);
  const schReadyRef = ref(false);
  // Tree and config state
  const treeRef = ref({ _childs: [] });
  const configRef = ref({ cols: [] });
  const attachFileName = 'perfecttdo.json';

  // Initialize store
  async function initLoadTabsData() {
    try {
      console.log('Initializing store...');

      const { attachmentId, content: appState } = await readJsonAttachment(attachFileName);
      attachmentIdRef.value = attachmentId;
      if (appState) {
        tabs.value = appState.tabs || [];
      }

      for (const tab of tabs.value) {
        let { config, data } = appState.datas[tab.id];
        if (data && config) {
          tabsDataMapRef.value[tab.id] = { data, config };
        }
      }
      let activeTabIndex = appState.activeTab >= 0 && appState.activeTab < tabs.value.length ? appState.activeTab : tabs.length > 0 ? 0 : -1;
      await setActiveTab(activeTabIndex);

    } catch (error) {
      console.error('Failed to initialize store:', error);
    }
  }

  // Load active tab
  async function loadActiveTab() {
    try {
      if (activeTabRef.value < tabs.value.length && activeTabRef.value >= 0) {
        await setActiveTab(activeTabRef.value);
      }
    } catch (error) {
      console.error('Failed to load active tab:', error);
    }
  }

  async function saveCurrentTabData() {
    try {
      if (activeTabRef.value >= 0 && activeTabRef.value < tabs.value.length) {
        const tab = tabs.value[activeTabRef.value];

        tabsDataMapRef.value[tab.id] = { config: configRef.value, data: treeRef.value }
        const result = await writeObjectToJsonAttachment(
          { tabs: tabs.value, activeTab: activeTabRef.value, datas: tabsDataMapRef.value },
          attachFileName, attachmentIdRef.value
        );
        attachmentIdRef.value = result.attachmentId
        console.log('attachment id', attachmentIdRef.value)
        if (result) {
          tab.saved = true;
          console.log(`Saved data for tab ${tab.id}`);
        } else {
          console.error('Failed to save some or all attachments');
        }
      }
    } catch (error) {
      console.error('Failed to save current tab data:', error);
    }
  }

  async function addTab(tabId, title) {
    try {
      const tab = { id: tabId, title };
      const tabData = {
        config: { cols: [], title },
        data: { _childs: [] }
      };

      tabs.value.push(tab);
      tabsDataMapRef.value[tab.id] = tabData;
      activeTabRef.value = tabs.value.length - 1;

      treeRef.value = tabData.data;
      configRef.value = tabData.config;

      return tab;
    } catch (error) {
      console.error('Failed to add tab:', error);
    }
  }

  async function importToNewTab(tabId, data) {
    try {
      const tab = await addTab(tabId, data.config.title);
      await setActiveTab(-1);
      await loadTabData(tab, data);
      await setActiveTab(tabs.value.length - 1);
    } catch (error) {
      console.error('Failed to import to new tab:', error);
    }
  }

  function getCurrentTab() {
    return tabs.value[activeTabRef.value];
  }

  async function removeTab(index) {
    try {
      const tab = tabs.value[index];
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

  async function loadTabData(tab, external) {
    try {
      if (external) {
        const { data, config } = external;
        tabsDataMapRef.value[tab.id] = { data, config };
      } else {
        let data = await readJsonAttachment(`${tab.id}-data.json`);
        let config = await readJsonAttachment(`${tab.id}-config.json`);
        if (data && config) {
          loopToSetDate(data);
          tabsDataMapRef.value[tab.id] = { data, config };
        }
      }
    } catch (error) {
      console.error(`Failed to load tab data for ${tab.id}:`, error);
    }
  }

  async function setActiveTab(index) {
    try {
      if (activeTabRef.value === index) return;
      if (index >= 0 && index < tabs.value.length) {
        activeTabRef.value = index;
        const tab = tabs.value[index];

        if (!tabsDataMapRef.value[tab.id]) {
          await loadTabData(tab);
        }
        const tabData = tabsDataMapRef.value[tab.id];

        if (tabData) {
          treeRef.value = tabData.data;
          configRef.value = tabData.config;
        }
        schReadyRef.value = false;
      } else {
        activeTabRef.value = index;
        schReadyRef.value = false;
      }

    } catch (error) {
      console.error('Failed to set active tab:', error);
    }
  }

  const attachmentIdRef = ref(-1);
  async function saveData() {
    try {

      await saveCurrentTabData();
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }



  // Initialize store
  initLoadTabsData().catch(error => console.error('Init failed:', error));

  return {
    initLoadTabsData,
    tabs,
    activeTabRef,
    treeRef,
    configRef,
    schReadyRef,
    addTab,
    removeTab,
    setActiveTab,
    saveData,
    loadActiveTab,
    getCurrentTab,
    importToNewTab
  };
});