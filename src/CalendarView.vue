<script setup>
import { ref,watch } from 'vue';
import Calendar from './components/Calendar.vue';
import TreeTimeline from './components/tree/TreeTimeline.vue';
import { useAppStore } from './stores/appStore';
import {formatDateToYyyyMMdd} from '@/lib/dataUtil'
const currentDate = ref(new Date());

const tasks = ref([]);

watch(
  () => [useAppStore().treeRef],
  (newValue) => {
    const items = useAppStore().getList();
    tasks.value = items.map(e=>{
    return {row:e,start:formatDateToYyyyMMdd(e?._tl?.start),end:formatDateToYyyyMMdd(e?._tl?.end),title:'a'}
})
  },
  { immediate: true,deep:true }
);

</script>

<template>
    <div class="absolute inset-0  flex w-full h-full">
        <!-- TreeTimeline Column -->
        <div class="flex-1 h-full relative">
            <div class="absolute inset-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200 scrollbar-thumb-rounded">
                <TreeTimeline />
            </div>
        </div>

        <!-- Calendar Column -->
        <div class="w-80 h-full relative">
            <div class="absolute inset-0 overflow-hidden scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200 scrollbar-thumb-rounded">
                <Calendar :initial-year="2025" :initial-month="6" :current-date="currentDate" :tasks="tasks" />
            </div>
        </div>
    </div>
</template>