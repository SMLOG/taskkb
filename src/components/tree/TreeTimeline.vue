<template>
  <div class="table-container relative min-w-full" :class="{ drag: isHDragging, move: isMoving, draging: isDraging }"
    @keydown.tab="handleTab" @keyup.enter="handleEnterKeyUp" v-if="activeTabRef > -1">
    <div ref="tableRef" style="display: grid; grid-template-columns: 1fr;">
      <ColumnsResizer  data="rbar" :table="tableRef" :cols="cols" :showSch="configRef?.showSch" />
      <div class="row header border-t bg-white dark:bg-black z-999" style="top:0">
        <div class="flex">
          <TreeColumn :columns="rootCols" :col-style="colStyle" :cell-class="cellClass"
            :resolve-component="resolveComponent" :i="0" />
        </div>
        <div class="flex">
          <WeekHeader v-if="schReadyRef" :weeks="weeksRef" :schReady="schReadyRef" :showSch="configRef?.showSch"
            :selectStartRef="selectStartRef" :config="configRef" />
        </div>
        <div></div>
      </div>
      <div  v-if="false" class="row header border-t bg-white dark:bg-black" :style="{ gridTemplateColumns: gridColumns }">
        <template v-for="(col, key) in cols" :key="key">
          <div class="col" ref="thRefs" :style="colStyle(col, key)" :data-row="0" :data-col="key + 1"
            :class="cellClass(col)" v-if="col.show">
            <div class="cell flex flex-1 px-1">
              <b class="w-full">
                <component :is="resolveComponent(col.cp)" :col="col" v-if="resolveComponent(col.cp)"></component>
              </b>
            </div>
          </div>
        </template>
        <WeekHeader v-if="schReadyRef" :weeks="weeksRef" :schReady="schReadyRef" :showSch="configRef?.showSch"
          :selectStartRef="selectStartRef" :config="configRef" />
      </div>

      <TreeTime :row="treeRef" :depth="''" :showSch="configRef?.showSch" :weeks="weeksRef" :days="days"
        :firstDay="firstDay" :level="0" :cols="cols" :gridStyle="{ gridTemplateColumns: gridColumns }"
        :schReady="schReadyRef" v-if="treeRef">
      </TreeTime>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import ColumnsResizer from '@/components/ColumnsResizer.vue';
import TreeTime from '@/components/tree/TreeTime.vue';
import WeekHeader from '@/components/tree/WeekHeader.vue'; // Import the new component
import { useAppStore } from '@/stores/appStore';
import { useSchedule } from '@/composables/useSchedule';
import { generateWeeks } from '@/lib/schedule';
import { resolveComponent } from '@/components/cpList';
import { storeToRefs } from 'pinia';
import { debounce } from 'lodash';
import { useRowDrag } from '@/composables/useRowDrag';
import { weeksRef, moveType, isDragging } from '@/composables/context';
import { useContextHandler } from '@/composables/useContextHandler';
import { useTree } from '@/composables/useTree';
import TreeColumn from './TreeColumn.vue';
const tableRef = ref(null);
const thRefs = ref([]);

const appStore = useAppStore();


const cellClass = (col) => {
  return {
    sticky: col.sticky,
  };
};

const {
  selectStartRef
} = useSchedule(tableRef);

useRowDrag(tableRef, { selectedClass: 'selected', filter: '.header', multiDrag: true, });
useContextHandler(tableRef);




const { configRef, treeRef, activeTabRef, schReadyRef } = storeToRefs(appStore);

const colStyle = (col, index) => ({
  left: col.sticky ? `var(--sticky-left-${index})` : 'auto',
});

const firstDay = ref(null);

const updateWeeks = () => {
  if (!configRef.value?.startDate) {
    configRef.value.startDate = new Date();
  }
  if (!configRef.value?.weekCount) {
    configRef.value.weekCount = 1;
  }
  weeksRef.value.length = 0;
  weeksRef.value.push(...generateWeeks(configRef.value.startDate, configRef.value.weekCount));
  firstDay.value = weeksRef.value?.[0]?.dates?.[0] ?? null;
};

const debouncedUpdateWeeks = debounce(updateWeeks, 300);

watch(
  () => [configRef.value?.startDate, configRef.value?.weekCount],
  () => {
    if (configRef.value?.startDate)
      debouncedUpdateWeeks();
  },
  { immediate: true }
);

watch(
  () => [activeTabRef.value, configRef.value?.showSch],
  () => {
    if (configRef.value?.showSch) updateWeeks();
    selectStartRef.value = null
    nextTick(() => {
      schReadyRef.value = true;
    })

  },
  { immediate: true }
);

onMounted(() => {
  appStore.loadActiveTab();

});

onBeforeUnmount(() => {
  debouncedUpdateWeeks.cancel();
});


const getLeafColumns = (columns) => {
  const result = [];

  const traverse = (cols) => {
    cols.forEach(col => {
      if (col.children && col.children.length > 0) {
        // If column has children, recursively process them
        traverse(col.children);
      } else if (col.show !== false) {
        // Only add if it's a leaf node (no children) and show is not false
        result.push(col);
      }
    });
  };

  if (columns) {
    traverse(columns);
  }

  return result;
};


const days = computed(() => (weeksRef.value ? weeksRef.value.length * 7 : 0));
const cols = computed(() => (getLeafColumns(configRef.value?.cols) ?? [])?.filter((col) => col.show) ?? []);
const rootCols = computed(() => (configRef.value?.cols ?? [])?.filter((col) => col.show) ?? []);

const gridColumns = computed(() =>
  cols.value.length > 0 ? cols.value.map((col) => `${col.width}px`).join(' ') + ' 1fr' : '1fr'
);
const isHDragging = computed(() => moveType.value?.type === 'leftDrag' || moveType.value?.type === 'rightDrag');
const isMoving = computed(() => moveType.value?.type === 'move');
const isDraging = computed(() => isDragging.value);

function handleTab(event) {
  event.preventDefault();
  if (event.target.tagName === 'DIV' && event.target.contentEditable === 'true') {
    let cellEl = event.target.closest(".col");
    let nextColEl = cellEl.nextElementSibling;

    if (nextColEl) {

      if (nextColEl) {
        const dblClickEvent = new MouseEvent('dblclick', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        nextColEl.querySelector('[contentEditable]').dispatchEvent(dblClickEvent);
      }
    }

    return;
  }

  return false;
}

const handleEnterKeyUp = async (event) => {
  if (event.target.tagName === 'DIV' && event.target.contentEditable === 'true') {
    let cellEl = event.target.closest(".col");
    let curRowEl = event.target.closest(".row");

    let nextRowEl = curRowEl.nextElementSibling;

    if (!nextRowEl) {
      useTree().insertNode({});
      await nextTick();
      nextRowEl = curRowEl.nextElementSibling;
    }

    if (nextRowEl) {
      let cellIndex = Array.from(curRowEl.children).indexOf(cellEl);
      let nextCellEl = nextRowEl.children[cellIndex];
      if (nextCellEl) {
        const dblClickEvent = new MouseEvent('dblclick', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        nextCellEl.querySelector('[contentEditable]').dispatchEvent(dblClickEvent);
      }
    }

    return;
  }
};
</script>

<style src="@/components/tree/tree.css" scoped></style>