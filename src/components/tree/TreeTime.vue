<template>
    <div class="row grid min-h-7" :data-weeks="1" :class="{ selected: selectDepths.indexOf(depth) > -1 }" :data-depth="depth" :data-level="level" v-if="depth !== ''"
        :draggable="isDrag" :style="gridStyle" >
        <template v-for="(col, cellIndex) in cols" :key="cellIndex">
                <Cell :row="row" :col="col" :level="level" :cellIndex="cellIndex" :index="id" :depth="depth" ></Cell>
        </template>
        <ScheduleCol :row="row" :days="days" :firstDay="firstDay" :showSch="showSch" :weeks="weeksRef"  />
    </div>
    <template v-if="row && row._childs && row._childs.length && !row._collapsed">
        <TreeTime v-for="(child, index) in row._childs" :depth="depth + '.' + index" :key="index" :row="child"
            :cols="cols" :showSch="showSch" :days="days" :firstDay="firstDay" :level="level + 1" :id="(id ? id + '.' : '') + (index + 1)" :gridStyle="gridStyle" :weeks="weeksRef" />
    </template>
</template>

<script setup>
import { useTree } from '@/composables/useTree';
import { defineProps, watch } from 'vue';
import TreeTime from '@/components/tree/TreeTime.vue';
import Cell from '@/components/tree/Cell.vue';
import ScheduleCol from '@/components/tree/ScheduleCol.vue';
import { resolveComponent } from '@/components/cpList';

// Composable
const {
 weeksRef
} = useTree();

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

// Drag and drop composable
const { isDrag, selectDepths } = useTree();

// Column style function
const colStyle = (col, isH, index) => {
    let style = {};
    if (col.sticky) {
        style.left = `var(--sticky-left-${index})`;
    } else {
        style.left = 'auto';
    }
    return style;
};
</script>

<style src="@/components/tree/tree.css" scoped></style>