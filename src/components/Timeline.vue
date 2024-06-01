<template>
    <div class="table-container" style="flex-grow: 1;position: relative;">
      <div>
        <div ref="table" style="display: grid; grid-template-columns: 1fr;" @mousedown.left="handleMouseDown"
          @mousemove="handleMouseMove" @mouseup.left="handleMouseUp">
          <ColumnsResizer  :th="$refs.th" v-if="$refs.th" :table="$refs.table" data="rbar" :cols="cols"/>
          <!--line-->
          <div class="row header line" :style="{ gridTemplateColumns: gridColumns() }">
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
                        <VueDatePicker v-model="config.startDate"
                          @date-update="(d) => { config.startDate = d; showDatePicker = false }"
                          :enable-time-picker="false" type="date" inline auto-apply />
                        Weeks:<input type="number" v-model="config.weekCount" :min="20" @mousedown.stop />
                      </div>
                    </a>
                    <span>{{ week.label }}</span><span>({{ week.i + 1 }})</span>
                  </div>
                  <div style="display: flex; justify-content: space-between">
                    <span v-for="day in week.dates" :key="day" class="day" :class="{selected:selectStart&&(day.i>=selectStart.start.i&&day.i<=selectStart.end.i),today:day.isCur,weekend:day.isWeekend}">
                      {{ day.label }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <template v-for="(row, rowIndex) in getAllRow()" :key="rowIndex">
            <div class="row" :style="{ gridTemplateColumns: gridColumns() }" v-show="!isCollapsed(row)"
              :class="{ wholeRowSelected: selectWholeRowIndex === rowIndex }" @dragover="dragOver"
              @mousedown.left="clickSelectCell($event, rowIndex, row)" @mouseup="moveType = null"
              @drop="drop($event, row, rowIndex)">
              <a style="min-width: 46px;max-width: 46px;" class="col lsticky" :draggable="true"
                @dragstart="dragstart($event, row)" @click="clickSelectCell($event, rowIndex, row)"
                @contextmenu="clickSelectCell($event, rowIndex, row);"
                :class="{ curRow: curRow == row }">
                {{ row._rIndex + 1 }}
              </a>
              <template v-for="(col, cellIndex) in cols" :key="cellIndex">
                <div class="col td" :data-row="rowIndex + 1" :data-col="cellIndex + 1"
                  :tabindex="100 * rowIndex + cellIndex" :class="cellClass(rowIndex + 1, cellIndex + 1, col)"
                  :style="colStyle(col)" @click="clickSelectCell($event, rowIndex, row, cellIndex, col)">
                  <div class="cell">
                    <component :is="col.cp" :row="row" :col="col"></component>
                  </div>
                </div>
              </template>
              <div class="col" :colspan="7 * weeks.length">
                <div style="display: flex; flex-wrap: nowrap" class="sch" @mousedown.left="mouseDownSch($event, row)"
                  @mousemove.prevent="mouseMoveSchRow($event, row)">
                  <div :style="{ width: 1 / days * 100 + '%' }" style="position: relative;">
                    <div v-if="row._tl && row._tl.end" :style="{
                      width: (calculateDaysBetweenDates(row._tl.end, row._tl.start) + 1) * 100 + '%',
                      marginLeft: (calculateDaysBetweenDates(row._tl.start, firstDay)) * 100 + '%'
                    }" class="plantime" @click="selectRowSch(row)"
                      :class="{ selected: selectStart && selectStart.row == row }">{{
                        calculateDaysBetweenDates(row._tl.end,
                          row._tl.start) +
                        1 }}
                      <div class="leftDrag" @mousedown="isMouseDown = 1"></div>

                      <div class="rightDrag" @mousedown="isMouseDown = 1"></div>
                    </div>
                    <div v-if="selectStart && selectStart.type != 1 &&
                      selectStart.row == row" :style="{
                        width: (calculateDaysBetweenDates(selectStart.end || selectStart.start, selectStart.start) + 1) * 100 + '%',
                        marginLeft: (calculateDaysBetweenDates(!selectStart.end || selectStart.start.n < selectStart.end.n ? selectStart.start : selectStart.end, firstDay)) * 100 + '%'
                      }" class="selectStart">{{ calculateDaysBetweenDates(selectStart.end || selectStart.start,
                        selectStart.start) + 1 }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
</template>

<script setup>
import { useConfigStore } from '@/stores/config'
import { useDataRowsStore } from '@/stores/dataRows'
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
</script>
<script>

import ColTitle from './ColTitle.vue';
import ColDropText from './ColDropText.vue';
import ColDate from './ColDate.vue';
import ColumnsResizer from '@/components/ColumnsResizer.vue';

export default {
  components: { ColTitle, ColDropText, ColDate, VueDatePicker },

  data() {
    return {
      weekCount: 20,
      showDatePicker: false,
      selectStart: null,
      isDrag: 0,
      weeks: [],
      config: null,
      dragRow: null,
      selectedRowIndex: null,
      moveType: null,
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
    this.config = useConfigStore().config;
    this.tableData = useDataRowsStore().dataRows;

    if (!this.config.startDate) this.config.startDate = new Date();
    if (!this.config.weekCount) this.config.weekCount = 20;
    this.$watch(
      () => this.config.startDate,
      () => {
        this.weeks.length = 0;
        this.weeks.push(...this.generateWeeks(this.config.startDate, this.config.weekCount));
      }
    );

    this.$watch(
      () => this.config.weekCount,
      () => {
        this.weeks.length = 0;
        this.weeks.push(...this.generateWeeks(this.config.startDate, this.config.weekCount));
      }
    );
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
    document.addEventListener("keydown", this.handleKeyDown);

    document.body.addEventListener('mousemove', this.throttleHandleResize);

    this.weeks.length = 0;
    this.weeks.push(...this.generateWeeks(this.config.startDate || new Date(), this.weekCount));
  },
  unmounted() {
    document.body.removeEventListener('mousemove', this.throttleHandleResize);

  },
  beforeUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  },
  computed: {
    firstDay() {
      return this.weeks[0].dates[0];
    },
    days() {
      return this.weekCount * 7;
    },
    cols() {
      if (this.config && this.config.cols)
        return this.config.cols.filter(e => e.show && e.cp == 'ColTitle');
      return [];
    },
    curRow() {
      const configStore = useConfigStore();
      return configStore.share.curRow;
    }
  },
  watch: {

  },
  methods: {
    calculateDaysBetweenDates(date1, date2) {
      if (!date1.date) {
        return 0;
      }
      if (!date2.date) {
        return 0;
      }
      const oneDay = 24 * 60 * 60 * 1000;
      return Math.round(Math.abs((date1.date - date2.date) / oneDay));


    },
    mouseMoveSchRow(event, row) {

      let x = event.clientX - event.target.closest('.sch').getBoundingClientRect().left;
      let totalWidth = event.target.closest('.sch').offsetWidth;
      let index = parseInt(x / totalWidth * this.weekCount * 7);
      let date = this.weeks[parseInt(index / 7)].dates[index % 7];

      if (this.selectStart != null && row == this.selectStart.row && !this.selectStart.row._tl) {
        this.selectStart.end = date;
      }

    },
    setSchStart(event, row) {
      let x = event.clientX - event.target.getBoundingClientRect().left;
      let totalWidth = event.target.closest('.sch').offsetWidth;
      let dayWidth = totalWidth / this.weekCount * 7;
      let dayNum = parseInt(x / dayWidth);
      console.log(dayNum, row);

    },
    colStyle(col, isH) {
      let style = {};
      if (col.sticky) {
        style.left = "46px";
        style.zIndex = isH ? 4 : 3
      }
      return style;
    },
    throttleHandleResize(event) {
      if (this.moveType) {
        let x = event.clientX - this.moveType.x;

        let totalWidth = event.target.closest('.sch').offsetWidth;
        let unitWidth = totalWidth / this.weekCount / 7;


        let index = this.moveType._tl[this.moveType.type == 'rightDrag' ? 'end' : 'start'].i + parseInt(x / unitWidth)
        let date = this.weeks[parseInt(index / 7)].dates[index % 7];

        if (this.moveType.type == 'rightDrag')
          this.curRow._tl.end = date;
        else if (this.moveType.type == 'leftDrag')
          this.curRow._tl.start = date;
        else {
          index = this.moveType._tl.start.i + parseInt(x / unitWidth);

          this.curRow._tl.start = this.weeks[parseInt(index / 7)].dates[index % 7];
          index = this.moveType._tl.end.i + parseInt(x / unitWidth);

          this.curRow._tl.end = this.weeks[parseInt(index / 7)].dates[index % 7];
        }
      } 
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
      const configStore = useConfigStore();
      configStore.share.curRow = row;
      this.selectCol = col;

      if (cellIndex == undefined) {
        this.selectWholeRowIndex = rowIndex;
        this.selectCol = null;
      } else {
        this.selectWholeRowIndex = false;
      }
      if (event.target.classList.contains('plantime')) {
        this.moveType = { x: event.clientX, type: 'plantime', _tl: JSON.parse(JSON.stringify(row._tl)) }
      }
      else if (event.target.classList.contains('rightDrag')) {
        this.moveType = { x: event.clientX, type: 'rightDrag', initValue: row._tl.end, _tl: JSON.parse(JSON.stringify(row._tl)) }
      }
      else if (event.target.classList.contains('leftDrag')) {
        this.moveType = { x: event.clientX, type: 'leftDrag', initValue: row._tl.start, _tl: JSON.parse(JSON.stringify(row._tl)) }
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
    handleKeyDown(event) {
      if (
        event.key === "Delete" ||
        event.key === "Backspace" ||
        event.code === "Delete" ||
        event.code === "Backspace"
      ) {
        if (this.selectStart) {
          delete this.selectStart.row._tl;
          this.selectStart = null;
        }
      }
    },
    selectRowSch(row) {
      this.selectStart = { type: 1, row: row,start:row._tl.start,end:row._tl.end };
    },
    mouseDownSch(event, row) {
      console.log("moousedown");

      let x = event.clientX - event.target.closest('.sch').getBoundingClientRect().left;
      let totalWidth = event.target.closest('.sch').offsetWidth;
      let index = parseInt(x / totalWidth * this.weekCount * 7);
      let date = this.weeks[parseInt(index / 7)].dates[index % 7];
      if (!row._tl)
        this.clickSch(row, date);
      else this.selectStart = null;

    },
    clickSch(row, date) {
      console.log("clickSch");

      if (this.isDateInRange(date, row._tl)) {
        console.log("drag start");
        return;
      }
      if (this.selectStart == null)
        this.selectStart = { type: 2, row: row, start: date,end:date };
      else if (this.selectStart.row == row) {
        row._tl = this.addDatePeriod({
          start: this.selectStart.start,
          end: date,
        });
        this.selectStart = null;
      } else this.selectStart = null;
    },
    addDatePeriod(addPeriod) {
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
        return newPeriod;
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

  },
};
</script>

<style scoped>
.week-slot {
  position: relative;
  flex-grow: 1;
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

.line .week-slot::after {
  height: var(--table-height);
  z-index: -1;
}

.line {
  z-index: -1 !important;
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

.selected {
  background-color: lightgreen !important;
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
  background-color: rgba(224, 238, 224, 0.5) !important
}

.day {
  padding: 0 5px;
  font-size: 60%;
}

.plantime {
  background-color: lightblue;
  cursor: move;
  position: relative;
}

.plantime .rightDrag {
  position: absolute;
  right: 0px;
  width: 4px;
  top: 0;
  bottom: 0;
}

.plantime .leftDrag {
  position: absolute;
  left: 0px;
  width: 4px;
  top: 0;
  bottom: 0;
}

.plantime .rightDrag:hover,
.plantime .leftDrag:hover {
  background: blue;
  cursor: ew-resize;
}
.today{
  color:red!important;
  font-weight: bold
}
.weekend{
  background-color: #ccc;
  color:blue;
}
</style>
