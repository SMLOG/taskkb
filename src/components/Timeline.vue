<template>
  <div class="table-container" style="flex-grow: 1;position: relative;">
    <div class="overlay" v-if="showMoveOverLayer" @mousemove.prevent="handleMovement"
      @mouseup.prevent="stopHandleMovement">
    </div>
    <div ref="table" style="display: grid; grid-template-columns: 1fr;" @mousedown.left="handleMouseDown"
      @dragstart="dragstart" @dragover="dragOver" @drop="drop" @mousemove="handleMouseCellsMove"
      @mouseup.left="handleMouseUp">
      <ColumnsResizer :th="$refs.th" v-if="$refs.th" :table="$refs.table" data="rbar" :cols="cols" />
      <!--line-->
      <TimelineHeader />
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
                      @date-update="(d) => { config.startDate = d; showDatePicker = false }" :enable-time-picker="false"
                      type="date" inline auto-apply />
                    Weeks:<input type="number" v-model="config.weekCount" :min="20" @mousedown.stop />
                  </div>
                </a>
                <span>{{ week.label }}</span><span>({{ week.i + 1 }})</span>
              </div>
              <div style="display: flex; justify-content: space-between">
                <span v-for="day in week.dates" :key="day" class="day"
                  :class="{ selected: selectStart && (day.i >= selectStart.start.i && day.i <= selectStart.end.i), today: day.isCur, weekend: day.isWeekend }">
                  {{ day.label }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template v-for="(row, rowIndex) in getAllRow()" :key="rowIndex">
        <div class="row" :data-pos="row._pos" :style="{ gridTemplateColumns: gridColumns() }" v-show="!isCollapsed(row)"
          :class="{ wholeRowSelected: selectWholeRowIndex === rowIndex }">
          <a style="min-width: 46px;max-width: 46px;" class="col lsticky etype" :draggable="true"
            :class="{ curRow: curRow == row }">
            {{ row._rIndex + 1 }}
          </a>
          <template v-for="(col, cellIndex) in cols" :key="cellIndex">
            <div class="col td" :data-row="rowIndex + 1" :data-col="cellIndex + 1"
              :tabindex="100 * rowIndex + cellIndex" :class="cellClass(rowIndex + 1, cellIndex + 1, col)"
              :style="colStyle(col)">
              <div class="cell">
                <component :is="col.cp" :row="row" :col="col"></component>
              </div>
            </div>
          </template>
          <div class="col" :colspan="7 * weeks.length">
            <div style="display: flex; flex-wrap: nowrap" class="sch">
              <div :style="{ width: 1 / days * 100 + '%' }" style="position: relative;">
                <div v-if="row._tl && row._tl.end" :style="{
                  width: (calculateDaysBetweenDates(row._tl.end, row._tl.start) + 1) * 100 + '%',
                  marginLeft: (calculateDaysBetweenDates(row._tl.start, firstDay)) * 100 + '%'
                }" class="plantime" @mouseover="selectRowSch(row)">{{
                  calculateDaysBetweenDates(row._tl.end,
                    row._tl.start) +
                  1 }}
                </div>
                <div v-if="selectStart &&
                  selectStart.row == row" :style="{
                    width: (calculateDaysBetweenDates(selectStart.end, selectStart.start) + 1) * 100 + '%',
                    marginLeft: (calculateDaysBetweenDates(selectStart.start.n < selectStart.end.n ? selectStart.start : selectStart.end, firstDay)) * 100 + '%'
                  }" class="selectStart">{{ calculateDaysBetweenDates(selectStart.end,
                    selectStart.start) + 1 }}
                  <div class="leftDrag" @mousedown="isMouseDown = 1"></div>
                  <div class="rightDrag" @mousedown="isMouseDown = 1"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { useConfigStore } from '@/stores/config'
import { useDataRowsStore } from '@/stores/dataRows'
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import TimelineHeader from '@/components/TimelineHeader.vue';

</script>
<script>

import ColTitle from './ColTitle.vue';
import ColDropText from './ColDropText.vue';
import ColDate from './ColDate.vue';
import ColumnsResizer from '@/components/ColumnsResizer.vue';

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export default {
  components: { ColTitle, ColDropText, ColDate, VueDatePicker },

  data() {
    return {
      showMoveOverLayer: false,
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

    document.addEventListener("keydown", this.handleKeyDown);


    this.weeks.length = 0;
    this.weeks.push(...this.generateWeeks(this.config.startDate || new Date(), this.weekCount));
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

    colStyle(col, isH) {
      let style = {};
      if (col.sticky) {
        style.left = "46px";
        style.zIndex = isH ? 4 : 3
      }
      return style;
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


      if (event.target.closest('.row')) {

        let rowPos = event.target.closest('.row').dataset.pos;
        let row = this.fromPosToRow(rowPos);
        const configStore = useConfigStore();
        configStore.share.curRow = row;
        if(row._tl){
            if (event.target.classList.contains('selectStart')) {
            this.moveType = { x: event.clientX, type: 'selectStart', _tl: deepCopy(row._tl) }
          }
          else if (event.target.classList.contains('rightDrag')) {
            this.moveType = { x: event.clientX, type: 'rightDrag', initValue: deepCopy(row._tl.end), _tl: deepCopy(row._tl) }
          }
          else if (event.target.classList.contains('leftDrag')) {
            this.moveType = { x: event.clientX, type: 'leftDrag', initValue: deepCopy(row._tl.start), _tl: deepCopy(row._tl) }
          }
        }
         else if (event.target.closest('.sch')) {
          let x = event.clientX - event.target.closest('.sch').getBoundingClientRect().left;
          let totalWidth = event.target.closest('.sch').offsetWidth;
          let index = parseInt(x / totalWidth * this.weekCount * 7);
          let date = this.weeks[parseInt(index / 7)].dates[index % 7];
          if (!row._tl) {
            if (this.selectStart == null)
              this.selectStart = { type: 2, row: row, start: date, end: date };
            else if (this.selectStart.row == row) {
              row._tl = this.addDatePeriod({
                start: this.selectStart.start,
                end: date,
              });

            } else {
              this.selectStart = null;
              console.log('delete selectStart')

            }
          }
          else if (this.selectStart && row != this.selectStart.row) {

            this.selectStart = null;
            console.log('delete selectStart')
          }
        }

      }

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
      this.isMouseDown = true;

      const rowIndex = parseInt(cell.getAttribute('data-row'));
      const cellIndex = parseInt(cell.getAttribute('data-col'));

      this.startRowIndex = rowIndex;
      this.startcellIndex = cellIndex;
      this.endRowIndex = this.startRowIndex;
      this.endcellIndex = this.startcellIndex;
    },
    handleMouseCellsMove(event) {
      const cell = event.target.closest('div.col');

      if (this.isMouseDown && cell) {
        const rowIndex = parseInt(cell.getAttribute('data-row'));
        const cellIndex = parseInt(cell.getAttribute('data-col'));
        this.endRowIndex = rowIndex;
        this.endcellIndex = cellIndex;
      }

      let sch = event.target.closest('.sch');
      if(sch){

     
      let x = event.clientX - event.target.closest('.sch').getBoundingClientRect().left;
      let totalWidth = event.target.closest('.sch').offsetWidth;
      let index = parseInt(x / totalWidth * this.weekCount * 7);
      let date = this.weeks[parseInt(index / 7)].dates[index % 7];

      if (this.selectStart != null) {
        if ((!this.selectStart.row._tl))
          this.selectStart.end = date;
        else {
          if (this.moveType) {
            let x = event.clientX - this.moveType.x;

            let totalWidth = event.target.closest('.sch').offsetWidth;
            let unitWidth = totalWidth / this.weekCount / 7;


            let index = this.moveType._tl[this.moveType.type == 'rightDrag' ? 'end' : 'start'].i + parseInt(x / unitWidth)
            let date = this.weeks[parseInt(index / 7)].dates[index % 7];

            if (this.moveType.type == 'rightDrag')
              this.selectStart.end = date;
            else if (this.moveType.type == 'leftDrag')
              this.selectStart.start = date;
            else {
              let moveUnits = parseInt(x / unitWidth);
              index = this.moveType._tl.start.i + moveUnits;

              this.selectStart.start = this.weeks[parseInt(index / 7)].dates[index % 7];

              index = this.moveType._tl.end.i + moveUnits;

              this.selectStart.end = this.weeks[parseInt(index / 7)].dates[index % 7];
              console.log('moveUnits', moveUnits)
            }
          }
        }
      }
    }
    },
    handleMouseUp() {
      this.isMouseDown = false;
      if (this.moveType) {
        this.moveType = null;
        this.selectStart.row._tl.start = this.selectStart.start;
        this.selectStart.row._tl.end = this.selectStart.end;
      }


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


    gridColumns() {

      return '46px ' + this.cols.map(e => e.width + 'px').join(' ') + ' 1fr';
    },
    getAllRow() {
      let rows = [];
      let _rIndex = 0;
      for (let root of this.tableData) {
        root._level = 0;
        root._rIndex = _rIndex++;
        root._pos = root._rIndex;
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
          row._pos = rootRow._pos + "," + row._rIndex;

          list.push(...this.getRootRows(row));
        }

      }
      return list;


    },
    fromPosToRow(posStr) {
      return posStr.split(',').reduce((acc, cur) => acc[parseInt(cur)] || acc._childs[parseInt(cur)], this.tableData);
    },
    dragstart(event) {
      let interceptor = event.target.closest('.etype');
      if (interceptor) {
        let rowPos = interceptor.closest('.row').dataset.pos;
        let row = this.fromPosToRow(rowPos);
        this.dragRow = row;
        console.log(event);
        this.dragStartClientX = event.clientX;
      }

    },
    drop(event) {

      let interceptor = event.target.closest('.etype');
      if (!interceptor) { return }
      let rowPos = interceptor.closest('.row').dataset.pos;
      let row = this.fromPosToRow(rowPos);
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
      this.selectStart = { type: 1, row: row, start: row._tl.start, end: row._tl.end };

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
  background-color: lightgreen;
  left: 0px;
  top: 0px;
  position: absolute;
  cursor: move;
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
  background-color: #F0FFD0 !important;
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

.rightDrag {
  position: absolute;
  right: 0px;
  width: 4px;
  top: 0;
  bottom: 0;
}

.leftDrag {
  position: absolute;
  left: 0px;
  width: 4px;
  top: 0;
  bottom: 0;
}

.rightDrag:hover,
.leftDrag:hover {
  background: blue;
  cursor: ew-resize;
}

.today {
  color: red !important;
  font-weight: bold
}

.weekend {
  background-color: #ccc;
  color: blue;
}
.sch{user-select: none;}
</style>
