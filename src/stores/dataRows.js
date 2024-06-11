
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



function getRowRows(rootRow) {

let list = [];
list.push(rootRow);
if (rootRow._childs) {
let rindex = 0;
for (let row of rootRow._childs) {
row._level = rootRow._level + 1;
row._p = rootRow;
row._rIndex = rindex++;
row._pos = rootRow._pos + "," + row._rIndex;

list.push(...getRowRows(row));
}

}
return list;


}

let root =localStorage.getItem('data') ? JSON.parse(localStorage.getItem('data')) : {};
root._level=0;

for (let r of root._childs) {
  loopToSetDate(r);
  r._p=root;
}

const dataRows = ref(root)
const flatRows = ref([]);
const selectRowsIndex=ref([]);
const curRowIndex=ref(-1);
function save() {
  localStorage.setItem('data', JSON.stringify(dataRows.value, function (key, value) {
      if (key === "_p") {
        return null;
      } else return value;
    }));
}
function refreshList(){
  flatRows.value.length = 0;
    flatRows.value.push(... getRowRows(dataRows.value) );
    flatRows.value.shift()
}
refreshList();
function insert(row){
  let curRowIndexValue  = curRowIndex.value;
  if(curRowIndexValue>-1 && curRowIndexValue <flatRows.value.length){
    row._p=flatRows.value[curRowIndexValue]._p;

    if(row._p){
      let nextIndex = curRowIndexValue+1;
      flatRows.value.splice(nextIndex,0,row); 
      curRowIndex.value=nextIndex;
      let index =  row._p._childs.indexOf(flatRows.value[curRowIndexValue]);
      row._p._childs.splice(index+1,0,row); 
      row._p._childs.forEach((v,i)=>v._rIndex=i);
    }
  }
}
function remove(){
  selectRowsIndex.value.sort((a, b) => b - a).forEach(index => {
    let item = flatRows.value.splice(index, 1)[0];
    if(item._p)item._p._childs.splice(item._p._childs.indexOf(item),1);
  });
}
export const useDataRowsStore = defineStore('dataRows', () => {


  return { dataRows,save,flatRows,insert,selectRowsIndex,remove,curRowIndex }
})