import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getStorageBridge, getStorageBridgeByName } from '@/api/bridge';
import { loopTree } from '@/lib/treelib';
import { weeksBetween } from '@/lib/schedule';
import { useUserStore } from './userStore';
import { useHashStore } from './hashStore';

export const useAppStore = defineStore('app', () => {
  // Tabs state
  const tabs = ref([]);
  const path = ref(null);
  const tabsDataMapRef = ref({});
  const activeTabRef = ref(-1);
  const schReadyRef = ref(false);
  // Tree and config state
  const treeRef = ref(null);
  const configRef = ref(null);
  const typeRef = ref(null);
  const loading = ref(true);




  async function loadFile(storageType, fileId, tabId) {

    path.value = {
      mode: storageType,
      id: fileId,
      tabId
    }
    await initLoadTabsData();

  }
  async function initLoadTabsData() {
    loading.value = true;
    console.log('Initializing store...');
  
    try {
      let rootData = { tabs: [], datas: {}, activeTab: -1 };
  
      // Load data based on path mode
      if (path.value?.mode) {
        const { readJsonAttachment, type } = await getStorageBridge(path.value.mode);
        typeRef.value = type;
        
        const { content: objData } = await readJsonAttachment(
          path.value, 
          useUserStore().getUser()
        );
        rootData = objData ?? rootData;
      }
  
      // Initialize tabs
      tabs.value = rootData.tabs ?? [];
  
      // Populate tabs data map
      tabsDataMapRef.value = Object.fromEntries(
        tabs.value
          .filter(tab => rootData.datas?.[tab.id]?.data && rootData.datas?.[tab.id]?.config)
          .map(tab => [tab.id, {
            data: rootData.datas[tab.id].data,
            config: rootData.datas[tab.id].config
          }])
      );
  
      // Determine active tab index
      let activeTabIndex = -1;
      if (path.value?.tabId) {
        const targetTab = tabs.value.find(tab => tab.id === path.value.tabId);
        if (targetTab) {
          activeTabIndex = tabs.value.indexOf(targetTab);
        }
      } else if (rootData.activeTab >= 0 && rootData.activeTab < tabs.value.length) {
        activeTabIndex = rootData.activeTab;
      } else if (tabs.value.length > 0) {
        activeTabIndex = 0;
      }
  
      await setActiveTab(activeTabIndex);
  
    } catch (error) {
      console.error('Failed to initialize tabs data:', error);
      tabs.value = [];
      tabsDataMapRef.value = {};
      await setActiveTab(-1);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  // Load active tab
  async function loadActiveTab() {
    if (activeTabRef.value < tabs.value.length && activeTabRef.value >= 0) {
      await setActiveTab(activeTabRef.value);
    }
  }


  async function saveData() {
    if (activeTabRef.value >= 0 && activeTabRef.value < tabs.value.length) {
      const tab = tabs.value[activeTabRef.value];

      tabsDataMapRef.value[tab.id] = { config: configRef.value, data: treeRef.value }

    }

    if(treeRef.value){
      let startTime = 0;
      let endTime = 0;
      const reCalStartAndCount = (row) => {
        if (row._tl) {
          if (row._tl?.start?.date)
            if (startTime === 0 || row._tl.start.date.getTime() < startTime) {
              startTime = row._tl.start.date.getTime();
            }
  
          if (endTime === 0 || row._tl.end.date.getTime() > endTime) {
            endTime = row._tl.end.date.getTime();
          }
        }
      }
      loopTree(treeRef.value, reCalStartAndCount);

      let weekCount = weeksBetween(new Date(startTime), new Date(endTime));
  
      configRef.value.startDate = new Date(startTime);
      configRef.value.weekCount = weekCount;

    }

    const { writeObjectToJsonAttachment } = await getStorageBridgeByName(path.value.mode);


    const result = await writeObjectToJsonAttachment(
      { tabs: tabs.value, activeTab: activeTabRef.value, datas: tabsDataMapRef.value }, path.value, useUserStore().getUser());
    let orgPath = JSON.parse(JSON.stringify(path.value));
    Object.assign(path.value, result);

    tabs.value.map(tab => tab.saved = true);
    path.value.tabId = getCurrentTab().id;

    useHashStore().updatePath(path.value);



    console.log(`Saved data  attachment from ${orgPath && JSON.stringify(orgPath, 2)}  to ${path.value && JSON.stringify(path.value)}`);




  }

  async function addTab(tabId, title, data = null) {
    // Validate inputs
    if (!tabId || typeof tabId !== 'string') {
      throw new Error('Invalid or missing tabId');
    }
    if (!title || typeof title !== 'string') {
      throw new Error('Invalid or missing title');
    }
  
    // Create tab object
    const tab = { id: tabId, title };
  
    // Define default tab data structure
    const defaultTabData = {
      config: { cols: [], title },
      data: { children: [] } // Renamed _childs to children for clarity
    };
  
    // Add tab and its data to respective stores
    tabs.value.push(tab);
    tabsDataMapRef.value[tabId] = data ?? defaultTabData;
  
    return tab;
  }

  async function importToNewTab(tabId, data) {
      const tab = await addTab(tabId, data.config.title,data);
      await setActiveTab(tabs.value.length - 1);
 
  }


  function getCurrentTab() {
    return tabs.value[activeTabRef.value];
  }

  async function removeTab(index) {
    try {
      // Store current tab to be removed
      const tab = tabs.value[index];
  
      // Adjust active tab index before removal
      if (tabs.value.length === 1) {
        setActiveTab(-1);
      } else if (activeTabRef.value >= index) {
        await setActiveTab(Math.max(0, activeTabRef.value - 1));
      }
  
      // Remove tab and associated data
      tabs.value.splice(index, 1);
      delete tabsDataMapRef.value[tab.id];
  
      // Reset state if no tabs remain
  
  
    } catch (error) {
      console.error('Failed to remove tab:', error);
    }
  }


  async function setActiveTab(index) {
    try {
      if (activeTabRef.value === index) return;
      if (index >= 0 && index < tabs.value.length) {
        activeTabRef.value = index;
        const tab = tabs.value[index];


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

      if(index<0){
        if (tabs.value.length === 0) {
          treeRef.value = { _childs: [] };
          configRef.value = { cols: [] };
        } 
      }

    } catch (error) {
      console.error('Failed to set active tab:', error);
    }
    path.value.tabId = getCurrentTab()?.id;
    useHashStore().updatePath(path.value);

  }


  function setTabs(newTabs) {
    tabs.value = newTabs;
  }

  function resetPath() {
    path.value = null;
    useHashStore().updatePath(path.value)
  }



  return {
    initLoadTabsData,
    tabs, path,
    activeTabRef,
    treeRef,
    configRef,
    schReadyRef,
    typeRef,
    setTabs,
    addTab,
    removeTab,
    setActiveTab,
    saveData,
    loadActiveTab,
    getCurrentTab,
    importToNewTab, loadFile, loading,
    resetPath
  };
});