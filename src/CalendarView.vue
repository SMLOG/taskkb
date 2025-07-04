<script setup>
import { ref } from 'vue';
import Calendar from './components/Calendar.vue';
import TreeTimeline from './components/tree/TreeTimeline.vue';

const currentDate = ref(new Date());
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
                <Calendar :initial-year="2025" :initial-month="6" :current-date="currentDate" />
            </div>
        </div>
    </div>
</template>