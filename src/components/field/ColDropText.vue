<template>
  <div v-if="row" class="h-full flex flex-1">
    <ContentEditable 
      v-model="row['c' + col.fn]" 
      :dropdownItems="col.options && col.options.split(',')" 
      @change="change" 
    />
  </div>
  <div v-else-if="col" class="h-full  flex flex-1">
    <ContentEditable v-model="col.name" />
  </div>
</template>

<script setup>
import ContentEditable from './sub/ContentEditable.vue';
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  col: {
    type: Object,
    required: true
  },
  row: {
    type: Object,
    required: false
  }
});

const emit = defineEmits(['change']);

const change = (oldVal, newVal) => {
  emit('change', oldVal, newVal);
};
</script>

<style>
</style>