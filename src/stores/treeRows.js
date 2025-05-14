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


let root = localStorage.getItem("data")
  ? JSON.parse(localStorage.getItem("data"))
  : { _childs: [] };
root._level = 0;

for (let r of root._childs) {
  loopToSetDate(r);
  r._p = root;
}

const dataRows = ref(root);
const flatRows = ref([]);
const selectRowsIndex = ref([]);
const curRowIndex = ref(-1);
function save() {
  localStorage.setItem(
    "data",
    JSON.stringify(dataRows.value, function (key, value) {
      if (key === "_p") {
        return null;
      } else return value;
    })
  );
}




function remove() {
  selectRowsIndex.value
    .sort((a, b) => b - a)
    .forEach((index) => {
      let item = flatRows.value.splice(index, 1)[0];
      if (item._p) item._p._childs.splice(item._p._childs.indexOf(item), 1);
    });
}



export const useTreeRowsStore = defineStore("treeRows", () => {
  return {
    dataRows,
    save,
    selectRowsIndex,
    remove,
    curRowIndex,
  };
});
