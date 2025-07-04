<script setup>
import {ref} from 'vue';
import Calendar from './components/Calendar.vue';

const currentDate = ref(new Date());
</script>

<template>
<Calendar   
:initial-year="2025"
:initial-month="6" 
:current-date="currentDate"
/>

</template>

<style scoped>

</style>
