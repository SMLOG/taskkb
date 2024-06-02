
import { defineStore } from 'pinia'
import { ref } from 'vue'

function loopToSetDate(row) {
  if (row._tl) {
    let peroid = row._tl;
    if(!peroid.start||!peroid.end){
      peroid.start=peroid.end=null;
    }else{
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
export const useDataRowsStore = defineStore('dataRows', () => {
  let rows =localStorage.getItem('data') ? JSON.parse(localStorage.getItem('data')) : [];


  for (let r of rows) {
    loopToSetDate(r);
  }

  const dataRows = ref(rows)
  function save() {
    localStorage.setItem('data', JSON.stringify(dataRows.value, function (key, value) {
        if (key === "_p") {
          return null;
        } else return value;
      }));
  }
  return { dataRows,save }
})