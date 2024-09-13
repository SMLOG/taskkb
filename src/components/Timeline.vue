<template>
  <div class="table-container" style="position: relative;"
    :class="{ drag: moveType && (moveType.type == 'leftDrag' || moveType.type == 'rightDrag'), move: moveType && moveType.type == 'move' }"
    >
    <div class="overlay" v-if="showMoveOverLayer" @mousemove.prevent="handleMovement"
      @mouseup.prevent="stopHandleMovement">
    </div>
    <a v-if="config"  @mouseenter="showDatePicker = true" @mouseleave="showDatePicker = false" style="position: fixed;top:20%;right:10px;z-index: 100;;">
                  Start
                  <div v-show="showDatePicker" style="position: absolute;background: white;right:0;">
                    <VueDatePicker v-model="config.startDate"
                      @date-update="(d) => { config.startDate = d; showDatePicker = false }" :enable-time-picker="false"
                      type="date" inline auto-apply />
                    <div style="margin:10px;"> Weeks:<input type="number" v-model="config.weekCount" :min="20"
                        @mousedown.stop /></div>
                        <div style="margin:10px;"> Allow Options:<input  v-model="config.allowOptions" :min="20"
                          @mousedown.stop /></div>
                  </div>
     </a>
    <div ref="table" style="display: grid; grid-template-columns: 1fr;" @mousedown.left="handleMouseDown"
      @dragstart="dragstart" @dragover="dragOver" @drop="drop" @mousemove="handleMouseCellsMove" @click="handleClick"
      @mouseup.left="handleMouseUp"
      @dblclick="dblclickHandle"
      >
      <ColumnsResizer :th="$refs.th" v-if="isMounted" :table="$refs.table" data="rbar" :cols="cols" />
      <!--line-->
      <TimelineHeader/>
      <div class="row header" :style="{ gridTemplateColumns: gridColumns() }">
        <template v-for="(col, cellIndex) in cols" :key="cellIndex">
          <div class="col" ref="th" :style="colStyle(col, 1,cellIndex)" :class="{ sticky: col.sticky }" v-if="col.show">
            <div class="cell">
              <component :is="col.cp" :col="col"></component>
            </div>
          </div>
        </template>
        <div class="col" :colspan="7 * weeks.length" style="user-select: none;">
          <div style="display: flex; flex-wrap: nowrap">
            <div v-for="(week, index) in weeks" :key="week" class="week-slot">
              <div>

                <span>{{ week.label }}</span><span>({{ week.i + 1 }})</span>
              </div>
              <div style="display: flex; justify-content: space-between">
                <span v-for="day in week.dates" :key="day" class="day" :class="{
                  selected: selectStartRef && selectStartRef.start && isBetween(selectStartRef.start.i, selectStartRef.end.i, day.i),
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
        <div class="row"  :data-row-index="rowIndex" :style="{ gridTemplateColumns: gridColumns() }"
          v-show="!isCollapsed(row)"
          :class="{ wholeRowSelected: selectRowsIndex && selectRowsIndex.indexOf(rowIndex) > -1 }">

          <template v-for="(col, cellIndex) in cols" :key="cellIndex">
            <component v-if="col.cp=='ColSeq'" :class="cellClass(rowIndex + 1, cellIndex + 1, col)" class="col td" :is="col.cp" :row="row" :col="col" :style="colStyle(col, 1,cellIndex)" :data-row="rowIndex + 1" :data-col="cellIndex + 1" :tabindex="100 * rowIndex + cellIndex" ></component>
            <div v-else class="col td title" :data-row="rowIndex + 1" :data-col="cellIndex + 1"
              :tabindex="100 * rowIndex + cellIndex" :class="cellClass(rowIndex + 1, cellIndex + 1, col)"
              :style="colStyle(col, 1,cellIndex)">
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
                }" class="plantime" @click="selectRowSch(row,$event)" 
                :class="{dragMode:dragMode && inDragRang(rowIndex)}"
                >{{
                  calculateDaysBetweenDates(row._tl.end,
                    row._tl.start, true) }}d
                </div>
                <div v-if="selectStartRef &&
                  selectStartRef.row == row" @dblclick="dragMode=!dragMode" :style="{
                    width: getCacWidth(),
                    marginLeft: (calculateDaysBetweenDates(selectStartRef.start.n < selectStartRef.end.n ? selectStartRef.start : selectStartRef.end, firstDay) - 1) * 100 + '%'
                  }" class="selectStartRef" :class="{dragMode:dragMode}">{{ calculateDaysBetweenDates(selectStartRef.end,
                    selectStartRef.start, true) }}d
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

import { useTableComposable } from '@/components/useTableComposable'
const { dragOver, handleMouseDown, handleMouseCellsMove, handleMouseUp, 
  cellClass,getCacWidth,handleKeyDown,selectRowSch,selectStartRef,calculateDaysBetweenDates,isDrag,
  dragstart,drop,curRowIndex,moveType,dragMode,dblclickHandle,
  inDragRang
  } = useTableComposable();
document.addEventListener("keydown", handleKeyDown);

</script>
<script>

import ColTitle from './ColTitle.vue';
import ColDropText from './ColDropText.vue';
import ColDate from './ColDate.vue';
import ColumnsResizer from '@/components/ColumnsResizer.vue';
import ColSeq from './ColSeq.vue';

export default {
  components: { ColTitle, ColDropText, ColDate, VueDatePicker,ColSeq },
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
      config: null,
      selectCol: null,
      flatRows: null,
    };
  },
  mounted() {

    this.config = useConfigStore().config;
    this.flatRows = useDataRowsStore().flatRows;
    this.selectRowsIndex = useDataRowsStore().selectRowsIndex;


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



    this.weeks.length = 0;
    this.weeks.push(...this.generateWeeks(this.config.startDate || new Date(), this.config.weekCount));
    this.$nextTick(() => this.isMounted = true);
  },
  beforeUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  },
  computed: {
    weeks() {
      const { weeks } = useTableComposable();
      return weeks;
    },

    firstDay() {
      return this.weeks[0].dates[0];
    },
    days() {
      return this.config.weekCount * 7;
    },
    cols() {
      if (this.config && this.config.cols)
        return this.config.cols.filter(e => e.show );
      return [];
    }
  },
  watch: {

  },
  methods: {
    isBetween(a, b, c) {
      return (a <= c && c <= b) || (b <= c && c <= a);
    },

    colStyle(col, isH,index) {
      let style = {};
      if (col.sticky) {
        style.left='var(--sticky-left-'+index+')';
      }else style.left = 'auto';
      return style;
    },
    gridColumns() {
      return this.cols.map(e => e.width + 'px').join(' ')+ ' 1fr';
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

<style src="./grid.css" scoped>
</style>
<style scoped>
.selectStartRef.dragMode,.dragMode{
  background-color: green!important;
}
.lock{
  color:red;
}
</style>

