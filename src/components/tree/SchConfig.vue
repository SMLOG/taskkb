<template>
  <a v-if="config" @mouseenter="showDatePicker=true" @mouseleave="showDatePicker=false"
   style="position: fixed;top:20%;right:10px;z-index: 100;padding: 8px;border-radius: 4px;background: #f0f0f0;border: 1px solid #ccc;cursor: pointer;display: flex;align-items: center;justify-content: center;">
   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
     <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
     <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
   </svg>
   <div v-show="showDatePicker" style="position: absolute;background: white;top:0;right:100%;">
     <VueDatePicker v-model="config.startDate"
       @date-update="(d) => { config.startDate = d; showDatePicker = false }" :enable-time-picker="false"
       type="date" inline auto-apply />
     <div style="margin:10px;"> Weeks:<input type="number" v-model="config.weekCount" :min="20"
         @mousedown.stop /></div>
     <div style="margin:10px;"> Allow Options:<input v-model="config.allowOptions" :min="20"
         @mousedown.stop /></div>
   </div>
 </a>
</template>

<script setup>
import { defineProps, ref } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css';

const showDatePicker = ref(false);

defineProps({
config: {
 type: Object
}
})
</script>