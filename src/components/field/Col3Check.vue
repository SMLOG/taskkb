<template>
  <div v-if="row" class="flex-1">
  <TriStateCheckbox v-model="row['c' + col.fn]"/>
  </div>
  <div v-else><ContentEditable v-model="col.name"></ContentEditable></div>
</template>

<script setup>
import { defineProps } from 'vue'
import ContentEditable from './sub/ContentEditable.vue';
import TriStateCheckbox from './sub/TriStateCheckbox.vue';

defineProps({
  col: {
    type: Object
  },
  row: {
    type: Object,
    required: false
  },
  index:{
  }
})

</script>

