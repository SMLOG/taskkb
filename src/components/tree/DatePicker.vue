<template>
     <a v-if="config" @mouseenter="showDatePicker=true" @mouseleave="showDatePicker=false"
      style="position: fixed;top:20%;right:10px;z-index: 100;">
      Start
      <div v-show="showDatePicker" style="position: absolute;background: white;right:0;">
        <VueDatePicker v-model="config.startDate"
          @date-update="(d) => { config.startDate = d; showDatePicker = false }" :enable-time-picker="false"
          type="date" inline auto-apply />
        <div style="margin:10px;"> Weeks:<input type="number" v-model="config.weekCount" :min="20"
            @mousedown.stop,
          @mousedown.stop /></div>
        <div style="margin:10px;"> Allow Options:<input v-model="config.allowOptions" :min="20"
            @mousedown.stop /></div>
      </div>
    </a>
</template>

<script setup>
import { defineProps,ref } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
const showDatePicker = ref(false);

defineProps({
  config: {
    type: Object
  }
})


</script>

