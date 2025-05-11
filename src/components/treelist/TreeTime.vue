<template>
    <div class="row grid" :data-weeks="1" :class="{ selected: selectDepths.indexOf(depth) > -1 }" :data-depth="depth" v-if="depth !== ''"
        :draggable="isDrag" :style="gridStyle" @dragstart="dragstart" @dragover="dragOver" @drop="drop">
        <template v-for="(col, cellIndex) in cols" :key="cellIndex">
            <component v-if="col.cp === 'ColSeq'" class="col td" :is="resolveComponent(col.cp)" :row="row" :col="col"
                :class="{ sticky: col.sticky }" :style="colStyle(col, 1, cellIndex)" :index="id">


            </component>
            <div v-else class="col td" :class="{ sticky: col.sticky }" :style="colStyle(col, 1, cellIndex)">
                <div class="cell">
                    <component :is="resolveComponent(col.cp)" :row="row" :col="col" :level="level">
                    </component>
                </div>
            </div>
        </template>
        <div class="col" :colspan="7 * weeks.length">
            <div style="display: flex; flex-wrap: nowrap" class="sch">
                <div :style="{ width: 1 / days * 100 + '%' }" style="position: relative;">
                    <div v-if="row._tl && row._tl.end" :style="{
                        width: (calculateDaysBetweenDates(row._tl.end, row._tl.start)) * 100 + '%',
                        marginLeft: (calculateDaysBetweenDates(row._tl.start, firstDay) - 1) * 100 + '%'
                    }" class="plantime" @click="selectRowSch(row, $event)"
                        :class="{ dragMode: dragMode  }">{{
                            calculateDaysBetweenDates(row._tl.end,
                                row._tl.start, true)
                        }}d
                    </div>
                    <div v-if="selectStartRef && selectStartRef.row == row" @dblclick="dragMode = !dragMode" :style="{
                        width: getCacWidth(),
                        marginLeft: (calculateDaysBetweenDates(selectStartRef.start.n < selectStartRef.end.n ? selectStartRef.start : selectStartRef.end, firstDay) - 1) * 100 + '%'
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
            :cols="cols" :level="level + 1" :id="(id ? id + '.' : '') + (index + 1)" :gridStyle="gridStyle" :weeks="weeks" />
    </template>
</template>

<script setup>
import { useDrapDropComposable } from '@/components/treelist/useTreeDrapDropComposable';
import ColTitle from '@/components/ColTitle.vue';
import ColDropText from '@/components/ColDropText.vue';
import ColDate from '@/components/ColDate.vue';
import ColSeq from '@/components/ColSeq.vue';
import { defineProps } from 'vue';
import TreeTime from '@/components/treelist/TreeTime.vue';
import { useTreeComposable } from './useTreeComposable';
// Composable
const {
  cellClass, getCacWidth, handleKeyDown, selectRowSch, selectStartRef,
  calculateDaysBetweenDates, 
  moveType, dragMode, dblclickHandle, inDragRang, weeks
} = useTreeComposable();

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
});

// Drag and drop composable
const { dragOver, dragstart, drop, isDrag, selectDepths } = useDrapDropComposable();

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

const componentMap = {
    ColTitle,
    ColDropText,
    ColDate,
    ColSeq,
};
// Resolve component dynamically
const resolveComponent = (cp) => {
    return componentMap[cp] || null; // Fallback to null if component not found
};

</script>

<style src="@/components/tree.css" scoped></style>@/components/treelist/useTreeDrapDropComposable