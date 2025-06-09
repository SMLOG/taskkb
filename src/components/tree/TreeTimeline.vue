<template>
  <div class="table-container relative"  :class="{ drag: isDragging, move: isMoving }">

    <DatePicker :config="configRef" />
    <div ref="tableRef" style="display: grid; grid-template-columns: 1fr;"  @mousedown.left="handleMouseDown"
      @dragstart="dragstart" @dragover="dragOver" @drop="drop" @mousemove="handleMouseCellsMove" 
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
        <div class="col select-none" :colspan="7 * weeksRef.length" v-if="configRef.showSch">
          <div class="flex flex-nowrap">
            <div v-for="(week, index) in weeksRef" :key="week" class="week-slot">
              <div>
                <span>{{ week.label }}</span><span>({{ week.i + 1 }})</span>
              </div>
              <div class="flex justify-between" >
                <span v-for="day in week.dates" :key="day" class="day" :class="getDayClasses(day, selectStartRef)">
                  {{ day.label }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <TreeTime :row="root" :depth="''" :showSch="configRef.showSch"  :weeks="weeksRef" :days="days" :firstDay="firstDay"  :level="0" :cols="cols" :gridStyle="{ gridTemplateColumns: gridColumns  }" v-if="root"></TreeTime>
    </div>
  </div>
</template>

<script setup>
import { ref,  computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import ColumnsResizer from '@/components/ColumnsResizer.vue';
import TreeTime from '@/components/tree/TreeTime.vue';
import DatePicker from '@/components/tree/DatePicker.vue';

import { useAppStore } from '@/stores/appStore';
import { useTree } from '@/composables/useTree';
import { generateWeeks,isBetween } from '@/lib/schedule';
import {resolveComponent} from '@/components/cpList';
import { storeToRefs } from 'pinia'

const tableRef = ref(null);
const thRefs = ref([]);
        
const appStore = useAppStore();

// Composable
const {
  dragOver, handleMouseDown, handleMouseCellsMove, handleMouseUp,
  cellClass,  handleKeyDown, selectStartRef,
   dragstart, drop, 
  moveType,  dblclickHandle,  weeksRef
} = useTree();



const root = ref(null);

const {configRef,treeRef,activeTabRef} = storeToRefs(appStore);


const colStyle = (col, index) => ({
  left: col.sticky ? `var(--sticky-left-${index})` : 'auto'
});

const updateWeeks=()=>{

  if (!configRef.value.startDate) configRef.value.startDate = new Date();
  if (!configRef.value.weekCount) configRef.value.weekCount = 20;
  weeksRef.value.length = 0;
  weeksRef.value.push(...generateWeeks(configRef.value.startDate, configRef.value.weekCount));
}


import { debounce } from 'lodash'; 

const debouncedUpdateWeeks = debounce(updateWeeks, 300);

watch(
  () => [configRef.value.startDate, configRef.value.weekCount],
  () => {
    debouncedUpdateWeeks();
  },
  { immediate: true }
);

watch(
  () => [activeTabRef?.value],
  () => {
    root.value = treeRef.value;
  },
  { immediate: true }
);

// Lifecycle hooks
onMounted(() => {
  root.value = treeRef.value;
  updateWeeks();
  document.addEventListener("keydown", handleKeyDown);

});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleKeyDown);
  debouncedUpdateWeeks.cancel(); // Clean up pending debounced calls
});


  
// Computed properties with enhanced readability and null checks
const firstDay = computed(() => weeksRef.value?.[0]?.dates?.[0] ?? null);
const days = computed(() => configRef.value?.weekCount ? configRef.value.weekCount * 7 : 0);
const cols = computed(() => configRef.value?.cols?.filter(col => col.show) ?? []);
const gridColumns = computed(() => cols.value.length > 0 ? cols.value.map(col => `${col.width}px`).join(' ') + ' 1fr' : '1fr');
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
