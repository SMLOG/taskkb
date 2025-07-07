<script setup>
import { ref } from 'vue';
import Calendar from './components/Calendar.vue';
import TreeTimeline from './components/tree/TreeTimeline.vue';

const currentDate = ref(new Date());

const tasks = ref([
  {
    id: 1,
    title: 'Team Meeting',
    start: '20250715',
    end: '20250715',
    priority: 'high',
    type: 'meeting'
  },
  {
    id: 2,
    title: 'Project Deadline',
    startDate: '2023-06-20',
    endDate: '2023-06-22',
    priority: 'high',
    type: 'deadline'
  },
  {
    id: 3,
    title: 'Code Review',
    startDate: '2023-06-18',
    priority: 'medium'
  }
]);

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
            <div class="absolute inset-0 overflow-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200 scrollbar-thumb-rounded">
                <Calendar :initial-year="2025" :initial-month="6" :current-date="currentDate" :tasks="tasks" />
            </div>
        </div>
    </div>
</template>