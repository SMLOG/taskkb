<template>
    <div class="row grid min-h-7" :data-weeks="1" @mousedown="handleClick" :class="{ cur:isCurrentRow(),selected: selectDepths.indexOf(depth) > -1 ,nochilds:!row._childs||!row._childs.length,collapsed:row._collapsed,hasChild: row._childs && row._childs.length}" :data-depth="depth" :data-level="level" v-if="depth !== ''"
        :draggable="isDrag" :style="gridStyle" >
        <template v-for="(col, cellIndex) in cols" :key="cellIndex">
                <Cell :row="row" :col="col" :level="level" :cellIndex="cellIndex" :index="id" :depth="depth" ></Cell>
        </template>
        <ScheduleCol :row="row" :days="days" :firstDay="firstDay" :showSch="showSch" :weeks="weeksRef"  />
        <div class="drag-handle" v-if="selectDepths.indexOf(depth) > -1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                <circle cx="6" cy="6" r="2" fill="currentColor"></circle>
                <circle cx="12" cy="6" r="2" fill="currentColor"></circle>
                <circle cx="18" cy="6" r="2" fill="currentColor"></circle>
                <circle cx="6" cy="12" r="2" fill="currentColor"></circle>
                <circle cx="12" cy="12" r="2" fill="currentColor"></circle>
                <circle cx="18" cy="12" r="2" fill="currentColor"></circle>
              </svg>
        </div>
    </div>
    <template v-if="row && row._childs && row._childs.length && !row._collapsed">
        <TreeTime v-for="(child, index) in row._childs" :depth="depth + '.' + index" :key="index" :row="child"
            :cols="cols" :showSch="showSch" :days="days" :firstDay="firstDay" :level="level + 1" :id="(id ? id + '.' : '') + (index + 1)" :gridStyle="gridStyle" :weeks="weeksRef" />
    </template>
</template>

<script setup>
import { defineProps } from 'vue';
import TreeTime from '@/components/tree/TreeTime.vue';
import Cell from '@/components/tree/Cell.vue';
import ScheduleCol from '@/components/tree/ScheduleCol.vue';
import { useCurrentRowStore } from '@/stores/currentRowStore'

import {isDrag,selectDepths,weeksRef} from "@/composables/context";



// Define props
const props = defineProps({
    row: {
        type: Object,
        required: true,
    },
    cols: {
        type: Array,
        required: true,
    },
    depth: {
        type: String,
        required: true,
    },
    gridStyle: {
        type: Object
    },
    level: {
        type: Number,
        required: true
    },
    id: {
        type: String,
        default: ''
    },
    weeks: {
        type: Array,
    },
    days: {
    },
    firstDay: {
    },
    showSch: {
        type: Boolean,
        default: false
    },  schReady: {
    type: Boolean,
  },
});



const currentRowStore = useCurrentRowStore()

function handleClick(){
    currentRowStore.setCurrentRow(props.row);
}
function isCurrentRow(){
    return   currentRowStore.isCurrentRow(props.row);
}

</script>

<style src="@/components/tree/tree.css" scoped></style>
<style scoped>
.drag-handle{
    position: absolute;
    top: 0;
    left: 3px;
    z-index: 11;
    top: 50%;
    transform: translateY(-50%);
}
</style>