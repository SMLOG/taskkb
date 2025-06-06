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
  const dataRows = ref({ _childs: [] });

  async function init() {
    try {
      const storedConfig = localStorage.getItem('data')
      if (storedConfig) dataRows.value = JSON.parse(storedConfig);
      for (let r of dataRows.value._childs) {
        loopToSetDate(r);
      }

    } catch (error) {
      console.error('Failed to initialize config:', error)
    }
  }

  async function save() {
    try {
      localStorage.setItem('data', JSON.stringify(dataRows.value))
    } catch (error) {
      console.error('Failed to save config:', error)
    }
  }

  // Call init asynchronously and handle potential errors
  init().catch(error => console.error('Init failed:', error))

  return {
    dataRows,
    save
  };
});
