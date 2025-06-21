<template>
  <div v-if="row" class="flex-1"><input type="checkbox" v-model="row['c' + col.fn]"></div>
  <div v-else><ContentEditable v-model="col.name"></ContentEditable></div>
</template>

<script setup>
import { defineProps } from 'vue'
import ContentEditable from './sub/ContentEditable.vue';

defineProps({
  col: {
    type: Object
  },
  row: {
    type: Object,
    required: false
  },
  index:{
  },isDrag:{

  }
})

</script>

<style>
.selected .num{
  cursor: move;
}
</style>