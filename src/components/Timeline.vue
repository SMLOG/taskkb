<template>

  <div style="
      position: absolute;
      top: 0;
      bottom: 0;
      overflow: auto;
      right: 0;
      left: 0;
      display: flex;
      flex-direction: column;
    ">
    <div class="table-container" style="flex-grow: 1;position: relative;">
      <div>

      <div ref="table" style="display: grid; grid-template-columns: 1fr;" @mousedown.left="handleMouseDown"
        @mousemove="handleMouseMove" @mouseup.left="handleMouseUp">
        <div class="vue-columns-resizable" style="position: relative;">
          <template v-for="(col, key) in cols" :key="key">
            <div v-if="col.show" class="columns-resize-bar" ref="rbar" @mousedown="resizeBarMouseDown(col, key, $event)"
              style=" position: absolute; top: 0px;  width: 4px; cursor: col-resize; z-index: 3;"
              :style="{ height: tableHeight + 'px' }"></div>
          </template>
        </div>
        <div class="row header" :style="{ gridTemplateColumns: gridColumns() }">
          <div freeze="1" class="th col lsticky" style="min-width: 46px;max-width: 46px;">#</div>
          <template v-for="(col, key) in cols" :key="key">
            <div class="col" ref="th" :style="colStyle(col, 1)" :class="{ sticky: col.sticky }" v-if="col.show">
              <div class="cell">
                <component :is="col.cp" :col="col"></component>
              </div>
            </div>
          </template>
          <div class="col" :colspan="7 * weeks.length">
            <div style="display: flex; flex-wrap: nowrap">
              <div v-for="(week, index) in weeks" :key="week" class="week-slot">
                <div>
                  <a v-if="index == 0" @mouseenter="showDatePicker = true" @mouseleave="showDatePicker = false">
                    Start
                    <div v-if="showDatePicker" style="position: absolute;">
                      <VueDatePicker v-model="startDate" @date-update="(d) => { startDate = d; showDatePicker = false }"
                        :enable-time-picker="false" type="date" inline auto-apply />
                      Weeks:<input type="number" v-model="weekCount" :min="20" @mousedown.stop />

                    </div>

                  </a>
                  {{ week.label }}
                </div>
                <div style="display: flex; justify-content: space-between">
                  <span v-for="day in week.dates" :key="day" class="day" :style="{
                    backgroundColor: day.isCur
                      ? 'red'
                      : day.isWeekend
                        ? 'gray'
                        : 'none',
                  }">
                    {{ day.label }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>


        <!--line-->
        <div class="row header" :style="{ gridTemplateColumns: gridColumns() }">
          <div freeze="1" class="th col lsticky" style="min-width: 46px;max-width: 46px;"></div>
          <template v-for="(col, key) in cols" :key="key">
            <div class="col" ref="th" :style="colStyle(col, 1)" :class="{ sticky: col.sticky }" v-if="col.show">
              <div class="cell">
              </div>
            </div>
          </template>
          <div class="col" :colspan="7 * weeks.length">
            <div style="display: flex; flex-wrap: nowrap">
              <div v-for="(week) in weeks" :key="week" class="week-slot">
              </div>
            </div>
          </div>
        </div>


        <template v-for="(row, rowIndex) in getAllRow()" :key="rowIndex">
          <div class="row" :style="{ gridTemplateColumns: gridColumns() }" v-show="!isCollapsed(row)"
            :class="{ wholeRowSelected: selectWholeRowIndex === rowIndex }" @dragover="dragOver"
            @drop="drop($event, row, rowIndex)">
            <a style="min-width: 46px;max-width: 46px;" class="col lsticky" :draggable="true"
              @dragstart="dragstart($event, row)" @click="clickSelectCell($event, rowIndex, row)"
              @contextmenu="clickSelectCell($event, rowIndex, row); showContextMenu($event, rowIndex)"
              :class="{ curRow: selectRow == row }">
              {{ row._rIndex + 1 }}
            </a>
            <template v-for="(col, cellIndex) in cols" :key="cellIndex">
              <div class="col td" :data-row="rowIndex + 1" :data-col="cellIndex + 1" :tabindex="100 * rowIndex + cellIndex"
                :class="cellClass(rowIndex + 1, cellIndex + 1, col)" :style="colStyle(col)"
                @click="clickSelectCell($event, rowIndex, row, cellIndex, col)">
                <div class="cell">
                  <component :is="col.cp" :row="row" :col="col" @change="saveData(1)"></component>
                </div>
              </div>
            </template>
            <div class="col" :colspan="7 * weeks.length">
              <div style="display: flex; flex-wrap: nowrap" class="sch" @mousedown.left="mouseDownSch($event, row)"
                @mousemove="mouseMoveSchRow($event, row)">
                <div :style="{ width: 1 / days * 100 + '%' }" style="position: relative;">
                  <div v-if="row._sch && row._sch.length && row._sch[0].end&&row._sch[0].start.date" :style="{
                    width: (calculateDaysBetweenDates(row._sch[0].end, row._sch[0].start) + 1) * 100 + '%',
                    marginLeft: (calculateDaysBetweenDates(row._sch[0].start, firstDay)) * 100 + '%'
                  }" class="plantime">{{ calculateDaysBetweenDates(row._sch[0].end, row._sch[0].start) + 1 }}
                  </div>
                  <div v-if="selectStart &&
selectStart.row == row" 
:style="{width:(calculateDaysBetweenDates(selectStart.end||selectStart.start,selectStart.start)+1)*100+'%',
marginLeft:(calculateDaysBetweenDates(selectStart.start,firstDay))*100+'%'
}"
class="selectStart"
>{{ calculateDaysBetweenDates(selectStart.end||selectStart.start,selectStart.start)+1 }}</div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
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
</template>



<script setup>
import { useConfigStore } from '@/stores/config'

import Config from './Config.vue';

import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

const store = useConfigStore();
console.log(store.config)
</script>
<script>




import ColTitle from './ColTitle.vue';
import ColDropText from './ColDropText.vue';
import ColDate from './ColDate.vue';


export default {
  components: { ColTitle, ColDropText, ColDate, VueDatePicker },

  data() {
    return {
      weekCount: 20,
      showDatePicker: false,
      startDate: new Date(),
      tableHeight: 20,
      isContextMenuVisible: false,
      contextMenuPosition: { x: 0, y: 0 },
      showConfig: 0,
      selectStart: null,
      isDrag: 0,
      weeks: [],
      config: localStorage.getItem('config') ? JSON.parse(localStorage.getItem('config')) : {},
      dragRow: null,
      selectedRowIndex: null,
      selectRow: null,
      selectedcellIndex: null,
      selectCol: null,
      tableData: [],
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

    window.addEventListener('resize', () => {

      this.winResize();
    });
    this.winResize();

    document.body.addEventListener('mousemove', this.throttleHandleResize);
    document.body.addEventListener('mouseup', this.resizeBarMouseUp);
    this.loadData();
    this.weeks.length = 0;
    this.weeks.push(...this.generateWeeks(this.startDate, this.weekCount));
  },
  unmounted() {
    document.body.removeEventListener('mousemove', this.throttleHandleResize);
    document.body.removeEventListener('mouseup', this.resizeBarMouseUp);

  },
  beforeUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("click", this.hideContextMenu);
  },
  computed: {
    firstDay() {
      return this.weeks[0].dates[0];
    },
    days() {
      return this.weekCount * 7;
    },
    cols() {
      if (!this.config.cols) this.config.cols = [];
      return this.config.cols.filter(e => e.show && e.cp == 'ColTitle');
    },
    currentCell() {
      return this.selectRow && this.selectCol ? this.selectRow['c' + this.selectCol.fn] : null;
    }

  },
  watch: {
    startDate() {
      this.weeks.length = 0;
      this.weeks.push(...this.generateWeeks(this.startDate, this.weekCount));
    }, weekCount() {
      this.weeks.length = 0;
      this.weeks.push(...this.generateWeeks(this.startDate, this.weekCount));
    }
  },
  methods: {
    calculateDaysBetweenDates(date1, date2) {
      if(date1.date&&date2.date){
        const oneDay = 24 * 60 * 60 * 1000;
      return Math.round(Math.abs((date1.date - date2.date) / oneDay));
      }
      return 0;

    },
    mouseMoveSchRow(event, row) {

      let x = event.clientX - event.target.closest('.sch').getBoundingClientRect().left;
      let totalWidth = event.target.closest('.sch').offsetWidth;
      let index = parseInt(x / totalWidth * this.weekCount * 7);
      let date = this.weeks[parseInt(index / 7)].dates[index % 7];
      console.log(date.n)
      this.enterSch(row, date);

    },
    setSchStart(event, row) {
      let x = event.clientX - event.target.getBoundingClientRect().left;
      let totalWidth = event.target.closest('.sch').offsetWidth;
      let dayWidth = totalWidth / this.weekCount * 7;
      let dayNum = parseInt(x / dayWidth);
      console.log(dayNum, row);

    },
    loadData() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const data = localStorage.getItem('data') ? JSON.parse(localStorage.getItem('data')) : [];
      function loopToSetDate(row) {
        if (row._sch) for (let peroid of row._sch) {
          if (peroid && peroid.start && peroid.start.date) {
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
      for (let d of data) {
        loopToSetDate(d);
      }
      this.tableData = data;
    },
    winResize() {

      this.$nextTick(() => { this.resize(); });


    },
    resize() {
      console.log('resize')
      console.log('resize')
      for (let i = 0; i < this.$refs.rbar.length; i++) {
        this.$refs.rbar[i].style.left = this.$refs.th[i].offsetLeft + this.$refs.th[i].offsetWidth - this.$refs.rbar[i].offsetWidth / 2 + 'px';

      }
    },
    colStyle(col, isH) {
      let style = {};
      if (col.sticky) {
        style.left = "46px";
        style.zIndex = isH ? 4 : 3
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
      this.$nextTick(() => { this.resize(); });
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
        //this.$refs.th[i].style.width = width + 'px';
        let j = i;
        this.$refs.rbar[i].style.left = this.$refs.th[j].offsetLeft + width - this.$refs.rbar[i].offsetWidth / 2 + 'px';


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
      this.selectWholeRowIndex = null;
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
    gridColumns() {

      return '46px ' + this.cols.map(e => e.width + 'px').join(' ') + ' 1fr';
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
    subtractDates(date1, date2) {
      const oneDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day

      const convertedDate1 = new Date(date1);
      const convertedDate2 = new Date(date2);

      const timeDiff = convertedDate1.getTime() - convertedDate2.getTime();

      const diffInDays = Math.round(timeDiff / oneDay);

      return diffInDays;
    },
    increaseDateByDays(date, days) {
      const newDate = new Date(date);
      newDate.setDate(newDate.getDate() + days);
      return newDate;
    },
    enterSch(row, date) {
      if (this.selectStart != null && row == this.selectStart.row) {
        if (this.selectStart.type == 1) {
          let days = this.subtractDates(date, this.selectStart.date);

          this.selectStart.start = this.increaseDateByDays(
            this.selectStart.orgStart,
            days
          );
          this.selectStart.end = this.increaseDateByDays(
            this.selectStart.orgEnd,
            days
          );
        } else {
          if (
            !this.selectStart.end ||
            date.n != this.selectStart.end.n
          ) {
            this.selectStart.end = date;
          }
        }
      }
    },
    handleKeyDown(event) {
      if (
        event.key === "Delete" ||
        event.key === "Backspace" ||
        event.code === "Delete" ||
        event.code === "Backspace"
      ) {
        if (this.selectStart) {
          this.addDatePeriod(this.selectStart.row._sch, null, {
            start: this.selectStart.orgStart,
            end: this.selectStart.orgEnd,
          });
          this.selectStart = null;
        }
      }
    },
    mouseDownSch(event, row) {
      console.log("moousedown");

      let x = event.clientX - event.target.closest('.sch').getBoundingClientRect().left;
      let totalWidth = event.target.closest('.sch').offsetWidth;
      let index = parseInt(x / totalWidth * this.weekCount * 7);
      let date = this.weeks[parseInt(index / 7)].dates[index % 7];

      this.clickSch(row, date);

    },
    clickSch(row, date) {
      console.log("clickSch");

      if (this.isDateInRange(date, row._sch)) {
        console.log("drag start");
        return;
      }
      if (this.selectStart == null)
        this.selectStart = { type: 2, row: row, start: date };
      else if (this.selectStart.row == row) {
        if (!row._sch) row._sch = [];
        row._sch.length = 0;
        this.addDatePeriod(row._sch, {
          start: this.selectStart.start,
          end: date,
        });
        this.selectStart = null;
      } else this.selectStart = null;
    },
    addDatePeriod(mergedPeriods, addPeriod, removeOldPeriod) {
      if (addPeriod) {
        let newPeriod = {
          start:
            addPeriod.start.n > addPeriod.end.n
              ? addPeriod.end
              : addPeriod.start,
          end:
            addPeriod.start.n < addPeriod.end.n
              ? addPeriod.end
              : addPeriod.start,
        };
        mergedPeriods.push(newPeriod);
      }

      mergedPeriods.sort((a, b) => a.start - b.start);

      const updatedMerged = [];

      for (const period of mergedPeriods) {
        if (
          removeOldPeriod &&
          removeOldPeriod.start.n == period.start.n
        )
          continue;
        if (
          updatedMerged.length === 0 ||
          period.start.n - updatedMerged[updatedMerged.length - 1].end.n > 1
        ) {
          // If no overlap, add the current period as a new merged period
          updatedMerged.push(period);
        } else {
          // If overlap or adjacent, update the end date of the last merged period
          updatedMerged[updatedMerged.length - 1].end = period.end.n > updatedMerged[updatedMerged.length - 1].end.n ? period.end : updatedMerged[updatedMerged.length - 1].end;
        }
      }

      mergedPeriods.length = 0; // Clear the original array

      for (const period of updatedMerged) {
        mergedPeriods.push(period); // Update the original array with the revised merged periods
      }
    },

    isDateInRange2(targetDate, startDate, endDate) {
      // Convert dates to milliseconds since Unix epoch
      const targetTime = targetDate.n;
      const startTime = startDate.n;
      const endTime = endDate.n;

      // Check if targetDate is between startDate and endDate (inclusive)
      if (startTime <= endTime) {
        return targetTime >= startTime && targetTime <= endTime;
      } else {
        return targetTime >= endTime && targetTime <= startTime;
      }
    },
    isDateInRange(targetDate, sch) {
      if (!sch || !sch.length) return false;
      try {
        for (let i = 0; i < sch.length; i++) {
          let startDate = sch[i].start;
          let endDate = sch[i].end;

          if (targetDate.n >= startDate.n && targetDate.n <= endDate.n)
            return { start: startDate, end: endDate };
        }
      } catch (ee) {
        //console.error(ee);
      }


      return false;
    },
    isWeekend(date) {
      const dayOfWeek = date.getDay();
      return dayOfWeek === 0 || dayOfWeek === 6;
    },

    getDatesBetween(startDate, endDate, weekIndex) {
      const dates = [];
      const currentDate = new Date(startDate);
      const lastDate = new Date(endDate);
      let i = 0;
      while (currentDate <= lastDate) {
        let dateWrap = {
          date: new Date(currentDate),
          n: this.getDateAsInteger(currentDate),
          i: weekIndex * 7 + i++,
          isCur: this.isToday(currentDate),
          isWeekend: this.isWeekend(currentDate),
          label: this.formatDate(currentDate, { day: "2-digit" })
        };
        dates.push(dateWrap);
        currentDate.setDate(currentDate.getDate() + 1); // Move to the next day

      }

      return dates;
    },
    isSameDate(date1, date2) {
      const d1 = new Date(date1);
      const d2 = new Date(date2);

      if (d1.toDateString() === d2.toDateString()) {
        return true;
      } else {
        return false;
      }
    },
    getDateAsInteger(dateObj) {
      let year = dateObj.getFullYear();
      let month = String(dateObj.getMonth() + 1).padStart(2, '0');
      let day = String(dateObj.getDate()).padStart(2, '0');
      return parseInt(`${year}${month}${day}`, 10);
    },
    generateWeeks(startDate, n = 20) {
      const weeks = [];
      let startOfWeek = new Date(startDate);

      // Adjust startOfWeek to the beginning of the week (Monday)
      const startDayOfWeek = (startOfWeek.getDay() + 6) % 7; // Convert Sunday (0) to 6, Monday (1) to 0, Tuesday (2) to 1, and so on
      startOfWeek.setDate(startOfWeek.getDate() - startDayOfWeek);

      for (let i = 0; i < n; i++) {
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);

        weeks.push({
          start: new Date(startOfWeek),
          end: new Date(endOfWeek),
          i: i,
          startn: this.getDateAsInteger(startOfWeek),
          endn: this.getDateAsInteger(endOfWeek),
          label: this.formatDate(startOfWeek, {
            month: "short",
            year: "2-digit",
          }),
          dates: this.getDatesBetween(startOfWeek, endOfWeek, i)
        });

        startOfWeek.setDate(startOfWeek.getDate() + 7);
      }

      return weeks;
    },
    isToday(date) {
      const today = new Date();
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    },

    formatDate(date, format) {
      return date.toLocaleDateString("en-US", { ...format });
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
  border: 1px solid #ddd;
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

thead th {
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
  left: 0px;
  top: 0px;
  position: absolute;
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
  background-color: #F0FFF0 !important;
}

.sch .selected {
  background-color: lightgreen !important;
}

.contextmenu {
  background: white;
  z-index: 1;
  position: fixed;
  border: 2px solid gray;
  border-radius: 5px;
  padding: 5px;
}

.contextmenu ul {
  margin: 0;
}

td.left {
  border-left: 1px darkgreen solid;
}

td.right {
  border-right: 1px darkgreen solid;
}

td.top {
  border-top: 1px darkgreen solid;
}

td.bottom {
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
  z-index: 3;
  background: white;
}

.cell {
  line-height: 2em;
}

.row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.col {
  border: 1px solid #ccc;
  position: relative;
}

.header {
  position: sticky;
  top: 0;
  z-index: var(--vt-index-sticky-header);
  background-color: white
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

.sch {
  height: 100%;
}

.curRow,
.wholeRowSelected>div {
  background-color: #E0EEE0 !important
}

.day {
  margin: 0 5px;
  font-size: 60%;
}

.plantime {
  background-color: lightblue;
}
</style>
