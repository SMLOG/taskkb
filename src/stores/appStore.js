import { defineStore } from 'pinia';
import { ref } from 'vue';
import { requestJira, getContext } from '@forge/bridge';

// Helper function to convert dates in tree data
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

// Read JSON attachment from issue
async function readJsonAttachment(filename) {
  try {
    const context = await getContext();
    const issueKey = context.extension.issue.key;
    if (!issueKey) {
      throw new Error('Issue key not found in context');
    }

    // Fetch issue attachments
    const attachmentsResponse = await requestJira(`/rest/api/3/issue/${issueKey}?fields=attachment`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (attachmentsResponse.status !== 200) {
      throw new Error(`Failed to fetch attachments: ${attachmentsResponse.status}`);
    }

    const issueData = await attachmentsResponse.json();
    const attachments = issueData.fields.attachment || [];

    // Find attachment by filename
    const jsonAttachment = attachments.find(attachment => attachment.filename === filename);
    if (!jsonAttachment) {
      return null; // No attachment found
    }

    // Download the JSON file content
    const fileResponse = await requestJira(jsonAttachment.content, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (fileResponse.status !== 200) {
      throw new Error(`Failed to download JSON file: ${fileResponse.status}`);
    }

    return await fileResponse.json();
  } catch (error) {
    console.error(`Error reading JSON attachment ${filename}:`, error.message);
    throw error;
  }
}

// Write object to JSON file as issue attachment
async function writeObjectToJsonAttachment(dataObject, filename) {
  try {
    const context = await getContext();
    const issueKey = context.extension.issue.key;
    if (!issueKey) {
      throw new Error('Issue key not found in context');
    }

    // Convert object to JSON string
    const jsonString = JSON.stringify(dataObject, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const formData = new FormData();
    formData.append('file', blob, filename);

    // Attach the file
    const response = await requestJira(`/rest/api/3/issue/${issueKey}/attachments`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'X-Atlassian-Token': 'no-check'
      },
      body: formData
    });

    if (response.status !== 200) {
      throw new Error(`Failed to attach JSON file: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error(`Error attaching JSON file ${filename}:`, error.message);
    throw error;
  }
}

export const useAppStore = defineStore('app', () => {
  // Tabs state
  const tabs = ref([]);
  const tabsDataMapRef = ref({});
  const activeTabRef = ref(-1);
  const schReadyRef = ref(false);
  // Tree and config state
  const treeRef = ref({ _childs: [] });
  const configRef = ref({ cols: [] });

  // Initialize store
  async function init() {
    try {
      // Load tabs and activeTab from app-state.json
      const appState = await readJsonAttachment('app-state.json');
      if (appState) {
        tabs.value = appState.tabs || [];
        activeTabRef.value = appState.activeTab !== undefined ? appState.activeTab : -1;
      }

      // Load data for each tab
      for (const tab of tabs.value) {
        const data = await readJsonAttachment(`${tab.id}-data.json`);
        const config = await readJsonAttachment(`${tab.id}-config.json`);
        if (data && config) {
          loopToSetDate(data);
          tabsDataMapRef.value[tab.id] = { data, config };
        }
      }

      // Load active tab data if valid
      if (activeTabRef.value >= 0 && activeTabRef.value < tabs.value.length) {
        await setActiveTab(activeTabRef.value);
      }
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

  // Save current tab's tree and config data
  async function saveCurrentTabData() {
    try {
      if (activeTabRef.value >= 0 && activeTabRef.value < tabs.value.length) {
        const tab = tabs.value[activeTabRef.value];

        // Save tab data and config
        await writeObjectToJsonAttachment(treeRef.value, `${tab.id}-data.json`);
        await writeObjectToJsonAttachment(configRef.value, `${tab.id}-config.json`);

        // Save tabs and activeTab
        const appState = { tabs: tabs.value, activeTab: activeTabRef.value };
        await writeObjectToJsonAttachment(appState, 'app-state.json');

        tab.saved = true;
      }
    } catch (error) {
      console.error('Failed to save current tab data:', error);
    }
  }

  // Tab management actions
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

      // Update current tree and config
      treeRef.value = tabData.data;
      configRef.value = tabData.config;

      // Save to Jira attachments
      await saveCurrentTabData();
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

      // Save updated state
      await saveCurrentTabData();
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

      // Save updated active tab
      await saveCurrentTabData();
    } catch (error) {
      console.error('Failed to set active tab:', error);
    }
  }

  // Save tree data
  async function saveData() {
    try {
      await saveCurrentTabData();
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }

  // Save config
  async function saveConfig() {
    try {
      await saveCurrentTabData();
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
    schReadyRef,
    addTab,
    removeTab,
    setActiveTab,
    saveData,
    saveConfig,
    saveCurrentTabData,
    loadActiveTab,
    getCurrentTab,
    importToNewTab
  };
});