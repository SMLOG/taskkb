<template>
  <div class="table-container" style="flex-grow: 1;" @mousedown.left="handleMouseDown"
       @dragstart="dragstart" @dragover="dragOver" @drop="drop" @mousemove="handleMouseCellsMove" @click="handleClick"
       @mouseup.left="handleMouseUp">
    <ColumnsResizer :th="thRefs" v-if="thRefs.length" data="rbar" :table="tableRef" :cols="cols" />
    <div style="display: grid; grid-template-columns: 1fr;" ref="tableRef" 
         @mousemove="handleMouseMove">
      <div class="row header" :style="{ gridTemplateColumns: gridColumns }">
        <template v-for="(col, key) in cols" :key="key">
          <div class="col" ref="thRefs" :style="colStyle(col, 1, key)" :data-row="0" :data-col="key + 1" :class="cellClass(0, key + 1, col)" v-if="col.show">
            <div class="cell" >
              <component :is="resolveComponent(col.cp)" :col="col" v-if="resolveComponent(col.cp)"></component>            </div>
          </div>
        </template>
      </div>
      <Tree :row="root" :depth="''"   :level="0" :cols="cols" :gridStyle="{ gridTemplateColumns: gridColumns }" v-if="root"></Tree>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted,nextTick } from 'vue';
import ColumnsResizer from '@/components/ColumnsResizer.vue';
import ColTitle from '@/components/ColTitle.vue';
import ColDropText from '@/components/ColDropText.vue';
import ColDate from '@/components/ColDate.vue';
import ColSeq from '@/components/ColSeq.vue';
import Tree from '@/components/treelist/Tree.vue';
import { useConfigStore } from '@/stores/config';
import { useTreeRowsStore } from '@/stores/treeRows';
import { useDrapDropComposable } from '@/components/useTreeDrapDropComposable';

const { dragOver, handleMouseDown, handleMouseCellsMove, handleMouseUp, 
        cellClass, handleKeyDown, selectRowSch, selectStartRef, calculateDaysBetweenDates, isDrag,
        dragstart, drop } = useDrapDropComposable();

// Reactive references
const config = ref({});
const selectCol = ref(null);
const flatRows = ref(null);
const root = ref(null);
const selectRowsIndex = ref(null);
const curRowIndex = ref(null);
const tableRef = ref(null);
const thRefs = ref([]);

// Store instances
const configStore = useConfigStore();
const treeRowsStore = useTreeRowsStore();

const componentMap = {
  ColTitle,
  ColDropText,
  ColDate,
  ColSeq,
};
// Resolve component dynamically
const resolveComponent = (cp) => {
  return componentMap[cp] || null; // Fallback to null if component not found
};

// Computed properties
const cols = computed(() => {
  if (!config.value.cols) config.value.cols = [];
  return config.value.cols.filter(e => e.show);
});

const gridColumns = computed(() => {
  return cols.value.map(e => e.width + 'px').join(' ');
});

// Methods
const getAllRows = () => {
  return flatRows.value;
};

const isCollapsed = (row) => {
  if (row && row._p) {
    if (row._p._collapsed) return true;
    return isCollapsed(row._p);
  }
  return false;
};

const colStyle = (col, isH, index) => {
  let style = {};
  if (col.sticky) {
    style.left = `var(--sticky-left-${index})`;
  } else {
    style.left = 'auto';
  }
  return style;
};

const containsBlockElement = (element) => {
  const childElements = element.getElementsByTagName('*');
  for (let i = 0; i < childElements.length; i++) {
    const childElement = childElements[i];
    if (getComputedStyle(childElement).display === 'block') {
      return true;
    }
  }
  return false;
};

const copyTableToExcel = (data) => {
  const tableElement = document.createElement('table');
  for (let i = 0; i < data.length; i++) {
    const row = document.createElement('tr');
    for (let j = 0; j < data[i].length; j++) {
      const cell = document.createElement('td');
      cell.innerHTML = data[i][j];
      row.appendChild(cell);
    }
    tableElement.appendChild(row);
  }
  if (navigator.clipboard) {
    const tableHTML = tableElement.outerHTML;
    navigator.clipboard.writeText(tableHTML)
      .then(() => {
        console.log('Table item copied successfully.');
      })
      .catch((error) => {
        console.error('Copy failed:', error);
      });
  } else {
    console.error('Clipboard API is not supported in this browser.');
  }
};

const focusNext = (index, ids) => {
  if (index + 1 < ids.length) {
    console.log('focus' + (index + 1));
    setTimeout(() => {
      ids[index + 1].$el.querySelector('[contenteditable=true]').focus();
    }, 100);
  }
};

const moveCursorToEnd = (index, spanElement) => {
  const span = spanElement.value[index];
  if (span) {
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(span);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }
};

// Lifecycle hooks
onMounted(() => {

  config.value = configStore.config;
  flatRows.value = treeRowsStore.flatRows;
  root.value = treeRowsStore.dataRows;
  selectRowsIndex.value = treeRowsStore.selectRowsIndex;
  curRowIndex.value = treeRowsStore.curRowIndex;
  console.error(root.value);

  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'c' && !table.value.querySelector('[contenteditable=true]')) {
      event.preventDefault();

      const minRowIndex = Math.min(selectStartRef.value.startRowIndex, selectStartRef.value.endRowIndex);
      const maxRowIndex = Math.max(selectStartRef.value.startRowIndex, selectStartRef.value.endRowIndex);
      const mincellIndex = Math.min(selectStartRef.value.startcellIndex, selectStartRef.value.endcellIndex);
      const maxcellIndex = Math.max(selectStartRef.value.startcellIndex, selectStartRef.value.endcellIndex);

      let copyTblData = [];
      for (let i = minRowIndex; i <= maxRowIndex; i++) {
        let row = table.value.rows[i];
        if (row.style.display === 'none') continue;
        let rowDatas = [];
        for (let j = mincellIndex; j <= maxcellIndex; j++) {
          let cell = row.cells[j];
          rowDatas.push(containsBlockElement(cell.querySelector("[contenteditable]")) 
            ? cell.querySelector("[contenteditable13]").innerText 
            : cell.querySelector("[contenteditable]").innerHTML);
        }
        copyTblData.push(rowDatas);
      }
      copyTableToExcel(copyTblData);
    }
  });
});
</script>

<style src="@/components/grid.css" scoped></style>