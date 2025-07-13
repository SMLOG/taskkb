<template>
  <!-- Popup Modal -->
  <div>
    <div class="flex flex-col space-y-3 max-h-[90vh] overflow-y-auto min-h-0">
      <div
        class="sticky!important top-0 z-10 pb-4 border-b border-gray-200 dark:border-gray-700 flex justify-between bg-white dark:bg-gray-800">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Columns Configuration
        </h3>
        <div class="flex items-center space-x-2">
          <button
            class="rounded bg-blue-500 px-3 py-1.5 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            @click="addCol">
            + Add Column
          </button>
        </div>
      </div>

      <!-- Columns List as Tree -->
      <div class="space-y-3 max-h-[60vh] overflow-y-auto">
        <div class="tree-container">
          <tree-node
            v-for="(col, index) in cols"
            :key="col.id"
            :node="col"
            :index="index"
            :depth="0"
            @add-child="addChild"
            @delete="showConfirmDelete"
            @toggle-detail="toggleShowColumnDetail"
          />
        </div>
      </div>

      <MiscConfig />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { cpList } from "@/components/cpList";
import { v4 as uuidv4 } from "uuid";
import { useAppStore } from "@/stores/appStore";
import { showDialog } from "@/composables/useSystem";
import RemoveCol from "./RemoveCol.vue";
import MiscConfig from './MiscConfig.vue';
import TreeNode from './TreeNode.vue';

interface Column {
  id: string;
  cp: string;
  width: number;
  name: string;
  fn: number;
  show: boolean;
  sticky?: boolean;
  options?: string;
  children?: Column[];
}

const emit = defineEmits(["confirm", "cancel"]);
const appStore = useAppStore();

// Initialize cols with empty children array if not present
const cols = ref<Column[]>(appStore.configRef?.cols?.map(col => ({
  ...col,
  children: col.children || []
})) || []);

const config = computed(() => appStore.configRef);
const showColumnsDetail = ref<Column[]>([]);

function toggleShowColumnDetail(col: Column) {
  const index = showColumnsDetail.value.indexOf(col);
  if (index > -1) showColumnsDetail.value.splice(index, 1);
  else showColumnsDetail.value.push(col);
}

watch(
  () => cols.value,
  (newCols) => {
    config.value.cols = newCols;
  },
  { immediate: true, deep: true }
);

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
  const body = document.querySelector("body")!;
  const computedStyle = window.getComputedStyle(body);
  const font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d")!;
  context.font = font;
  return Math.ceil(context.measureText(text).width);
};

const addCol = () => {
  const nextCid = findMissingNumber(cols.value.map((e) => e.fn));
  const text = "New Column";
  const width = calculateTextWidth(text + "  ");
  cols.value.push({
    id: uuidv4(),
    cp: "ColDropText",
    width,
    name: text,
    fn: nextCid,
    show: true,
    sticky: false,
    children: []
  });
};

const addChild = (parent: Column) => {
  const nextCid = findMissingNumber([
    ...cols.value.map(e => e.fn),
    ...(parent.children?.map(c => c.fn) || [])
  ]);
  const text = "New Child Column";
  const width = calculateTextWidth(text + "  ");
  
  if (!parent.children) {
    parent.children = [];
  }
  
  parent.children.push({
    id: uuidv4(),
    cp: "ColDropText",
    width,
    name: text,
    fn: nextCid,
    show: true,
    sticky: false,
    children: []
  });
};

const showConfirmDelete = async (col: Column, parentArray: Column[], index: number) => {
  await showDialog(RemoveCol, { col });
  const colIndex = parentArray.indexOf(col);
  if (colIndex > -1) parentArray.splice(colIndex, 1);
};
</script>

<style scoped>
@import "@/assets/main.css";

.config-container {
  max-width: 1200px;
}

.tree-container {
  padding-left: 0;
}

input[type="text"],
select,
input[type="checkbox"] {
  transition: all 0.2s ease-in-out;
}

input[type="text"] {
  @apply rounded border-gray-500;
}

[draggable="true"]:hover {
  cursor: move;
}

.fixed {
  animation: fadeIn 0.3s ease-in-out;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
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