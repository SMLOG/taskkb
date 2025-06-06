<template>
  <div class="table-container relative"  :class="{ drag: isDragging, move: isMoving }">

    <DatePicker :config="configRef" />
    <div ref="tableRef" style="display: grid; grid-template-columns: 1fr;"  @mousedown.left="handleMouseDown"
      @dragstart="dragstart" @dragover="dragOver" @drop="drop" @mousemove="handleMouseCellsMove" @click="handleClick"
      @mouseup.left="handleMouseUp" @dblclick="dblclickHandle">
      <ColumnsResizer :th="thRefs" v-if="thRefs.length" data="rbar" :table="tableRef" :cols="cols" :showSch="configRef.showSch" />
      <div class="row header bg-white dark:bg-black" :style="{ gridTemplateColumns: gridColumns }">
        <template v-for="(col, key) in cols" :key="key">
          <div class="col" ref="thRefs" :style="colStyle(col,  key)" :data-row="0" :data-col="key + 1" :class="cellClass(col)" v-if="col.show">
            <div class="cell flex" >
              <component :is="resolveComponent(col.cp)" :col="col" v-if="resolveComponent(col.cp)"></component>
            </div>
          </div>
        </template>
        <div class="col" :colspan="7 * weeksValue.length" style="user-select: none;" v-if="configRef.showSch">
          <div style="display: flex; flex-wrap: nowrap">
            <div v-for="(week, index) in weeksValue" :key="week" class="week-slot">
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
      <TreeTime :row="root" :depth="''" :showSch="configRef.showSch"  :weeks="weeksValue" :days="days" :firstDay="firstDay"  :level="0" :cols="cols" :gridStyle="{ gridTemplateColumns: gridColumns  }" v-if="root"></TreeTime>
    </div>
  </div>
</template>

<script setup>
import { ref,  computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import ColumnsResizer from '@/components/ColumnsResizer.vue';
import TreeTime from '@/components/tree/TreeTime.vue';
import DatePicker from '@/components/tree/DatePicker.vue';

import { useTreeStore } from '@/stores/tree';
import { useTree } from '@/composables/useTree';
import { generateWeeks,isBetween } from '@/lib/schedule';
import {resolveComponent} from '@/components/cpList';

const tableRef = ref(null);
const thRefs = ref([]);
        
const treeStore = useTreeStore();

// Composable
const {
  dragOver, handleMouseDown, handleMouseCellsMove, handleMouseUp,
  cellClass,  handleKeyDown, selectStartRef,
   dragstart, drop, 
  moveType,  dblclickHandle,  weeksValue
} = useTree();



const root = ref(null);

// Store data
const configRef = ref(treeStore.configRef);


const colStyle = (col, index) => ({
  left: col.sticky ? `var(--sticky-left-${index})` : 'auto'
});



watch(
  () => configRef.value.startDate,
  () => {
    weeksValue.length = 0;
    weeksValue.push(...generateWeeks(configRef.value.startDate, configRef.value.weekCount));
  }
);

watch(
  () => configRef.value.weekCount,
  () => {
    weeksValue.length = 0;
    weeksValue.push(...generateWeeks(configRef.value.startDate, configRef.value.weekCount));
  }
);

// Lifecycle hooks
onMounted(() => {
  root.value = treeStore.treeRef;
  document.addEventListener("keydown", handleKeyDown);
  if (!configRef.value.startDate) configRef.value.startDate = new Date();
  if (!configRef.value.weekCount) configRef.value.weekCount = 20;
  weeksValue.length = 0;
  weeksValue.push(...generateWeeks(configRef.value.startDate || new Date(), configRef.value.weekCount));

});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleKeyDown);
});


  
// Computed properties
const firstDay = computed(() => weeksValue[0].dates[0]);
const days = computed(() => configRef.value.weekCount * 7);
const cols = computed(() => configRef.value && configRef.value.cols ? configRef.value.cols.filter(e => e.show) : []);
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

<style src="@/components/tree/tree.css" scoped></style>
