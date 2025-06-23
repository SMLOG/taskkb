import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getStorageBridge, getStorageBridgeByName } from '@/api/bridge';
import {loopTree} from '@/lib/treelib';
import {weeksBetween} from '@/lib/schedule';
import { useModeStore } from '@/stores/modeStore';
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
  const showPopUp = ref(0);
  const loading = ref(true);
  // Initialize store

  const modeStore = useModeStore();

  function updateShowUp(value){
    showPopUp.value = value;
    console.log(showPopUp.value)
  }

  async function loadFile(storageType,fileId,tabId){

   if(fileId && storageType) path.value = {
      mode:storageType,
      id : fileId,
      tabId
    }
   await initLoadTabsData(storageType);
 
  }
  async function initLoadTabsData(storageType) {
      loading.value = true;
      console.log('Initializing store...');
      let rootData = {tabs:[]};
      if(storageType && storageType){
        const {readJsonAttachment,type} = await getStorageBridge(path.value.mode);
        typeRef.value=type;
        console.log(path.value)
        const { path:pathData, content: objData } = await readJsonAttachment(path.value,useUserStore().getUser());
        console.log(pathData)
        if(!objData){
          showPopUp.value = 2;
          return;
        }
       rootData = objData;
      }

      if (rootData) {
        tabs.value = rootData.tabs ;
      }

      for (const tab of tabs.value) {
        let { config, data } = rootData.datas[tab.id];
        if (data && config) {
          tabsDataMapRef.value[tab.id] = { data, config };
        }
      }

      let activeTabIndex = rootData&&rootData.activeTab >= 0 && rootData.activeTab < tabs.value.length ? rootData.activeTab : tabs.length > 0 ? 0 : -1;
      let theTabs = tabs.value.filter(e=>e.id===path.value.tabId);
      if(path.value.tabId&&theTabs.length>0){
        activeTabIndex= tabs.value.indexOf(theTabs[0]);
      }
      await setActiveTab(activeTabIndex);

 
    loading.value = false;
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

  
  async function saveAll() {
      if (activeTabRef.value >= 0 && activeTabRef.value < tabs.value.length) {
        const tab = tabs.value[activeTabRef.value];

        tabsDataMapRef.value[tab.id] = { config: configRef.value, data: treeRef.value }

      }
      let startTime=0;
      let endTime=0;
      const reCalStartAndCount=(row)=>{
        if(row._tl){
          if(row._tl?.start?.date)
              if(startTime===0||row._tl.start.date.getTime()<startTime){
                startTime =row._tl.start.date.getTime();
              }

              if(endTime===0||row._tl.end.date.getTime()>endTime){
                 endTime =row._tl.end.date.getTime();
              }
        }
      }
      loopTree(treeRef.value,reCalStartAndCount);

      let weekCount = weeksBetween(new Date(startTime),new Date(endTime));

      configRef.value.startDate = new Date(startTime);
      configRef.value.weekCount = weekCount;
 
        
        const {writeObjectToJsonAttachment} = await getStorageBridgeByName(path.value.mode);

        
        const result = await writeObjectToJsonAttachment(
          { tabs: tabs.value, activeTab: activeTabRef.value, datas: tabsDataMapRef.value },path.value,useUserStore().getUser());
        let orgPath = JSON.parse(JSON.stringify(path.value));
         Object.assign(path.value,result);

        tabs.value.map(tab=>tab.saved=true);
       path.value.tabId = getCurrentTab().id;

        useHashStore().updatePath(path.value);
        
        

        console.log(`Saved data  attachment from ${orgPath&&JSON.stringify(orgPath,2)}  to ${path.value && JSON.stringify(path.value)}`);


      
 
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
      //await setActiveTab(-1);
      await loadTabData(tab, data);
      await setActiveTab(tabs.value.length - 1);
    } catch (error) {
      console.error('Failed to import to new tab:', error);
    }
  }

  async function loadTabData(tab,data){
    tabsDataMapRef.value[tab.id] = data;
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

    } catch (error) {
      console.error('Failed to set active tab:', error);
    }
    path.value.tabId = getCurrentTab().id;
    useHashStore().updatePath(path.value);

  }

  async function saveData() {
    try {

      await saveAll();
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }

  function setTabs(newTabs) {
    tabs.value = newTabs;
  }




  return {
    initLoadTabsData,
    tabs,path,
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
    importToNewTab,loadFile,showPopUp,updateShowUp,loading
  };
});