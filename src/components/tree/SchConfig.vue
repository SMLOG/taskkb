<template>
  <a v-if="config" 
     @mouseenter="showDatePicker=true" 
     @mouseleave="showDatePicker=false"
     title="Configure settings"
     style="position: fixed; top: 20%; right: 10px; z-index: 100; padding: 10px; border-radius: 6px; background: linear-gradient(145deg, #ffffff, #e6e6e6); box-shadow: 0 2px 4px rgba(0,0,0,0.1); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease-in-out;"
     @mouseover="this.style.background='linear-gradient(145deg, #e6e6e6, #ffffff)'"
     @mouseout="this.style.background='linear-gradient(145deg, #ffffff, #e6e6e6)'">
   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2">
     <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
     <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
   </svg>
   <div v-show="showDatePicker" 
        style="position: absolute; background: #fff; top: 0; right: 100%; padding: 12px; border-radius: 6px; box-shadow: 0 4px 8px rgba(0,0,0,0.15); min-width: 200px; transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out; transform: translateY(0); opacity: 1;"
        :style="showDatePicker ? { opacity: 1, transform: 'translateY(0)' } : { opacity: 0, transform: 'translateY(-10px)' }">
     <VueDatePicker v-model="config.startDate"
       @date-update="(d) => { config.startDate = d; showDatePicker = false }" 
       :enable-time-picker="false"
       type="date" 
       inline 
       auto-apply 
       style="border: 1px solid #e0e0e0; border-radius: 4px;" />
     <div style="margin: 12px 0; display: flex; align-items: center; gap: 8px;">
       <label style="font-size: 14px; color: #333;">Weeks:</label>
       <input type="number" v-model="config.weekCount" :min="20"
              style="width: 80px; padding: 6px; border: 1px solid #e0e0e0; border-radius: 4px; font-size: 14px;"
              @mousedown.stop />
     </div>
     <div style="margin: 12px 0; display: flex; align-items: center; gap: 8px;">
       <label style="font-size: 14px; color: #333;">Allow Options:</label>
       <input v-model="config.allowOptions" :min="20"
              style="width: 80px; padding: 6px; border: 1px solid #e0e0e0; border-radius: 4px; font-size: 14px;"
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

defineProps({
config: {
 type: Object
}
})
</script>