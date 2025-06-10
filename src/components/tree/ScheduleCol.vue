<template>
    <div class="col" v-if="showSch">
        <div style="display: flex; flex-wrap: nowrap" class="sch">
            <div :style="{ width: 1 / days * 100 + '%' }" style="position: relative;">
                <div v-if="row._tl && row._tl.end" :style="{
                    width: (calculateDaysBetweenDates(row._tl.end, row._tl.start)) * 100 + '%',
                    marginLeft: (calculateDaysBetweenDates(row._tl.start, firstDay) - 1) * 100 + '%'
                }" class="plantime"
                    :class="{ dragMode: dragMode }">{{
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
</template>

<script setup>
import { useTree } from '@/composables/useTree';
import { defineProps, ref } from 'vue';

// Composable
const {
    getCacWidth,
    selectStartRef,
    calculateDaysBetweenDates,
    dragMode,
    weeksRef: weeks,
    calDiffDates
} = useTree();

// Define props
const props = defineProps({
    row: {
        type: Object,
        required: true,
    },
    days: {
        required: true,
    },
    firstDay: {
        required: true,
    },
    showSch: {
        type: Boolean,
        default: false,
    },
    weeks: {
        type: Array,
        required: true,
    }
});

// Reactive state for drag handling
const isMouseDown = ref(1);


</script>



<style src="@/components/tree/tree.css" scoped></style>