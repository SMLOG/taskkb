<template>


  <div class="table-container" style="    flex-grow: 1;">
    <ColumnsResizer :th="$refs.th" v-if="$refs.th" data="rbar" :table="$refs.table" :cols="cols" />
    <div style="display: grid;grid-template-columns: 1fr;" ref="table" @mousedown.left="handleMouseDown"
      @mousemove="handleMouseMove" @mouseup.left="handleMouseUp">
      <div class="row header" :style="{ gridTemplateColumns: gridColumns() }">
        <div class="th col lsticky" freeze="1" style="min-width: 46px;">#</div>
        <template v-for="(col, key) in cols" :key="key">
          <div class="col" ref="th" :data-row="0" :data-col="key + 1" :class="cellClass(0, key + 1, col)" v-if="col.show">
            <div class="cell">
              <component :is="col.cp" :col="col"></component>
            </div>
          </div>
        </template>
      </div>
      <template v-for="(row, rowIndex) in getAllRow()" :key="rowIndex">
        <div class="row" :data-pos="row._pos" :data-row-index="rowIndex" :style="{ gridTemplateColumns: gridColumns() }" v-show="!isCollapsed(row)"
          :class="{ wholeRowSelected: selectRowsIndex && selectRowsIndex.indexOf(rowIndex) > -1 }" @dragover="dragOver"
          @drop="drop($event, row, rowIndex)">
          <a class="col td lsticky" :draggable="true" @dragstart="dragstart($event, row)"
            @click="clickSelectCell($event, rowIndex, row)"
            :class="{ curRow: selectRow == row }">
            {{ row._rIndex + 1 }}
          </a>
          <template v-for="(col, cellIndex) in cols" :key="cellIndex">
            <div class="col td" :data-row="rowIndex + 1" :data-col="cellIndex + 1" :tabindex="100 * rowIndex + cellIndex"
              :class="cellClass(rowIndex + 1, cellIndex + 1, col)"
              @click="clickSelectCell($event, rowIndex, row, cellIndex, col)">
              <div class="cell">
                <component :is="col.cp" :row="row" :col="col"></component>
              </div>
            </div>
          </template>
        </div>
      </template>
    </div>
  </div>

</template>

<script setup>
import ColumnsResizer from '@/components/ColumnsResizer.vue';
import { useConfigStore } from '@/stores/config'
import { useDataRowsStore } from '@/stores/dataRows'
</script>
<script>

import ColTitle from './ColTitle.vue';
import ColDropText from './ColDropText.vue';
import ColDate from './ColDate.vue';

export default {
  components: { ColTitle, ColDropText, ColDate },

  data() {
    return {
      selectStart: null,
      isDrag: 0,
      config: {},
      tableData: [],
      dragRow: null,
      selectedRowIndex: null,
      selectRow: null,
      selectedcellIndex: null,
      selectCol: null,

      isMouseDown: false,
      startRowIndex: null,
      startcellIndex: null,
      endRowIndex: null,
      endcellIndex: null,
      flatRows:null,
      selectRowsIndex:null,
      curRowIndex:null,
    };
  },


  mounted() {
    this.config = useConfigStore().config;
    this.flatRows = useDataRowsStore().flatRows;
    this.selectRowsIndex = useDataRowsStore().selectRowsIndex;
    this.curRowIndex=useDataRowsStore().curRowIndex;

    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.key === 'c' && !this.$refs.table.querySelector('[contenteditable=true]')) {
        event.preventDefault();

        const minRowIndex = Math.min(this.startRowIndex, this.endRowIndex);
        const maxRowIndex = Math.max(this.startRowIndex, this.endRowIndex);
        const mincellIndex = Math.min(this.startcellIndex, this.endcellIndex);
        const maxcellIndex = Math.max(this.startcellIndex, this.endcellIndex);


        let copyTblData = [];
        const table = this.$refs.table;
        for (let i = minRowIndex; i <= maxRowIndex; i++) {
          let row = table.rows[i];
          if (row.style.display === 'none') continue;
          let rowDatas = [];
          for (let j = mincellIndex; j <= maxcellIndex; j++) {
            let cell = row.cells[j];
            rowDatas.push(this.containsBlockElement(cell.querySelector("[contenteditable]")) ? cell.querySelector("[contenteditable]").innerText : cell.querySelector("[contenteditable]").innerHTML);
          }
          copyTblData.push(rowDatas);
        }
        this.copyTableToExcel(copyTblData);
      }
    });
  },
  computed: {
    cols() {
      if (!this.config.cols) this.config.cols = [];
      return this.config.cols.filter(e => e.show);
    },
    curRow() {
      const configStore = useConfigStore();
      return configStore.share.curRow;
    }
  },
  methods: {
    gridColumns() {
      return ' 46px ' + this.cols.map(e => e.width + 'px').join(' ');
    },
    containsBlockElement(element) {
      // Get all child elements of the given element
      const childElements = element.getElementsByTagName('*');
      // Iterate through the child elements
      for (let i = 0; i < childElements.length; i++) {
        const childElement = childElements[i];
        // Check if the child element is a block-level element
        if (getComputedStyle(childElement).display === 'block') {
          return true;
        }
      }
      // No block-level elements found
      return false;
    },
    copyTableToExcel(data) {
      // Create the table element
      var table = document.createElement('table');
      // Iterate over the data array
      for (var i = 0; i < data.length; i++) {
        // Create a new row
        var row = document.createElement('tr');
        // Iterate over the inner array (cells)
        for (var j = 0; j < data[i].length; j++) {
          // Create a new cell
          var cell = document.createElement('td');
          // Set the cell content using innerHTML
          cell.innerHTML = data[i][j];
          // Append the cell to the row
          row.appendChild(cell);
        }
        // Append the row to the table
        table.appendChild(row);
      }
      if (navigator.clipboard) {
        var tableHTML = table.outerHTML;
        console.log(tableHTML)
        navigator.clipboard.writeText(tableHTML)
          .then(function () {
            console.log('Table item copied successfully.');
          })
          .catch(function (error) {
            console.error('Copy failed:', error);
          });
      } else {
        console.error('Clipboard API is not supported in this browser.');
      }
    },
    cellClass(rowIndex, cellIndex, col) {
      const minRowIndex = Math.min(this.startRowIndex, this.endRowIndex);
      const maxRowIndex = Math.max(this.startRowIndex, this.endRowIndex);
      const mincellIndex = Math.min(this.startcellIndex, this.endcellIndex);
      const maxcellIndex = Math.max(this.startcellIndex, this.endcellIndex);
      let selected = this.isSelected(rowIndex, cellIndex);
      return {
        selected: selected,
        left: selected && cellIndex == mincellIndex,
        right: selected && cellIndex == maxcellIndex || mincellIndex - 1 == cellIndex && (rowIndex >= minRowIndex && rowIndex <= maxRowIndex),
        top: selected && rowIndex == minRowIndex,
        bottom: selected && rowIndex == maxRowIndex,
        sticky: col.sticky
      };
    },
    handleMouseDown(event) {
      console.log('mosuedown')

      let rowEl = event.target.closest('.row');
      if (rowEl) {

        let rowIndex  = parseInt(rowEl.dataset.rowIndex);
        let row = this.flatRows[rowIndex];
        const configStore = useConfigStore();
        configStore.share.curRow = row;

      }

      const cell = event.target.closest('div.col');
      if (!cell || this.resizeColumn) {
        this.startRowIndex = -1;
        this.startcellIndex = -1;
        this.endRowIndex = -1;
        this.endcellIndex = -1;
        return null;
      }
      const activeElement = document.activeElement;

      if (cell.querySelector("[contenteditable=true]")) return;
      if (activeElement) {
        activeElement.blur();
      }
      event.preventDefault();
      this.isMouseDown = true;

      const rowIndex = parseInt(cell.getAttribute('data-row'));
      const cellIndex = parseInt(cell.getAttribute('data-col'));

      this.startRowIndex = rowIndex;
      this.startcellIndex = cellIndex;
      this.endRowIndex = this.startRowIndex;
      this.endcellIndex = this.startcellIndex;
    },
    handleMouseMove(event) {
      if (this.isMouseDown) {
        const cell = event.target.closest('div.col');
        const rowIndex = parseInt(cell.getAttribute('data-row'));
        const cellIndex = parseInt(cell.getAttribute('data-col'));

        this.endRowIndex = rowIndex;
        this.endcellIndex = cellIndex;
      }
    },
    handleMouseUp() {
      this.isMouseDown = false;
    },
    isSelected(rowIndex, cellIndex) {
      const minRowIndex = Math.min(this.startRowIndex, this.endRowIndex);
      const maxRowIndex = Math.max(this.startRowIndex, this.endRowIndex);
      const mincellIndex = Math.min(this.startcellIndex, this.endcellIndex);
      const maxcellIndex = Math.max(this.startcellIndex, this.endcellIndex);
      return (
        (rowIndex >= minRowIndex && rowIndex <= maxRowIndex) &&
        (cellIndex >= mincellIndex && cellIndex <= maxcellIndex)
      );
    },
    clickSelectCell(event, rowIndex, row, cellIndex, col) {

      this.selectedRowIndex = rowIndex;
      this.selectedcellIndex = cellIndex;
      this.selectRow = row;
      this.selectCol = col;

      if (cellIndex == undefined) {
        this.selectWholeRowIndex = rowIndex;
        this.selectCol = null;
      } else {
        this.selectWholeRowIndex = false;
      }

    },
    getAllRow() {
      return this.flatRows;
    },
    isCollapsed(row) {
      if (row && row._p) {
        if (row._p._collapsed) return true;
        return this.isCollapsed(row._p)
      }
      return false;

    },
    getRootRows(rootRow) {

let list = [];
list.push(rootRow);
if (rootRow._childs) {
  let rindex = 0;
  for (let row of rootRow._childs) {
    row._level = rootRow._level + 1;
    row._p = rootRow;
    row._rIndex = rindex++;
    row._pos = rootRow._pos + "," + row._rIndex;

    list.push(...this.getRootRows(row));
  }

}
return list;


},
    dragstart(event, row) {
      this.dragRow = row;
      console.log(event);
      this.dragStartClientX = event.clientX;
    },
    dragOver(event) {
      event.preventDefault();
    },
    isParentMoveToChild(fromRow, toRow) {
      if (!fromRow._childs) return false;
      for (let row of fromRow._childs) {
        if (row == toRow) return true;

        if (this.isParentMoveToChild(row, toRow)) return true;
      }
      return false;

    },
    drop(event, row) {

      console.log(event);
      if (this.isParentMoveToChild(this.dragRow, row)) {
        console.error("not allow parent move to child.");
        return;
      } else if (row == this.dragRow) {
        console.error('same row');
        return;
      }
      let toChildList = row._p ? row._p._childs : this.tableData;
      console.log('drop');

      if (this.dragRow !== null) {

        let fromChildList = this.dragRow._p ? this.dragRow._p._childs : this.tableData;
        let fromIndex = fromChildList.indexOf(this.dragRow);
        let targetIndex = toChildList.indexOf(row);

        if (event.clientX - this.dragStartClientX > 50) {
          console.log('drop to child.');
          fromChildList.splice(fromIndex, 1);
          if (!row._childs) row._childs = [];
          row._childs.push(this.dragRow);
          this.dragRow._p = row;
          this.dragRow._level = row._level + 1;
        } else if (row._p == this.dragRow._p && fromIndex - targetIndex == 1) {
          fromChildList.splice(fromIndex, 1);
          targetIndex = toChildList.indexOf(row);
          fromChildList.splice(targetIndex, 0, this.dragRow);
        } else {
          fromChildList.splice(fromIndex, 1);
          targetIndex = toChildList.indexOf(row);
          toChildList.splice(targetIndex + 1, 0, this.dragRow);
          this.dragRow._p = row._p;
          this.dragRow._level = row._level;
        }

        this.dragRow = null;
      }
    },
    focusNext(index) {
      if (index + 1 < this.$refs.ids.length) {
        console.log('focus' + (index + 1));
        setTimeout(() => {
          this.$refs.ids[index + 1].$el.querySelector('[contenteditable=true]').focus();
        }, 100);

      }
    },
    moveCursorToEnd(index) {
      this.$nextTick(() => {
        const spanElement = this.$refs.spanElement[index];
        console.log(spanElement);
        if (spanElement) {
          const range = document.createRange();
          const selection = window.getSelection();
          range.selectNodeContents(spanElement);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      });
    },
  },
};
</script>
<style scoped>
table {
  border-collapse: separate;
  border-spacing: 0;
}

th,
td {
  border: 1px solid #e4e7e7;
  padding: 0;
  min-height: 1em;
}

tbody th {
  position: sticky;
  left: 0;
  top: 0;
  background-color: white;
  text-align: left;
  z-index: 2;
}

.th {
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 2;
}

thead th:first-child {
  z-index: 4;
}

th:first-child,
td:first-child {
  z-index: 3;
  /* Ensure the first column stays on top */
  position: sticky;
  left: 0;
  background-color: white;
  width: 46px;
  min-width: 46px;
  text-align: center;
}

td {
  vertical-align: top;
}

.selected th {
  background-color: #F0FFF0;
}

.selectStart {
  background-color: yellow;
}

.drag {
  cursor: move;
}

.resizable {
  position: relative;
  overflow: hidden;
}

.selected {
  background-color: #F0FFF0 !important;
}

.sch .selected {
  background-color: lightgreen;
}

.left {
  border-left: 1px darkgreen solid !important;
}

.right {
  border-right: 1px darkgreen solid !important;
}

.top {
  border-top: 1px darkgreen solid !important;
}

.bottom {
  border-bottom: 1px darkgreen solid !important;
  ;
}

.curRow,
.wholeRowSelected>div {
  background-color: #E0EEE0 !important
}

.sticky {
  position: sticky;
  z-index: var(--vt-index-sticky);
  background: white;
}

.lsticky {
  position: sticky;
  z-index: var(--vt-index-sticky);
  left: 0;
  background: white;
  text-align: center;

}

.cell {
  line-height: 2em;
}

td {
  position: relative;
}

.grid-wrap {
  position: absolute;
  top: 0;
  bottom: 0;
  overflow: auto;
  right: 0;
  left: 0;
  display: flex;
  flex-direction: column;
}

.row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.col {
  border: 1px solid #ccc;
}

.cell {
  height: 100%;
  position: relative;
  padding: 0 2px;
}

.header {
  position: sticky;
  top: 0;
  z-index: var(--vt-index-sticky-header);
  background-color: white
}
</style>
