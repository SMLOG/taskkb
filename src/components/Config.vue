<template>
  <div class="config-container mx-4 rounded-lg border-2 border-gray-300 bg-white p-6 shadow-sm">
    <!-- Columns Header -->
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-700">Columns Configuration</h3>
      <button
        class="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
        @click="addCol"
      >
        + Add Column
      </button>
    </div>

    <!-- Columns List -->
    <div class="space-y-3">
      <div
        v-for="(col, index) in cols"
        :key="index"
        class="flex items-center gap-3 rounded-md bg-gray-50 p-3 hover:bg-gray-100"
        draggable="true"
        @dragstart="dragstart($event, col, index)"
        @dragover.prevent="dragOver"
        @drop="drop($event, col, index)"
      >
        <div class="w-12 text-center text-gray-500">{{ index + 1 }}</div>
        <div class="w-32">
          <select
            v-model="col.cp"
            class="w-full rounded border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option v-for="cp in cpList" :key="cp" :value="cp">{{ cp }}</option>
          </select>
        </div>
        <div class="flex-1 min-w-[200px]">
          <input
            v-model="col.name"
            class="w-full rounded border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Column Name"
          />
        </div>
        <div v-if="col.cp === 'ColDropText'" class="flex-1">
          <input
            v-model="col.options"
            class="w-full rounded border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Options"
          />
        </div>
        <div class="flex items-center gap-2">
          <label class="flex items-center gap-1 text-sm">
            <input type="checkbox" v-model="col.sticky" class="rounded" />
            Sticky
          </label>
          <label class="flex items-center gap-1 text-sm">
            <input type="checkbox" v-model="col.show" class="rounded" />
            Show
          </label>
          <label class="flex items-center gap-1 text-sm">
            <input type="checkbox" v-model="col.group" class="rounded" />
            Group
          </label>
          <label class="flex items-center gap-1 text-sm">
            <input type="checkbox" v-model="col.formula" class="rounded" />
            Formula
          </label>
        </div>
        <button
          class="text-red-500 hover:text-red-700"
          @click="delCol(col, index)"
        >
          Remove
        </button>
      </div>
    </div>

    <!-- General Settings -->
    <div class="mt-6 flex gap-6">
      <label class="flex items-center gap-2 text-sm">
        <input type="checkbox" v-model="config.showSch" class="rounded" />
        Show Schedule
      </label>
      <label class="flex items-center gap-2 text-sm">
        <input type="checkbox" v-model="config.autoSave" class="rounded" />
        Auto Save
      </label>
      <label class="flex items-center gap-2 text-sm">
        <input type="checkbox" v-model="config.fix" class="rounded" />
        Fix
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// Interfaces
interface Column {
  field: Record<string, any>;
  cp: string;
  width: number;
  name: string;
  fn: number;
  show: boolean;
  sticky?: boolean;
  group?: boolean;
  formula?: boolean;
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
}>();

// Reactive state
const cpList = ref<string[]>(['ColTitle', 'ColDropText', 'ColDate', 'Time', 'ColSeq']);
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
    sticky: false,
    group: false,
    formula: false,
  });
};

const delCol = (col: Column, index: number) => {
  cols.value.splice(index, 1);
};
</script>

<style scoped>
.config-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Ensure inputs and selects have consistent styling */
input[type="text"],
select {
  transition: all 0.2s ease-in-out;
}

/* Add hover effects for draggable items */
[draggable="true"]:hover {
  cursor: move;
}
</style>