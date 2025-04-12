<template>


  <div class="table-container" style="    flex-grow: 1;" @mousedown.left="handleMouseDown"
      @dragstart="dragstart" @dragover="dragOver" @drop="drop" @mousemove="handleMouseCellsMove" @click="handleClick"
      @mouseup.left="handleMouseUp">
    <ColumnsResizer :th="$refs.th" v-if="$refs.th" data="rbar" :table="$refs.table" :cols="cols" />
    <div style="display: grid;grid-template-columns: 1fr;" ref="table" 
      @mousemove="handleMouseMove" >
      <div class="row header" :style="{ gridTemplateColumns: gridColumns() }">
        <template v-for="(col, key) in cols" :key="key">
          <div class="col" ref="th" :style="colStyle(col, 1,key)" :data-row="0" :data-col="key + 1" :class="cellClass(0, key + 1, col)" v-if="col.show">
            <div class="cell">
              <component :is="col.cp" :col="col"></component>
            </div>
          </div>
        </template>
      </div>
      <template v-for="(row, rowIndex) in getAllRows()" :key="rowIndex">
        <div class="row"  :data-row-index="rowIndex" :style="{ gridTemplateColumns: gridColumns() }" v-show="!isCollapsed(row)"
          :class="{ wholeRowSelected: selectRowsIndex && selectRowsIndex.indexOf(rowIndex) > -1 }" @dragover="dragOver"
          @drop="drop($event, row, rowIndex)">

          <template v-for="(col, cellIndex) in cols" :key="cellIndex">
            <component v-if="col.cp=='ColSeq'" :class="cellClass(rowIndex + 1, cellIndex + 1, col)" class="col td" :is="col.cp" :row="row" :col="col" :style="colStyle(col, 1,cellIndex)" :data-row="rowIndex + 1" :data-col="cellIndex + 1" :tabindex="100 * rowIndex + cellIndex" ></component>
            <div v-else class="col td" :style="colStyle(col, 1,cellIndex)" :data-row="rowIndex + 1" :data-col="cellIndex + 1" :tabindex="100 * rowIndex + cellIndex"
              :class="cellClass(rowIndex + 1, cellIndex + 1, col)">
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

import { useTableComposable } from '@/components/useTableComposable'
const { dragOver, handleMouseDown, handleMouseCellsMove, handleMouseUp, 
  cellClass,handleKeyDown,selectRowSch,selectStartRef,calculateDaysBetweenDates,isDrag,
  dragstart,drop,
  } = useTableComposable();
document.addEventListener("keydown", handleKeyDown);
</script>
<script>

import ColTitle from './ColTitle.vue';
import ColDropText from './ColDropText.vue';
import ColDate from './ColDate.vue';
import ColSeq from './ColSeq.vue';

export default {
  components: { ColTitle, ColDropText, ColDate,ColSeq },

  data() {
    return {
      config: {},
      selectCol: null,
      flatRows: null,
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
  },
  methods: {
    getAllRows() {
      return this.flatRows;
    },
    isCollapsed(row) {
      if (row && row._p) {
        if (row._p._collapsed) return true;
        return this.isCollapsed(row._p)
      }
      return false;

    },
    colStyle(col, isH,index) {
      let style = {};
      if (col.sticky) {
        style.left='var(--sticky-left-'+index+')';
      }else style.left = 'auto';
      return style;
    },
    gridColumns() {
      return this.cols.map(e => e.width + 'px').join(' ');
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
<style src="./grid.css" scoped>
</style>
