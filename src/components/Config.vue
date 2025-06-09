<template>
  <!-- Popup Modal -->
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center"
    @click.self="close()">
    <button class="absolute right-4 top-4 text-gray-600 hover:text-gray-800 dark:text-gray-200 dark:hover:text-white" @click="close()">
      <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
    <div
      class="relative mx-4 max-h-[80vh] w-full max-w-3xl overflow-y-auto rounded-lg border-2 border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 shadow-lg">
        
      <div class="flex flex-col h-full min-h-0">
        <div class="sticky top-0 z-10 pb-4 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between bg-white dark:bg-gray-800">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Columns Configuration</h3>
          <button class="rounded bg-blue-500 px-3 py-1.5 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700" @click="addCol">
            + Add Column
          </button>
        </div>

        <!-- Columns List -->
        <div class="space-y-3 p-6">
          <div v-for="(col, index) in cols" :key="index"
            class="flex flex-wrap items-center gap-3 rounded-md p-3 hover:bg-gray-100 dark:hover:bg-gray-700">
            <div class="w-12 text-center text-gray-500 dark:text-gray-400" draggable="true" @dragstart="dragstart($event, col, index)" @dragover.prevent="dragOver" @drop="drop($event, col, index)">{{ index + 1 }}</div>
            <div class="w-20">
              <select v-model="col.cp"
                class="w-full rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 text-sm py-1.5 focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400">
                <option v-for="cp in cpList" :key="cp" :value="cp">{{ cp }}</option>
              </select>
            </div>
            <div class="min-w-[80px] flex-1">
              <input v-model="col.name"
                class="w-full rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 text-sm py-1.5 focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                placeholder="Column Name" />
            </div>

            <div class="flex gap-2 flex-col flex-1">
              <div v-if="col.cp === 'ColDropText'" >
              <input v-model="col.options"
                class="w-full rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 text-sm py-1.5 focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                placeholder="Drop down options,separate by [,]" />
            </div>
              <div class="flex">
                <label class="flex items-center gap-1 text-sm text-gray-800 dark:text-gray-300">
                <input type="checkbox" v-model="col.sticky" class="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400" />
                Sticky
              </label>
              <label class="flex items-center gap-1 text-sm text-gray-800 dark:text-gray-300">
                <input type="checkbox" v-model="col.show" class="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400" />
                Show
              </label>
              </div>


            </div>
            <button class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" title="Click to delete this item." @click="delCol(col, index)">
              x
            </button>
          </div>
        </div>

        <!-- General Settings -->
        <div class="mt-6 flex gap-6 sticky bottom-0 p-6 bg-white dark:bg-gray-800">
          <label class="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-300">
            <input type="checkbox" v-model="config.showSch" class="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400" />
            Show Schedule
          </label>
          <label class="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-300">
            <input type="checkbox" v-model="config.autoSave" class="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400" />
            Auto Save
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { cpList } from '@/components/cpList';

// Interfaces
interface Column {
  field: Record<string, any>;
  cp: string;
  width: number;
  name: string;
  fn: number;
  show: boolean;
  sticky?: boolean;

  options?: string;
}

interface Config {
  cols: Column[];
  showSch: boolean;
  autoSave: boolean;
  fix: boolean;
}

// Props
const props = defineProps<{
  config: Config;
  isOpen: Boolean,
  close: Function
}>();

// Reactive state
const dragStartIndex = ref<number | null>(null);

// Computed properties
const cols = computed(() => props.config.cols);

// Methods
const dragstart = (event: DragEvent, row: Column, index: number) => {
  dragStartIndex.value = index;
};

const dragOver = (event: DragEvent) => {
  event.preventDefault();
};

const drop = (event: DragEvent, row: Column, endIndex: number) => {
  if (dragStartIndex.value === null) return;

  const startIndex = dragStartIndex.value;
  const startRow = cols.value.splice(startIndex, 1)[0];
  const adjustedEndIndex = endIndex > startIndex ? endIndex - 1 : endIndex;
  const endRow = cols.value.splice(adjustedEndIndex, 1, startRow)[0];
  cols.value.splice(startIndex, 0, endRow);
  dragStartIndex.value = null;
};

const findMissingNumber = (list: number[]): number => {
  const sorted = [...list].sort((a, b) => a - b);
  let missingNumber = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i] !== missingNumber) break;
    missingNumber++;
  }
  return missingNumber;
};

const calculateTextWidth = (text: string): number => {
  const body = document.querySelector('body')!;
  const computedStyle = window.getComputedStyle(body);
  const font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  context.font = font;
  return context.measureText(text).width;
};

const addCol = () => {
  const nextCid = findMissingNumber(cols.value.map((e) => e.fn));
  const text = 'New Column';
  const width = calculateTextWidth(text + '  ');
  cols.value.push({
    field: {},
    cp: 'ColDropText',
    width,
    name: text,
    fn: nextCid,
    show: true,
    sticky: false
  });
};

const delCol = (col: Column, index: number) => {
  cols.value.splice(index, 1);
};
</script>

<style scoped>
.config-container {
  max-width: 1200px;
}

/* Ensure inputs, selects, and checkboxes have consistent styling */
input[type="text"],
select,
input[type="checkbox"] {
  transition: all 0.2s ease-in-out;
}

/* Add hover effects for draggable items */
[draggable="true"]:hover {
  cursor: move;
}

/* Smooth transition for popup appearance */
.fixed {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>