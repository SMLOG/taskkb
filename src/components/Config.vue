<template>
  <div class="config border border-gray-500 border-2 p-4 !m-4" >
    <div>
      <span>Columns</span> <a @click="addCol()">+</a>
    </div>
    <div>
      <div v-for="(col, i) in cols" :key="i" style="display: flex;" @dragover="dragOver" @drop="drop($event, col, i)">
        <div style="width:46px;text-align: center;" :draggable="true" @dragstart="dragstart($event, col, i)">{{ i + 1 }}
        </div>
        <div style="width:100px"> <select v-model="col.cp">
            <option v-for="cp in cpList">{{ cp }}</option>
          </select> </div>
        <div> <input v-model="col.name" /></div>
        <div v-if="col.cp == 'ColDropText'">
          Options:<input v-model="col.options" />
        </div>
        <div style="width:60px;margin-left: 10px;">Sticky <input type="checkbox" v-model="col.sticky" /></div>
        <div style="width:60px;margin-left: 10px;">Show <input type="checkbox" v-model="col.show" /></div>
        <div style="width:60px;margin-left: 10px;">Group <input type="checkbox" v-model="col.group" /></div>
        <div style="width:80px;margin-left: 10px;">Formula <input type="checkbox" v-model="col.group" /></div>
        <div><a @click="delCol(col, i)">Remove</a></div>
      </div>
    </div>

    <div style="display: flex;">
      <div>show shedule: <input type="checkbox" v-model="config.showSch" /></div>
      <div>Auto Save: <input type="checkbox" v-model="config.autoSave" /></div>
      <div>Fix: <input type="checkbox" v-model="config.fix" /></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// Props
const props = defineProps({
  config: {
    type: Object,
    required: true,
  },
});

// Reactive state
const cpList = ref(["ColTitle", "ColDropText", "ColDate", "Time", "ColSeq"]);
const dragStartIndex = ref(null);

// Computed properties
const cols = computed(() => props.config.cols);

// Methods
const dragstart = (event, row, i) => {
  dragStartIndex.value = i;
};

const dragOver = (event) => {
  event.preventDefault();
};

const drop = (event, row, endIndex) => {
  let startIndex = dragStartIndex.value;
  let startRow = cols.value.splice(startIndex, 1)[0];
  if (endIndex > startIndex) endIndex -= 1;
  let endRow = cols.value.splice(endIndex, 1, startRow)[0];
  cols.value.splice(startIndex, 0, endRow);
};

const findMissingNumber = (list) => {
  list.sort((a, b) => a - b);
  let missingNumber = 0;
  for (let i = 0; i < list.length; i++) {
    if (list[i] !== missingNumber) {
      break;
    }
    missingNumber++;
  }
  return missingNumber;
};

const calculateTextWidth = (text) => {
  const body = document.querySelector("body");
  const computedStyle = window.getComputedStyle(body);
  const font = computedStyle.fontSize + " " + computedStyle.fontFamily;
  const fontFamilies = font.split(",");
  let maxWidth = 0;

  for (let i = 0; i < fontFamilies.length; i++) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = fontFamilies[i];
    const metrics = context.measureText(text);
    const width = metrics.width;
    if (width > maxWidth) {
      maxWidth = width;
    }
  }
  return maxWidth;
};

const addCol = () => {
  let nextcid = findMissingNumber(cols.value.map(e => e.fn).sort());
  let text = "New Column";
  let width = calculateTextWidth(text + "  ");
  cols.value.push({ field: {}, cp: 'ColDropText', width: width, name: text, fn: nextcid, show: true });
};

const delCol = (col, i) => {
  cols.value.splice(i, 1);
};
</script>

<style>
/* Add styles here if needed */
</style>