<template>
  <div class="table-container" style="position: relative;"
    :class="{ drag: moveType && (moveType.type == 'leftDrag' || moveType.type == 'rightDrag'), move: moveType && moveType.type == 'move' }">
    <div class="overlay" v-if="showMoveOverLayer" @mousemove.prevent="handleMovement"
      @mouseup.prevent="stopHandleMovement">
    </div>
    <a v-if="config" @mouseenter="showDatePicker = true" @mouseleave="showDatePicker = false"
      style="position: fixed;top:20%;right:10px;z-index: 100;">
      Start
      <div v-show="showDatePicker" style="position: absolute;background: white;right:0;">
        <VueDatePicker v-model="config.startDate"
          @date-update="(d) => { config.startDate = d; showDatePicker = false }" :enable-time-picker="false"
          type="date" inline auto-apply />
        <div style="margin:10px;"> Weeks:<input type="number" v-model="config.weekCount" :min="20"
            @mousedown.stop,
          @mousedown.stop /></div>
        <div style="margin:10px;"> Allow Options:<input v-model="config.allowOptions" :min="20"
            @mousedown.stop /></div>
      </div>
    </a>
    <div ref="table" style="display: grid; grid-template-columns: 1fr;" 
      @mouseup.left="handleMouseUp" @dblclick="dblclickHandle">
     <!-- <ColumnsResizer :th="$refs.th" v-if="isMounted" :table="$refs.table" data="rbar" :cols="cols" /> --> 
      <TimelineHeader />
      <div class="row header" :style="{ gridTemplateColumns: gridColumns() }">
        <template v-for="(col, key) in cols" :key="key">
          <div class="col" ref="thRefs" :style="colStyle(col, 1, key)" :data-row="0" :data-col="key + 1" :class="cellClass(0, key + 1, col)" v-if="col.show">
            <div class="cell" >
              <component :is="resolveComponent(col.cp)" :col="col" v-if="resolveComponent(col.cp)"></component>            </div>
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
      <TreeTime :row="root" :depth="''"  :weeks="weeks" :days="days" :firstDay="firstDay"  :level="0" :cols="cols" :gridStyle="{ gridTemplateColumns: gridColumns()  }" v-if="root"></TreeTime>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useConfigStore } from '@/stores/config';
import { useDataRowsStore } from '@/stores/dataRows';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import TimelineHeader from '@/components/TimelineHeader.vue';
import ColTitle from '@/components/ColTitle.vue';
import ColDropText from '@/components/ColDropText.vue';
import ColDate from '@/components/ColDate.vue';
import ColumnsResizer from '@/components/ColumnsResizer.vue';
import ColSeq from '@/components/ColSeq.vue';
import { useTableComposable } from '@/components/useTableComposable';
import TreeTime from '@/components/treelist/TreeTime.vue';

import { useTreeRowsStore } from '@/stores/treeRows';
import { useDrapDropComposable } from '@/components/useTreeDrapDropComposable';


        
const treeRowsStore = useTreeRowsStore();

// Composable
const {
  dragOver, handleMouseDown, handleMouseCellsMove, handleMouseUp,
  cellClass, getCacWidth, handleKeyDown, selectRowSch, selectStartRef,
  calculateDaysBetweenDates, isDrag, dragstart, drop, curRowIndex,
  moveType, dragMode, dblclickHandle, inDragRang, weeks
} = useTableComposable();

// Reactive state
const isMounted = ref(false);
const showMoveOverLayer = ref(false);
const showDatePicker = ref(false);
const isMouseDown = ref(0);
const selectRowStart = ref(-1);
const selectRowEnd = ref(-1);
const selectCol = ref(null);
const table = ref(null);
const th = ref(null);
const root = ref(null);

// Store data
const configStore = useConfigStore();
const dataRowsStore = useDataRowsStore();
const config = ref(configStore.config);
const flatRows = ref(dataRowsStore.flatRows);
const selectRowsIndex = ref(dataRowsStore.selectRowsIndex);

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

// Holidays data
const holidays = reactive([
  { date: '2025-01-01', n: 20250101, name: 'New Year\'s Day' },
  { date: '2025-01-29', n: 20250129, name: 'Lunar New Year\'s Day' },
  { date: '2025-01-30', n: 20250130, name: 'Lunar New Year Holiday' },
  { date: '2025-01-31', n: 20250131, name: 'Lunar New Year Holiday' },
  { date: 'configStore.config.startDate', n: 20250201, name: 'Lunar New Year Holiday' },
  { date: '2025-02-02', n: 20250202, name: 'Lunar New Year Holiday' },
  { date: '2025-04-04', n: 20250404, name: 'Ching Ming Festival' },
  { date: '2025-04-18', n: 20250418, name: 'Good Friday' },
  { date: '2025-04-19', n: 20250419, name: 'Holy Saturday' },
  { date: '2025-04-21', n: 20250421, name: 'Easter Monday' },
  { date: '2025-05-01', n: 20250501, name: 'Labour Day' },
  { date: '2025-05-30', n: 20250530, name: 'Tuen Ng Festival' },
  { date: '2025-07-01', n: 20250701, name: 'Hong Kong Special Administrative Region Establishment Day' },
  { date: '2025-09-29', n: 20250929, name: 'National Day' },
  { date: '2025-10-01', n: 20251001, name: 'National Day Holiday' },
  { date: '2025-10-14', n: 20251014, name: 'Chung Yeung Festival' },
  { date: '2025-12-25', n: 20251225, name: 'Christmas Day' },
  { date: '2025-12-26', n: 20251226, name: 'Boxing Day' }
]);


// Methods
const isBetween = (a, b, c) => {
  return (a <= c && c <= b) || (b <= c && c <= a);
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

const gridColumns = () => {
  return cols.value.map(e => e.width + 'px').join(' ') + ' 1fr';
};

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

const isWeekend = (date) => {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
};

const getDateAsInteger = (dateObj) => {
  let year = dateObj.getFullYear();
  let month = String(dateObj.getMonth() + 1).padStart(2, '0');
  let day = String(dateObj.getDate()).padStart(2, '0');
  return parseInt(`${year}${month}${day}`, 10);
};

const isToday = (date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const formatDate = (date, format) => {
  return date.toLocaleDateString("en-US", { ...format });
};

const getDatesBetween = (startDate, endDate, weekIndex) => {
  const dates = [];
  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);
  let i = 0;
  while (currentDate <= lastDate) {
    let n = getDateAsInteger(currentDate);
    let holiday = holidays.filter(e => e.n == n);
    let dateWrap = {
      date: new Date(currentDate),
      n: n,
      i: weekIndex * 7 + i++,
      isCur: isToday(currentDate),
      isWeekend: isWeekend(currentDate),
      label: formatDate(currentDate, { day: "2-digit" }),
      holiday: holiday.length && holiday[0]
    };
    dates.push(dateWrap);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};

const generateWeeks = (startDate, n) => {
  const weeks1 = [];
  let startOfWeek = new Date(startDate);
  const startDayOfWeek = (startOfWeek.getDay() + 6) % 7;
  startOfWeek.setDate(startOfWeek.getDate() - startDayOfWeek);

  for (let i = 0; i < n; i++) {
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    weeks1.push({
      start: new Date(startOfWeek),
      end: new Date(endOfWeek),
      i: i,
      startn: getDateAsInteger(startOfWeek),
      endn: getDateAsInteger(endOfWeek),
      label: formatDate(startOfWeek, {
        month: "short",
        year: "2-digit",
      }),
      dates: getDatesBetween(startOfWeek, endOfWeek, i)
    });

    startOfWeek.setDate(startOfWeek.getDate() + 7);
  }

  return weeks1;
};

// Watchers
watch(
  () => config.value.startDate,
  () => {
    weeks.length = 0;
    weeks.push(...generateWeeks(config.value.startDate, config.value.weekCount));
  }
);

watch(
  () => config.value.weekCount,
  () => {
    weeks.length = 0;
    weeks.push(...generateWeeks(config.value.startDate, config.value.weekCount));
  }
);

// Lifecycle hooks
onMounted(() => {
  root.value = treeRowsStore.dataRows;

  nextTick(() => isMounted.value = true);
  document.addEventListener("keydown", handleKeyDown);
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleKeyDown);
});

if (!config.value.startDate) config.value.startDate = new Date();
  if (!config.value.weekCount) config.value.weekCount = 20;
  weeks.length = 0;
  weeks.push(...generateWeeks(config.value.startDate || new Date(), config.value.weekCount));
  
// Computed properties
const firstDay = computed(() => weeks[0].dates[0]);
const days = computed(() => config.value.weekCount * 7);
const cols = computed(() => config.value && config.value.cols ? config.value.cols.filter(e => e.show) : []);


</script>

<style src="@/components/grid.css" scoped></style>
<style scoped>
.selectStartRef.dragMode,
.dragMode {
  background-color: green !important;
}
.lock {
  color: red;
}
</style>