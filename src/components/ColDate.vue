<template>
  <div v-if="row" class="flex-1 h-full">
    <ContentEditableDate v-model="row['c' + col.fn]" :dropdownItems="col.field.options"></ContentEditableDate>
  </div>
  <div v-else-if="col" class="flex-1 h-full">
    <ContentEditable v-model="col.name" :isText="true"></ContentEditable>
  </div>
</template>

<script setup>
import ContentEditableDate from './ContentEditableDate.vue';
import ContentEditable from './ContentEditable.vue';
import { defineProps } from 'vue';

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
</script>

