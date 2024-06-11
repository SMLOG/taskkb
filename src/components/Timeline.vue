<template>
  <div class="table-container" style="position: relative;"
    :class="{ drag: moveType && (moveType.type == 'leftDrag' || moveType.type == 'rightDrag'), move: moveType && moveType.type == 'move' }">
    <div class="overlay" v-if="showMoveOverLayer" @mousemove.prevent="handleMovement"
      @mouseup.prevent="stopHandleMovement">
    </div>
    <div ref="table" style="display: grid; grid-template-columns: 1fr;" @mousedown.left="handleMouseDown"
      @dragstart="dragstart" @dragover="dragOver" @drop="drop" @mousemove="handleMouseCellsMove" @click="handleClick"
      @mouseup.left="handleMouseUp">
      <ColumnsResizer :th="$refs.th" v-if="isMounted" :table="$refs.table" data="rbar" :cols="cols" />
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
        <div class="col" :colspan="7 * weeks.length" style="user-select: none;">
          <div style="display: flex; flex-wrap: nowrap">
            <div v-for="(week, index) in weeks" :key="week" class="week-slot">
              <div>
                <a v-if="index == 0" @mouseenter="showDatePicker = true" @mouseleave="showDatePicker = false">
                  Start
                  <div v-if="showDatePicker" style="position: absolute;background: white;">
                    <VueDatePicker v-model="config.startDate"
                      @date-update="(d) => { config.startDate = d; showDatePicker = false }" :enable-time-picker="false"
                      type="date" inline auto-apply />
                    <div style="margin:10px;"> Weeks:<input type="number" v-model="config.weekCount" :min="20"
                        @mousedown.stop /></div>
                  </div>
                </a>
                <span>{{ week.label }}</span><span>({{ week.i + 1 }})</span>
              </div>
              <div style="display: flex; justify-content: space-between">
                <span v-for="day in week.dates" :key="day" class="day" :class="{
                  selected: selectStart && isBetween(selectStart.start.i, selectStart.end.i, day.i),
                  today: day.isCur,
                  weekend: day.isWeekend,
                  holiday: day.holiday
                }">
                  {{ day.label }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template v-for="(row, rowIndex) in getAllRows()" :key="rowIndex">
        <div class="row" :data-pos="row._pos" :data-row-index="rowIndex" :style="{ gridTemplateColumns: gridColumns() }"
          v-show="!isCollapsed(row)" :class="{ wholeRowSelected: selectRowsIndex && selectRowsIndex.indexOf(rowIndex) > -1 }">
          <a style="min-width: 46px;max-width: 46px;" class="col lsticky etype num"
            :draggable="isDrag" :class="{ curRow: rowIndex == curRowIndex }">
            {{ row._rIndex + 1 }}
          </a>
          <template v-for="(col, cellIndex) in cols" :key="cellIndex">
            <div class="col td title" :data-row="rowIndex + 1" :data-col="cellIndex + 1"
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
                  width: (calculateDaysBetweenDates(row._tl.end, row._tl.start)) * 100 + '%',
                  marginLeft: (calculateDaysBetweenDates(row._tl.start, firstDay) - 1) * 100 + '%'
                }" class="plantime" @mouseover="selectRowSch(row)">{{
                  calculateDaysBetweenDates(row._tl.end,
                    row._tl.start, true) }}d
                </div>
                <div v-if="selectStart &&
                  selectStart.row == row" :style="{
                    width: (calculateDaysBetweenDates(selectStart.end, selectStart.start)) * 100 + '%',
                    marginLeft: (calculateDaysBetweenDates(selectStart.start.n < selectStart.end.n ? selectStart.start : selectStart.end, firstDay) - 1) * 100 + '%'
                  }" class="selectStart">{{ calculateDaysBetweenDates(selectStart.end,
                    selectStart.start, true) }}d
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
      isMounted: false,
      selectRowStart: -1,
      selectRowEnd: -1,
      holidays: [
        { date: '2024-01-01', n: 20240101, name: 'New Year\'s Day' },
        { date: '2024-02-10', n: 20240210, name: 'Lunar New Year\'s Day' },
        { date: '2024-02-12', n: 20240212, name: 'The third day of Lunar New Year' },
        { date: '2024-02-13', n: 20240213, name: 'The fourth day of Lunar New Year' },
        { date: '2024-03-29', n: 20240329, name: 'Good Friday' },
        { date: '2024-03-30', n: 20240330, name: 'The day following Good Friday' },
        { date: '2024-04-01', n: 20240401, name: 'Easter Monday' },
        { date: '2024-04-04', n: 20240404, name: 'Ching Ming Festival' },
        { date: '2024-05-01', n: 20240501, name: 'Labour Day' },
        { date: '2024-05-15', n: 20240515, name: 'The Birthday of the Buddha' },
        { date: '2024-06-10', n: 20240610, name: 'Tuen Ng Festival' },
        { date: '2024-07-01', n: 20240701, name: 'Hong Kong Special Administrative Region Establishment Day' },
        { date: '2024-09-18', n: 20240918, name: 'The day following the Chinese Mid-Autumn Festival' },
        { date: '2024-10-01', n: 20241001, name: 'National Day' },
        { date: '2024-10-11', n: 20241011, name: 'Chung Yeung Festival' },
        { date: '2024-12-25', n: 20241225, name: 'Christmas Day' },
        { date: '2024-12-26', n: 20241226, name: 'The first weekday after Christmas Day' }
      ],
      showMoveOverLayer: false,
      showDatePicker: false,
      selectStart: null,
      isDrag: 0,
      weeks: [],
      config: null,
      selectedRowIndex: null,
      moveType: null,
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
    this.weeks.push(...this.generateWeeks(this.config.startDate || new Date(), this.config.weekCount));
    this.$nextTick(() => this.isMounted = true);
  },
  beforeUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  },
  computed: {
    firstDay() {
      return this.weeks[0].dates[0];
    },
    days() {
      return this.config.weekCount * 7;
    },
    cols() {
      if (this.config && this.config.cols)
        return this.config.cols.filter(e => e.show && e.cp == 'ColTitle');
      return [];
    },
    selectRows() {
      const configStore = useConfigStore();
      return configStore.share.selectRows;
    }
  },
  watch: {

  },
  methods: {
    isBetween(a, b, c) {
      return (a <= c && c <= b) || (b <= c && c <= a);
    },
    calculateDaysBetweenDates(d1, d2, exclusiveHolidayWeeken) {


      let date1 = d1.i > d2.i ? d1 : d2;
      let date2 = d1.i > d2.i ? d2 : d1;
      if (exclusiveHolidayWeeken) {
        let weekIndex1 = parseInt(date1.i / 7);
        let weekIndex2 = parseInt(date2.i / 7);

        let i = date2.i % 7;
        let count = 0;
        for (let w = weekIndex2; w <= weekIndex1; w++) {

          for (; i <= (w < weekIndex1 ? 6 : date1.i % 7); i++) {
            let day = this.weeks[w].dates[i];
            if (day.isWeekend || day.holiday) continue;
            count++;

          }
          i = 0;
        }
        return count;

      }
      return date1.i - date2.i + 1;


    },

    colStyle(col) {
      let style = {};
      if (col.sticky) {
        style.left = "46px";
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
    handleClick(event) {

      let title = event.target.closest('.title');
      if (title) {
        let rowEl = title.closest('.row');
        let plantime = rowEl.querySelector('.plantime');
        if (plantime)
          rowEl.closest('#mainContent').scrollLeft = plantime.offsetLeft;

      }
    },
    handleMouseDown(event) {
      console.log('mosuedown')

      let rowEl = event.target.closest('.row');
      if (rowEl) {
        this.isMouseDown = true;
        let rowIndex = parseInt(rowEl.dataset.rowIndex);
        let row = this.flatRows[rowIndex];
        useDataRowsStore().curRowIndex = parseInt(rowEl.dataset.rowIndex);
        let selectRows = this.selectRowsIndex;
        if (event.target.classList.contains('num')) {
          if (selectRows.indexOf(rowIndex) > -1) {
            //drag
            this.isDrag = true;
          } else {
            this.selectRowStart = parseInt(rowEl.dataset.rowIndex);
            this.selectRowEnd = parseInt(rowEl.dataset.rowIndex);
            selectRows.length = 0;
            selectRows.push(this.selectRowStart);
          }
        } else {
          selectRows.length = 0;
          this.selectRowStart = this.selectRowEnd = -1;

          if (row._tl && row._tl.start && this.selectStart && this.selectStart.row==row) {
            if (event.target.classList.contains('selectStart')) {
              this.moveType = { x: event.clientX, type: 'move', _tl: deepCopy(row._tl) }
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
            let index = parseInt(x / totalWidth * this.config.weekCount * 7);
            let date = this.weeks[parseInt(index / 7)].dates[index % 7];
            if (!row._tl || !row._tl.start) {
              if (this.selectStart == null){
                this.selectStart = { type: 2, row: row, start: date, end: date };
              }
              else if (this.selectStart.row == row && this.selectStart.start) {
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
      this.isMouseDown = true;
      event.preventDefault();
      const rowIndex = parseInt(cell.getAttribute('data-row'));
      const cellIndex = parseInt(cell.getAttribute('data-col'));

      this.startRowIndex = rowIndex;
      this.startcellIndex = cellIndex;
      this.endRowIndex = this.startRowIndex;
      this.endcellIndex = this.startcellIndex;
    },
    handleMouseCellsMove(event) {
      let rowEl = event.target.closest('.row');
      if (rowEl) {
        if (this.isMouseDown) {
          const cell = event.target.closest('div.col');
          if(this.selectRowsIndex.length){
            this.selectRowsIndex.length=0;
            this.selectRowEnd = parseInt(rowEl.dataset.rowIndex);
            this.selectRowsIndex.push(...Array.from({length: Math.abs(this.selectRowStart-this.selectRowEnd)+1}, (_, i) =>  Math.min(this.selectRowStart,this.selectRowEnd) + i));
            
          }else if (cell) {
            const rowIndex = parseInt(cell.getAttribute('data-row'));
            const cellIndex = parseInt(cell.getAttribute('data-col'));
            this.endRowIndex = rowIndex;
            this.endcellIndex = cellIndex;
          } 
        }
      }



      let sch = event.target.closest('.sch');
      if (sch) {


        let x = event.clientX - event.target.closest('.sch').getBoundingClientRect().left;
        let totalWidth = event.target.closest('.sch').offsetWidth;
        let index = parseInt(x / totalWidth * this.config.weekCount * 7);
        let date = this.weeks[parseInt(index / 7)].dates[index % 7];

        if (this.selectStart != null) {
          if ((!this.selectStart.row._tl))
            this.selectStart.end = date;
          else {
            if (this.moveType) {
              let x = event.clientX - this.moveType.x;

              let totalWidth = event.target.closest('.sch').offsetWidth;
              let unitWidth = totalWidth / this.config.weekCount / 7;


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
      if(this.isDrag){
        this.selectRowsIndex.length=0;
      }
      this.isDrag = this.isMouseDown = false;
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
        (minRowIndex>=0&&rowIndex >= minRowIndex && rowIndex <= maxRowIndex) &&
        (mincellIndex>=0&&cellIndex >= mincellIndex && cellIndex <= maxcellIndex)
      );
    },


    gridColumns() {

      return '46px ' + this.cols.map(e => e.width + 'px').join(' ') + ' 1fr';
    },
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
    dragstart(event) {
      let interceptor = event.target.closest('.etype');
      if (interceptor) {
        let rowIndex = parseInt(interceptor.closest('.row').dataset.rowIndex);
        let row = this.flatRows[rowIndex];
        console.log(event);
        this.dragStartClientX = event.clientX;
      }

    },
    drop(event) {

      let interceptor = event.target.closest('.row');
      if (!interceptor) { return }
      let rowIndex =  parseInt(interceptor.closest('.row').dataset.rowIndex);
      let row = this.flatRows[rowIndex];
      console.log(event);

      this.selectRowsIndex.forEach((e)=>{
        let dragRow = this.flatRows[e];
            if (this.isParentMoveToChild(dragRow, row)) {
            console.error("not allow parent move to child.");
            return;
          } else if (row == dragRow) {
            console.error('same row');
            return;
          }
          let toChildList = row._p._childs ;
          console.log('drop');

          if (dragRow !== null) {

            let fromChildList = dragRow._p._childs;
            let fromIndex = fromChildList.indexOf(dragRow);
            let targetIndex = toChildList.indexOf(row);

            if (event.clientX - this.dragStartClientX > 50) {
              console.log('drop to child.');
              fromChildList.splice(fromIndex, 1);
              if (!row._childs) row._childs = [];
              row._childs.push(dragRow);
              dragRow._p = row;
              dragRow._level = row._level + 1;
            } else if (row._p == dragRow._p && fromIndex - targetIndex == 1) {
              fromChildList.splice(fromIndex, 1);
              targetIndex = toChildList.indexOf(row);
              fromChildList.splice(targetIndex, 0, dragRow);
            } else {
              fromChildList.splice(fromIndex, 1);
              targetIndex = toChildList.indexOf(row);
              toChildList.splice(targetIndex + 1, 0, dragRow);
              dragRow._p = row._p;
              dragRow._level = row._level;
            }

          }

      });

      this.selectRowsIndex.length=0;
      this.isDrag=false;



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
      if (!this.moveType && (!this.selectStart||this.selectStart.type!=2) )
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
        let n = this.getDateAsInteger(currentDate);
        let holiday = this.holidays.filter(e => e.n == n);
        let dateWrap = {
          date: new Date(currentDate),
          n: n,
          i: weekIndex * 7 + i++,
          isCur: this.isToday(currentDate),
          isWeekend: this.isWeekend(currentDate),
          label: this.formatDate(currentDate, { day: "2-digit" }),
          holiday: holiday.length && holiday[0]
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
    generateWeeks(startDate, n) {
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
  border-left: 1px solid #ddd;
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
  background-color: #CCFFCC;
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
  background-color: #F0FFF0 !important;
}

.curRow,
.wholeRowSelected .col {
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
  border-bottom: 1px solid #ccc;
}

.col {
  border-right: 1px solid #ccc;
  position: relative;
}

.header {
  position: sticky;
  top: 0;
  z-index: var(--vt-index-sticky-header);
  background-color: white
}

.header .col {
  border-top: 1px solid #ccc;
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
  text-decoration: line-through;
}

.sch {
  user-select: none;
}

.holiday {
  text-decoration: underline;
}

.drag {
  cursor: ew-resize;
}

.move {
  cursor: move;
}
.num{
  user-select: none;
}
</style>
