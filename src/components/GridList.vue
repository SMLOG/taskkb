<template>
<FormatTool>
  <div class="grid-wrap">

    <div class="table-container" style="    flex-grow: 1;
    overflow: auto;" :style="{ overflowX: config.fix ? 'hidden' : 'auto' }">
      <div class="vue-columns-resizable" style="position: relative;">
        <template v-for="(col, key) in cols" :key="key">
          <div v-if="col.show" class="columns-resize-bar" ref="rbar" @mousedown="resizeBarMouseDown(col, key, $event)"
            style=" position: absolute; top: 0px;  width: 2px; cursor: col-resize; z-index: 3;"
            :style="{ height: tableHeight + 'px' }"></div>
        </template>
      </div>
      <div style="display: grid;grid-template-columns: 1fr;" ref="table" @mousedown.left="handleMouseDown"
        @mousemove="handleMouseMove" @mouseup.left="handleMouseUp">
        <div class="row header" :style="{gridTemplateColumns: gridColumns()}">
          <div class="th col lsticky" freeze="1" style="min-width: 46px;">#</div>
          <template v-for="(col, key) in cols" :key="key">
            <div class="col" ref="th" :style="colStyle(col, 1)" :class="{ sticky: col.sticky }" v-if="col.show">
              <div class="cell">
                <component :is="col.cp" :col="col"></component>
              </div>
            </div>
          </template>
        </div>
        <template v-for="(row, rowIndex) in getAllRow()" :key="rowIndex">
          <div class="row" :style="{gridTemplateColumns: gridColumns()}" v-show="!isCollapsed(row)" :class="{ wholeRowSelected: selectWholeRowIndex === rowIndex }"
            @dragover="dragOver" @drop="drop($event, row, rowIndex)">
            <div class="col td lsticky" :draggable="true" @dragstart="dragstart($event, row)"
              @click="clickSelectCell($event, rowIndex, row)"
              @contextmenu="clickSelectCell($event, rowIndex, row); showContextMenu($event, rowIndex)"
              :class="{ curRow: selectRow == row }">
              {{ row._rIndex + 1 }}
            </div>
            <template v-for="(col, cellIndex) in cols" :key="cellIndex">
              <div class="col td" :data-row="rowIndex+1" :data-col="cellIndex+1" :tabindex="100 * rowIndex + cellIndex"
                :class="cellClass(rowIndex + 1, cellIndex + 1, col)" :style="colStyle(col)"
                @click="clickSelectCell($event, rowIndex, row, cellIndex, col)">
                <div class="cell">
                  <component :is="col.cp" :row="row" :col="col" @change="saveData(1)"></component>
                </div>
              </div>
            </template>
          </div>
        </template>
      </div>
    </div>
    <div style="
        position: sticky;
        bottom: 0;
        left: 0;
        z-index: 3;
        background: white;
      ">
      <div style="display: flex;flex-direction: column;">
        <Config v-if="showConfig" :config="config"></Config>
        <div style="display: flex;height: 30px;">
          <a @click="addRow(1)">Add Row</a>
          <a @click="deleteRow(selectRow)">Delete Row</a>
          <a @click="addSubRow(1)">Add Sub Row</a>
          <a @click="saveData(0)">Save</a>
          <a @click="showConfig = !showConfig">Configuration</a>
          <a @click="showConfig = !showConfig">Team</a>
        </div>
      </div>
    </div>

  </div>
  <!-- Context menu -->
  <div v-show="isContextMenuVisible" :style="{ left: contextMenuPosition.x + 'px', top: contextMenuPosition.y + 'px' }"
    class="contextmenu">
    <ul>
      <li @click="addRow(1)">Insert Row after {{ selectedRowIndex }}</li>
      <li>Delete Row</li>
      <li>Menu Item 3</li>
    </ul>
  </div>
  </FormatTool>
</template>
<script setup>

import Config from './Config.vue';
import FormatTool from "./FormatTool.vue";
</script>
<script>
const today = new Date();
today.setHours(0, 0, 0, 0);
const data = localStorage.getItem('data') ? JSON.parse(localStorage.getItem('data')) : [];
function loopToSetDate(row) {
  if (row._sch) for (let peroid of row._sch) {
    peroid.start = new Date(peroid.start);
    peroid.end = new Date(peroid.end);
  }
  if (row._childs) {
    for (let ch of row._childs) {
      loopToSetDate(ch);
    }
  }
}
for (let d of data) {
  loopToSetDate(d);
}


import ColTitle from './ColTitle.vue';
import ColDropText from './ColDropText.vue';
import ColDate from './ColDate.vue';


export default {
  components: { ColTitle, ColDropText, ColDate },

  data() {
    return {
      tableHeight: 20,
      isContextMenuVisible: false,
      contextMenuPosition: { x: 0, y: 0 },
      showConfig: 0,
      selectStart: null,
      isDrag: 0,
      config: localStorage.getItem('config') ? JSON.parse(localStorage.getItem('config')) : {},
      tableData: data,
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
      wholeRowSelected: false,
      selectWholeRowIndex: null,
    };
  },
  mounted() {
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
    document.addEventListener("click", this.hideContextMenu);
    window.data = this.tableData;
    document.addEventListener("keydown", this.handleKeyDown);

    document.body.addEventListener('mousemove', this.throttleHandleResize);
    document.body.addEventListener('mouseup', this.resizeBarMouseUp);


    window.addEventListener('resize', () => {

      this.winResize();
    });
    this.winResize();

    const table = this.$refs.table;
    this.tableHeight = table.offsetHeight;
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const resizedTable = entry.target;
        console.log('Table has been resized:', resizedTable);
        this.tableHeight = table.offsetHeight;
      }
    });

    resizeObserver.observe(table);
  },
  beforeUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("click", this.hideContextMenu);
  },
  computed: {
    cols() {
      if (!this.config.cols) this.config.cols = [];
      return this.config.cols.filter(e => e.show);
    },
    currentCell() {
      return this.selectRow && this.selectCol ? this.selectRow['c' + this.selectCol.fn] : null;
    }

  },
  watch: {

  },
  methods: {
    gridColumns(){
      
      return ' 46px ' +this.cols.map(e=>e.width+'px').join(' ');
    },
    colStyle(col) {
      let style = {  width: col.width + 'px' };;
      if (col.sticky) {
        style.left = "46px";
      }
      return style;
    },
    getScrollbarWidth() {
      // Create a div element
      var div = document.createElement('div');

      // Set the styles for the div element
      div.style.width = '100px';
      div.style.height = '100px';
      div.style.overflow = 'scroll';
      div.style.position = 'absolute';
      div.style.top = '-9999px';

      // Append the div element to the document body
      document.body.appendChild(div);

      // Calculate the scrollbar width
      var scrollbarWidth = div.offsetWidth - div.clientWidth;

      // Remove the div element from the document body
      document.body.removeChild(div);

      // Return the scrollbar width
      return scrollbarWidth;
    },
    winResize() {
      if (this.config.fix) {
        let showCols = this.cols;
        let totalWidth = showCols.reduce((total, col) => total + col.width, 0);

        let share = (window.innerWidth - 46 - showCols.length - 2 - this.getScrollbarWidth()) / totalWidth;
        showCols.forEach((col) => {
          col.width = col.width * share;
        });
      }
      this.$nextTick(() => { this.resize(); });


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
    resize() {
      console.log('resize')
      console.log('resize')
      for (let i = 0; i < this.$refs.rbar.length; i++) {
        this.$refs.rbar[i].style.left = this.$refs.th[i].offsetLeft + this.$refs.th[i].offsetWidth - this.$refs.rbar[i].offsetWidth / 2 + 'px';

      }
    },
    throttleHandleResize(event) {
      //clearTimeout(this.throttleTimeout);
      //this.throttleTimeout=setTimeout(()=>{
      this.handleResize(event);
      //},10);
    },
    handleResize(event) {
      console.log('handleResize')
      if (this.resizeColumn) {
        let i = this.resizeColumnIndex;

        //let width = this.$refs.th[i].offsetWidth +  event.movementX;
        let width = this.resizeColumnWidth + event.x - this.resizeX;
        console.log(this.$refs.th[i].offsetWidth, event.movementX, width);
        this.resizeColumn.width = width;
        this.$refs.th[i].style.width = width + 'px';
        let j = i;
        this.$refs.rbar[i].style.left = this.$refs.th[j].offsetLeft + width - this.$refs.rbar[i].offsetWidth / 2 + 'px';
        let lastColIndex = this.$refs.th.length - 1;
        if (this.config.fix && i < lastColIndex) {
          let lastWidth = this.resizeLastColumnWidth - (event.x - this.resizeX);
          this.cols[lastColIndex].width = lastWidth;
          this.$refs.th[lastColIndex].style.width = lastWidth + 'px';
        }

      }

    },
    resizeBarMouseDown(col, colIndex, event) {
      console.log('resizeBarMouseDown')
      console.log(col)
      this.resizeColumn = col;
      this.resizeColumnIndex = colIndex;
      this.resizeX = event.x;
      this.resizeColumnWidth = this.$refs.th[colIndex].offsetWidth;
      this.resizeLastColumnWidth = this.$refs.th[this.$refs.th.length - 1].offsetWidth;


      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      console.log(event)

    },
    resizeBarMouseUp() {
      console.log('resizeBarMouseUp')
      if (this.resizeColumn) {
        this.resize();
        this.saveData();
      }
      this.resizeColumn = 0;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
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
    deleteRow(row) {
      if (confirm("Please confirm to delete it?")) {
        let list = row._p && row._p._childs || this.tableData;
        list.splice(list.indexOf(row), 1);
      }

    },

    getAllRow() {
      let rows = [];
      let _rIndex = 0;
      for (let root of this.tableData) {
        root._level = 0;
        root._rIndex = _rIndex++;
        rows.push(...this.getRootRows(root));
      }
      return rows;
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
        this.saveData()
      }
    },
    addRow(num) {
      console.log(num)
      if (this.selectRow) {
        let list = this.selectRow._p && this.selectRow._p._childs || this.tableData;
        let index = list.indexOf(this.selectRow);
        list.splice(index + 1, 0, { _id: '', _p: this.selectRow._p });

      } else this.tableData.push({ _id: '' })

    },
    addSubRow(num) {
      if (!this.tableData[this.selectedRowIndex].childs)
        this.tableData[this.selectedRowIndex].childs = [];

      this.tableData[this.selectedRowIndex].childs.push({ _id: '' })


    },
    focusNext(index) {
      if (index + 1 < this.$refs.ids.length) {
        console.log('focus' + (index + 1));
        setTimeout(() => {
          this.$refs.ids[index + 1].$el.querySelector('[contenteditable=true]').focus();
        }, 100);

      }
      else {
        this.addRow(1)
        setTimeout(() => {
          this.$refs.ids[index + 1].$el.querySelector('[contenteditable=true]').focus();
        }, 100);
      }
    },
    saveData(bool) {
      console.log(bool)
      if (!bool || this.config.autoSave) {


        localStorage.setItem('data', JSON.stringify(this.tableData, function (key, value) {
          if (key === "_p") {
            return null;
          } else return value;
        }));
        localStorage.setItem('config', JSON.stringify(this.config));

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

 
    showContextMenu(event, index) {
      event.preventDefault();
      this.isContextMenuVisible = true;
      this.contextMenuPosition.x = event.clientX;
      this.contextMenuPosition.y = event.clientY;
      this.selectedRowIndex = index;
    },
    hideContextMenu() {
      this.isContextMenuVisible = false;
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

.week-slot {
  position: relative;
}

.week-slot::after {
  content: "";
  width: 0;
  position: absolute;
  top: 0;
  height: 100%;
  border: 1px solid #ddd;
  right: 0;
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

.resize-handle {
  position: absolute;
  top: 0;
  right: -11px;
  bottom: 0;
  width: 3px;
  background-color: #eee;
  cursor: col-resize;
}

.selected {
  background-color: #F0FFF0!important;
}

.sch .selected {
  background-color: lightgreen;
}

.contextmenu {
  background: white;
  z-index: var(--vt-index-contextmenu);
  position: fixed;
  border: 2px solid gray;
  border-radius: 5px;
  padding: 5px;
}

.contextmenu ul {
  margin: 0;
}

.td.left {
  border-left: 1px darkgreen solid;
}

.td.right {
  border-right: 1px darkgreen solid;
}

.td.top {
  border-top: 1px darkgreen solid;
}

.td.bottom {
  border-bottom: 1px darkgreen solid;
}

.filterSearch {
  position: relative;
  display: inline-block;
  width: 200px;
  height: 24px;
}

.filterSearch input {
  width: 100%;
}

.filterSearch:after {
  content: "T";
  position: absolute;
  right: 3px;
  top: 0;
  color: green;
  font-weight: bold;
}

.curRow,
.wholeRowSelected td {
  background-color: #E0EEE0 !important
}

.sticky {
  position: sticky;
  z-index: var(--vt-index-sticky);
  background: white;
}

.lsticky{
  position: sticky;
  z-index: var(--vt-index-sticky);
  left:0;
  background: white;
  text-align: center;

}
.cell {
  line-height: 1.6em;
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
.cell{height: 100%;position: relative;}
.header{
  position: sticky;
  top:0;
  z-index: var(--vt-index-sticky-header);
  background-color: white
}
</style>
