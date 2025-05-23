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
    <div ref="tableRef" style="display: grid; grid-template-columns: 1fr;"  @mousedown.left="handleMouseDown"
      @dragstart="dragstart" @dragover="dragOver" @drop="drop" @mousemove="handleMouseCellsMove" @click="handleClick"
      @mouseup.left="handleMouseUp" @dblclick="dblclickHandle">
      <ColumnsResizer :th="thRefs" v-if="thRefs.length" data="rbar" :table="tableRef" :cols="cols" :showSch="config.showSch" />
      <TimelineHeader :cols="cols" :weeks="weeks" :showSch="config.showSch" :gridColumns="gridColumns"/>
      <div class="row header" :style="{ gridTemplateColumns: gridColumns }">
        <template v-for="(col, key) in cols" :key="key">
          <div class="col" ref="thRefs" :style="colStyle(col, 1, key)" :data-row="0" :data-col="key + 1" :class="cellClass(col)" v-if="col.show">
            <div class="cell" >
              <component :is="resolveComponent(col.cp)" :col="col" v-if="resolveComponent(col.cp)"></component>            </div>
          </div>
        </template>
        <div class="col" :colspan="7 * weeks.length" style="user-select: none;" v-if="config.showSch">
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
      <TreeTime :row="root" :depth="''" :showSch="config.showSch"  :weeks="weeks" :days="days" :firstDay="firstDay"  :level="0" :cols="cols" :gridStyle="{ gridTemplateColumns: gridColumns  }" v-if="root"></TreeTime>
    </div>
  </div>
</template>

<script setup>
import { ref,  computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useConfigStore } from '@/stores/config';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import TimelineHeader from '@/components/TimelineHeader.vue';
import ColTitle from '@/components/ColTitle.vue';
import ColDropText from '@/components/ColDropText.vue';
import ColDate from '@/components/ColDate.vue';
import ColumnsResizer from '@/components/ColumnsResizer.vue';
import ColSeq from '@/components/ColSeq.vue';
import TreeTime from '@/components/tree/TreeTime.vue';

import { useTreeRowsStore } from '@/stores/treeRows';
import { useTree } from '@/components/tree/useTree';
import { generateWeeks,isBetween } from '@/lib/schedule';

const tableRef = ref(null);
const thRefs = ref([]);
        
const treeRowsStore = useTreeRowsStore();

// Composable
const {
  dragOver, handleMouseDown, handleMouseCellsMove, handleMouseUp,
  cellClass,  handleKeyDown, selectStartRef,
   dragstart, drop, curRowIndex,
  moveType,  dblclickHandle,  weeks
} = useTree();

// Reactive state
const isMounted = ref(false);
const showMoveOverLayer = ref(false);
const showDatePicker = ref(false);

const root = ref(null);

// Store data
const configStore = useConfigStore();
const config = ref(configStore.config);

const componentMap = {
  ColTitle,
  ColDropText,
  ColDate,
  ColSeq,
};
const resolveComponent = (cp) => {
  return componentMap[cp] || null; 
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



const isCollapsed = (row) => {
  if (row && row._p) {
    if (row._p._collapsed) return true;
    return isCollapsed(row._p);
  }
  return false;
};

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
const gridColumns = computed(() => cols.value.map(e => `${e.width}px`).join(' ') + ' 1fr');

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