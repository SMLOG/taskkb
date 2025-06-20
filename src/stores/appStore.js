import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getStorageBridge } from '@/api/bridge';
import {loopTree} from '@/lib/treelib';
import {weeksBetween} from '@/lib/schedule';
import { useModeStore } from '@/stores/modeStore';

export const useAppStore = defineStore('app', () => {
  // Tabs state
  const tabs = ref([]);
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

    initLoadTabsData(storageType,fileId,tabId).catch(error => console.error('Init failed:', error));
  }
  async function initLoadTabsData(storageType,fileId,tabId) {
    try {
      loading.value = true;
      console.log('Initializing store...');
      let rootData = {tabs:[]};
      if(storageType && storageType){
        const {readJsonAttachment,writeObjectToJsonAttachment,type} = await getStorageBridge(storageType);
        typeRef.value=type;
        const { attachmentId, content: objData } = await readJsonAttachment(fileId,tabId);
        attachmentIdRef.value = attachmentId;
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
      await setActiveTab(activeTabIndex);

    } catch (error) {
      console.error('Failed to initialize store:', error);
    }
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
      /*tabs.value.map(tab=>{
        tabsDataMapRef.value[tab.id].config
        forEachTree(tabsDataMapRef.value[tab.id].data,'_childs',);
      });*/
        const {readJsonAttachment,writeObjectToJsonAttachment} = await getStorageBridge();
        const result = await writeObjectToJsonAttachment(
          { tabs: tabs.value, activeTab: activeTabRef.value, datas: tabsDataMapRef.value },
          modeStore.fileName, attachmentIdRef.value
        );
        let org = attachmentIdRef.value;
        attachmentIdRef.value = result.attachmentId
        tabs.value.map(tab=>tab.saved=true);

        console.log('attachment id', attachmentIdRef.value)
        if (result) {
          console.log(`Saved data  attachment from ${org}  to ${attachmentIdRef.value}`);
        } else {
          throw new Error("Save Error");
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
  }

  const attachmentIdRef = ref(-1);
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
    tabs,
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