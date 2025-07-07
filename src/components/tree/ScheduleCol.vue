<template>
    <div class="col flex" v-if="showSch" :class="{'bg-gray-100 dark:bg-[#121212] ':!row._tl}">
        <div style="display: flex; flex-wrap: nowrap" class="sch" :style="{width:days*25+'px'}">
            <div :style="{ width: 1 / days * 100 + '%' }" class="relative">
                <div v-if="row._tl && row._tl.end" :style="{
                    width: (calculateDaysBetweenDates(row._tl.end, row._tl.start,false)) * 100 + '%',
                    marginLeft: (calculateDaysBetweenDates2(row._tl.start, firstDay?.date,false,row) -1 ) * 100 + '%'
                }" class="plantime"
                    :class="{ dragMode: dragMode }">{{calculateDaysBetweenDates(row._tl.end,row._tl.start, true)}}d
                </div>
                <div v-if="selectStartRef && selectStartRef.row == row" @dblclick="dragMode = !dragMode" :style="{
                    width: getCacWidth(),
                    marginLeft: calDiffDates(firstDay) * 100 + '%'
                }" class="selectStartRef" :class="{ dragMode: dragMode }">{{
                    calculateDaysBetweenDates(selectStartRef.end,
                        selectStartRef.start, true)
                }}d
                    <div class="leftDrag"></div>
                    <div class="rightDrag"></div>
                </div>
            </div>
        </div>
        <div>
        </div>
    </div>
</template>

<script setup>
import { useSchedule } from '@/composables/useSchedule';
import { defineProps, ref } from 'vue';

const {
    getCacWidth,
    selectStartRef,
    calculateDaysBetweenDates,calculateDaysBetweenDates2,
    dragMode,
    calDiffDates
} = useSchedule();

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




</script>



<style src="@/components/tree/tree.css" scoped></style>
