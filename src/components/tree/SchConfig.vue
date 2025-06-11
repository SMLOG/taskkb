<template>
  <a v-if="config" 
     @mouseenter="showDatePicker=true" 
     title="Configure settings"
     class="fixed top-[20%] right-2 z-[100] p-3 rounded-md bg-gray-50 dark:bg-gray-800 shadow-md cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" class="dark:stroke-gray-300">
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
    <div v-show="showDatePicker" 
         @mouseleave="showDatePicker=false"
         class=" absolute bg-white dark:bg-gray-900 top-0 right-full mr-2 p-3 rounded-md shadow-lg min-w-[200px] transition-all duration-200"
         :class="{ 'opacity-100 translate-y-0': showDatePicker, 'opacity-0 -translate-y-2 pointer-events-none': !showDatePicker }">
      <VueDatePicker v-model="config.startDate"
        @date-update="(d) => { config.startDate = d; showDatePicker = false }"
        :enable-time-picker="false"
        :disabled-dates="disableNonMondays"
        type="date" 
        inline 
        auto-apply 
        class="border-none" />
      <div class="mt-3 flex items-center gap-2">
        <label class="text-sm text-gray-700 dark:text-gray-300">Weeks:</label>
        <input type="number" v-model="config.weekCount" :min="20"
               class="w-20 p-1.5 border border-gray-200 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
               @mousedown.stop />
      </div>
      <div class="mt-3 flex items-center gap-2">
        <label class="text-sm text-gray-700 dark:text-gray-300">Allow Options:</label>
        <input v-model="config.allowOptions" :min="20"
               class="w-20 p-1.5 border border-gray-200 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
               @mousedown.stop />
      </div>
    </div>
  </a>
</template>

<script setup>
import { defineProps, ref } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css';

const showDatePicker = ref(false);

// Function to disable all non-Monday dates
const disableNonMondays = (date) => {
  return date.getDay() !== 1; // Disable all days except Monday (Monday is 1)
};

defineProps({
  config: {
    type: Object
  }
})
</script>
<style lang="css" scoped>
::v-deep .dp__menu {
  border: none !important;
  outline: none !important;
}
</style>