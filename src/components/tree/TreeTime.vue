<template>
    <div class="row grid" :data-weeks="1" :class="{ selected: selectDepths.indexOf(depth) > -1 }" :data-depth="depth" :data-level="level" v-if="depth !== ''"
        :draggable="isDrag" :style="gridStyle" >
        <template v-for="(col, cellIndex) in cols" :key="cellIndex">
            <div  class="col td flex" :class="{ sticky: col.sticky }" :style="colStyle(col, 1, cellIndex)">
                <div class="cell flex-1">
                    <component :is="resolveComponent(col.cp)" :row="row" :col="col" :level="level" :index="id">
                    </component>
                </div>
            </div>
        </template>
        <div class="col" :colspan="7 * weeksRef.length" v-if="showSch">
            <div style="display: flex; flex-wrap: nowrap" class="sch">
                <div :style="{ width: 1 / days * 100 + '%' }" style="position: relative;">
                    <div v-if="row._tl && row._tl.end" :style="{
                        width: (calculateDaysBetweenDates(row._tl.end, row._tl.start)) * 100 + '%',
                        marginLeft: (calculateDaysBetweenDates(row._tl.start, firstDay) - 1) * 100 + '%'
                    }" class="plantime"
                        :class="{ dragMode: dragMode  }">{{
                            calculateDaysBetweenDates(row._tl.end,
                                row._tl.start, true)
                        }}d
                    </div>
                    <div v-if="selectStartRef && selectStartRef.row == row" @dblclick="dragMode = !dragMode" :style="{
                        width: getCacWidth(),
                        marginLeft: calDiffDates(firstDay) * 100 + '%'
                    }" class="selectStartRef" :class="{ dragMode: dragMode }">{{
                    calculateDaysBetweenDates(selectStartRef.end,
                        selectStartRef.start, true)
                        }}d
                        <div class="leftDrag" @mousedown="isMouseDown = 1"></div>
                        <div class="rightDrag" @mousedown="isMouseDown = 1"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <template v-if="row && row._childs && row._childs.length && !row._collapsed">
        <TreeTime v-for="(child, index) in row._childs" :depth="depth + '.' + index" :key="index" :row="child"
            :cols="cols" :showSch="showSch" :days="days" :firstDay="firstDay" :level="level + 1" :id="(id ? id + '.' : '') + (index + 1)" :gridStyle="gridStyle" :weeks="weeksRef" />
    </template>
</template>

<script setup>
import { useTree } from '@/composables/useTree';
import { defineProps } from 'vue';
import TreeTime from '@/components/tree/TreeTime.vue';
import {resolveComponent} from '@/components/cpList';

// Composable
const {
  getCacWidth, selectStartRef,
  calculateDaysBetweenDates, 
   dragMode, weeksRef,calDiffDates
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
    }, id: {

    }, weeks: {},days:{},firstDay:{}
    ,showSch:{}
});

// Drag and drop composable
const {  isDrag, selectDepths } = useTree();

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