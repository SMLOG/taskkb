
import { defineStore } from 'pinia'
import { ref } from 'vue'




export const useDataRowsStore = defineStore('dataRows', () => {
  let temp =localStorage.getItem('data') ? JSON.parse(localStorage.getItem('data')) : [];
  const dataRows = ref(temp)
  function save() {
    localStorage.setItem('data', JSON.stringify(dataRows.value, function (key, value) {
        if (key === "_p") {
          return null;
        } else return value;
      }));
  }
  return { dataRows,save }
})