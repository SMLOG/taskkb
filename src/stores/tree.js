import { defineStore } from "pinia";
import { ref } from "vue";

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

export const useTreeStore = defineStore("tree", () => {
  const treeRef = ref({ _childs: [] });
  const configRef = ref({ cols: [] })

  async function init() {
    try {

      const storedConfig = localStorage.getItem('config')
      if(storedConfig)configRef.value =  JSON.parse(storedConfig) 


      const storedData = localStorage.getItem('data')
      if (storedData) treeRef.value = JSON.parse(storedData);
      for (let r of treeRef.value._childs) {
        loopToSetDate(r);
      }

    } catch (error) {
      console.error('Failed to initialize config:', error)
    }
  }

  async function saveData() {
    try {
      localStorage.setItem('data', JSON.stringify(treeRef.value))
    } catch (error) {
      console.error('Failed to save config:', error)
    }
  }
  async function saveConfig() {
    try {
      localStorage.setItem('config', JSON.stringify(configRef.value))
    } catch (error) {
      console.error('Failed to save config:', error)
    }
  }
  // Call init asynchronously and handle potential errors
  init().catch(error => console.error('Init failed:', error))

  return {
    treeRef,
    configRef,
    saveData,
    saveConfig
  };
});
