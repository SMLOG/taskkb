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

function getRowRows(rootRow,newRoot) {
  let list = [];
  
  list.push(rootRow);
  if (rootRow._childs) {
    let rindex = 1;
    for (let row of rootRow._childs) {
      row._level = rootRow._level + 1;
      row._p = rootRow;
      row._rIndex =  rindex++;
      row._pos = rootRow._pos + "," + row._rIndex;

      list.push(...getRowRows(row));
    }
  }
  return list;
}

function clearParent(rootRow) {
  delete rootRow._p;
  if (rootRow._childs) {
    for (let row of rootRow._childs) {
      delete row._p ;
      clearParent(row)
    }
  }
}

let root = localStorage.getItem("data")
  ? JSON.parse(localStorage.getItem("data"))
  : {_childs:[]};
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
function refreshList() {
  flatRows.value.length = 0;
  flatRows.value.push(...getRowRows(dataRows.value));
  flatRows.value.shift();
}
refreshList();
function insert(row) {
  let curRowIndexValue = curRowIndex.value;
  if (curRowIndexValue > -1 && curRowIndexValue < flatRows.value.length) {
    row._p = flatRows.value[curRowIndexValue]._p;

    if (row._p) {
      let nextIndex = curRowIndexValue + 1;
      flatRows.value.splice(nextIndex, 0, row);
      curRowIndex.value = nextIndex;
      row._level=flatRows.value[curRowIndexValue]._level;
      let index = row._p._childs.indexOf(flatRows.value[curRowIndexValue]);
      row._p._childs.splice(index + 1, 0, row);
      row._p._childs.forEach((v, i) => (v._rIndex = i));
    }
  }else {
    row._p = root;
    row._level=1;
    row._rIndex = root._childs.length+1;
    flatRows.value.push(row);
    root._childs.push(row);
  }
}
function copyRow(){
  let item = flatRows.value.slice(selectRowsIndex.value[0], selectRowsIndex.value[0]+1)[0];
  let _p = item._p;
  clearParent(item);
  let newItem = JSON.parse(JSON.stringify(item));
  getRowRows(item);
  item._p=_p;
 let newRows = getRowRows(newItem);
 flatRows.value.splice(selectRowsIndex.value[0]+newRows.length, 0, ...newRows);
 newItem._p=_p;
 let pos = _p._childs.indexOf(item);
 _p._childs.splice(pos,0,newItem);
}
function remove() {
  selectRowsIndex.value
    .sort((a, b) => b - a)
    .forEach((index) => {
      let item = flatRows.value.splice(index, 1)[0];
      if (item._p) item._p._childs.splice(item._p._childs.indexOf(item), 1);
    });
}

function isParentMoveToChild(fromRow, toRow) {
  if (!fromRow._childs) return false;
  for (let row of fromRow._childs) {
    if (row == toRow) return true;

    if (isParentMoveToChild(row, toRow)) return true;
  }
  return false;
}

function dragAndDrop(rowIndex, childR) {
  let row = flatRows.value[rowIndex];
  let srcIndexs = selectRowsIndex.value;

  srcIndexs.forEach((e) => {
    let dragRow = flatRows.value[e];
    if (isParentMoveToChild(dragRow, row)) {
      console.error("not allow parent move to child.");
      return;
    } else if (row == dragRow) {
      console.error("same row");
      return;
    }
    let toChildList = row._p._childs;
    console.log("drop");

    if (dragRow !== null) {
      let fromChildList = dragRow._p._childs;
      let fromIndex = fromChildList.indexOf(dragRow);
      let targetIndex = toChildList.indexOf(row);

      if (childR) {
        //to child
        console.log("drop to child.");
        fromChildList.splice(fromIndex, 1);
        if (!row._childs) row._childs = [];
        row._childs.push(dragRow);
        dragRow._p = row;
        dragRow._level = row._level + 1;
      } else {
        fromChildList.splice(fromIndex, 1);
        targetIndex = toChildList.indexOf(row);
        toChildList.splice(targetIndex + 1, 0, dragRow);
        dragRow._p = row._p;
        dragRow._level = row._level;
      }
    }
  });

  refreshList();
}
export const useDataRowsStore = defineStore("dataRows", () => {
  return {
    dataRows,
    save,
    flatRows,
    insert,
    selectRowsIndex,
    remove,
    curRowIndex,
    dragAndDrop,getRowRows,copyRow
  };
});
