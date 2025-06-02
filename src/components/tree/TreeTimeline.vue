<template>
  <div class="table-container" style="position: relative;" :class="{ drag: isDragging, move: isMoving }">

    <DatePicker :config="config" />
    <div ref="tableRef" style="display: grid; grid-template-columns: 1fr;"  @mousedown.left="handleMouseDown"
      @dragstart="dragstart" @dragover="dragOver" @drop="drop" @mousemove="handleMouseCellsMove" @click="handleClick"
      @mouseup.left="handleMouseUp" @dblclick="dblclickHandle">
      <ColumnsResizer :th="thRefs" v-if="thRefs.length" data="rbar" :table="tableRef" :cols="cols" :showSch="config.showSch" />
      <TimelineHeader :cols="cols" :weeks="weeks" :showSch="config.showSch" :gridColumns="gridColumns"/>
      <div class="row header bg-white dark:bg-black" :style="{ gridTemplateColumns: gridColumns }">
        <template v-for="(col, key) in cols" :key="key">
          <div class="col" ref="thRefs" :style="colStyle(col,  key)" :data-row="0" :data-col="key + 1" :class="cellClass(col)" v-if="col.show">
            <div class="cell flex" >
              <component :is="resolveComponent(col.cp)" :col="col" v-if="resolveComponent(col.cp)"></component>
            </div>
          </div>
        </template>
        <div class="col" :colspan="7 * weeks.length" style="user-select: none;" v-if="config.showSch">
          <div style="display: flex; flex-wrap: nowrap">
            <div v-for="(week, index) in weeks" :key="week" class="week-slot">
              <div>
                <span>{{ week.label }}</span><span>({{ week.i + 1 }})</span>
              </div>
              <div style="display: flex; justify-content: space-between">
                <span v-for="day in week.dates" :key="day" class="day" :class="getDayClasses(day, selectStartRef)">
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
import TimelineHeader from '@/components/TimelineHeader.vue';
import ColumnsResizer from '@/components/ColumnsResizer.vue';
import TreeTime from '@/components/tree/TreeTime.vue';
import DatePicker from '@/components/tree/DatePicker.vue';

import { useTreeRowsStore } from '@/stores/treeRows';
import { useTree } from '@/components/tree/useTree';
import { generateWeeks,isBetween } from '@/lib/schedule';
import {resolveComponent} from '@/components/cpList';

const tableRef = ref(null);
const thRefs = ref([]);
        
const treeRowsStore = useTreeRowsStore();

// Composable
const {
  dragOver, handleMouseDown, handleMouseCellsMove, handleMouseUp,
  cellClass,  handleKeyDown, selectStartRef,
   dragstart, drop, 
  moveType,  dblclickHandle,  weeks
} = useTree();



const root = ref(null);

// Store data
const configStore = useConfigStore();
const config = ref(configStore.config);


const colStyle = (col, index) => ({
  left: col.sticky ? `var(--sticky-left-${index})` : 'auto'
});



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
  document.addEventListener("keydown", handleKeyDown);
  if (!config.value.startDate) config.value.startDate = new Date();
  if (!config.value.weekCount) config.value.weekCount = 20;
  weeks.length = 0;
  weeks.push(...generateWeeks(config.value.startDate || new Date(), config.value.weekCount));

});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleKeyDown);
});


  
// Computed properties
const firstDay = computed(() => weeks[0].dates[0]);
const days = computed(() => config.value.weekCount * 7);
const cols = computed(() => config.value && config.value.cols ? config.value.cols.filter(e => e.show) : []);
const gridColumns = computed(() => cols.value.map(e => `${e.width}px`).join(' ') + ' 1fr');
const isDragging = computed(() => moveType.value?.type === 'leftDrag' || moveType.value?.type === 'rightDrag');
const isMoving = computed(() => moveType.value?.type === 'move');
const getDayClasses = (day, selectStartRef) => ({
  selected: selectStartRef?.start && isBetween(selectStartRef.start.i, selectStartRef.end.i, day.i),
  today: day.isCur,
  weekend: day.isWeekend,
  holiday: day.holiday,
});
</script>

<style src="@/components/grid.css" scoped></style>
