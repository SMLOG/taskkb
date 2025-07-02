<template>
    <div class="card grid min-h-7" >
      <template v-for="(col, cellIndex) in cols" :key="cellIndex">
 
                <Cell :row="row" :col="col" :level="level" :cellIndex="cellIndex" :index="id" :depth="depth" ></Cell>
        </template>
    </div>
    <template v-if="row && row._childs && row._childs.length && !row._collapsed">
        <TreeCard v-for="(child, index) in row._childs" :depth="depth + '.' + index" :key="index" :row="child"
            :cols="cols" :showSch="showSch" :days="days" :firstDay="firstDay" :level="level + 1" :id="(id ? id + '.' : '') + (index + 1)" :gridStyle="gridStyle" :weeks="weeksRef" />
    </template>
</template>

<script setup>
import { useTree } from '@/composables/useTree';
import { defineProps } from 'vue';
import TreeCard from '@/components/tree/TreeCard.vue';
import Cell from '@/components/tree/Cell.vue';

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

</script>

<style src="@/components/tree/tree.css" scoped></style>