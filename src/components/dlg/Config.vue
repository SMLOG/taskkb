<template>
  <!-- Popup Modal -->
  <div>
    <div class="flex flex-col space-y-3 max-h-[90vh] overflow-y-auto min-h-0">
      <div
        class="sticky!important top-0 z-10 pb-4 border-b border-gray-200 dark:border-gray-700 flex justify-between bg-white dark:bg-gray-800">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Columns Configuration
        </h3>
        <button
          class="rounded bg-blue-500 px-3 py-1.5 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          @click="addCol">
          + Add Column
        </button>
      </div>

      <!-- Columns List -->
      <div class="space-y-3 max-h-[60vh] overflow-y-auto">
        <VueDraggable ref="el" v-model="cols" :animation="150" ghostClass="ghost">
          <div v-for="(col, index) in cols" :key="col.id"
            class="flex  gap-3 rounded-md p-3 mb-1 bg-gray-100 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex-col">
            <div class="flex items-center ">
              <div class="w-12 text-center text-gray-500 dark:text-gray-400">
                {{ index + 1 }}
              </div>
              <div class="w-20">
                <select v-model="col.cp"
                  class="w-full rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 text-sm py-1.5 focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400">
                  <option v-for="cp in cpList" :key="cp.type" :value="cp.type">
                    {{ cp.name }}
                  </option>
                </select>
              </div>
              <div class="min-w-[80px] flex-1">
                <input v-model="col.name"
                  class="w-full rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 text-sm py-1.5 focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                  placeholder="Column Name" />
              </div>
              <label class="flex items-center gap-1 text-sm text-gray-800 dark:text-gray-300">
                <input type="checkbox" v-model="col.sticky"
                  class="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400" />
                Sticky
              </label>
              <label class="flex items-center gap-1 text-sm text-gray-800 dark:text-gray-300">
                <input type="checkbox" v-model="col.show"
                  class="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400" />
                Show
              </label>
              <button class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                title="Click to delete this item." @click="showConfirmDelete(col, index)">
                x
              </button>
              <button @click="toggleShowColumnDetail(col)"
                class="flex items-center justify-center w-10 h-10 text-red-500 hover:font-bold   rounded-full transition-colors duration-200 bg-blue-100"
                style="border-radius: 50%;" aria-label="Open dropdown menu" aria-haspopup="true" aria-expanded="false">
                <svg class="w-5 h-5 transition-transform duration-200" focusable="false" viewBox="0 0 24 24"
                  :class="{ 'rotate-180': showColumnsDetail.includes(col) }" xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true">
                  <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"></path>
                </svg>
              </button>
            </div>
            <div>

              <div class="flex" v-if="showColumnsDetail.includes(col)">

                <div class="flex gap-2 flex-col flex-1">
                  <div v-if="col.cp === 'ColDropText'">
                    <input v-model="col.options"
                      class="w-full rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 text-sm py-1.5 focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                      placeholder="Drop down options, separate by [,]" />
                  </div>

                </div>


              </div>
            </div>
          </div>

        </VueDraggable>
      </div>

      <MiscConfig />
    </div>

    <!-- Confirmation Dialog -->

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { cpList } from "@/components/cpList";
import { v4 as uuidv4 } from "uuid";
import { useAppStore } from "@/stores/appStore";
import { debounce } from "lodash";
import { VueDraggable } from "vue-draggable-plus";
import { showDialog } from "@/composables/useSystem";
import Description from "./Description.vue";
import RemoveCol from "./RemoveCol.vue";
import MiscConfig from './MiscConfig.vue';

// Interfaces
interface Column {
  id: string;
  cp: string;
  width: number;
  name: string;
  fn: number;
  show: boolean;
  sticky?: boolean;
  options?: string;
}

const emit = defineEmits(["confirm", "cancel"]);



const appStore = useAppStore();

// Computed properties
const cols = ref(appStore.configRef?.cols);
const config = computed(() => appStore.configRef);

const showColumnsDetail = ref([]);

function toggleShowColumnDetail(col) {
  let index = showColumnsDetail.value.indexOf(col);
  if (index > -1) showColumnsDetail.value.splice(index, 1);
  else showColumnsDetail.value.push(col);
}



watch(
  () => cols.value,
  (newCols) => {
    config.value.cols = newCols;
  },
  { immediate: true }
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
  });
};

const showConfirmDelete = async (col: Column, index: number) => {
  await showDialog(RemoveCol, { col });
  let colIndex = cols.value.indexOf(col);
  if (colIndex > -1) cols.value.splice(colIndex, 1);
};


</script>

<style scoped>
@import "@/assets/main.css";

.config-container {
  max-width: 1200px;
}

/* Ensure inputs, selects, and checkboxes have consistent styling */
input[type="text"],
select,
input[type="checkbox"] {
  transition: all 0.2s ease-in-out;
}

input[type="text"] {
  @apply rounded border-gray-500;
}

/* Add hover effects for draggable items */
[draggable="true"]:hover {
  cursor: move;
}

/* Smooth transition for popup appearance */
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