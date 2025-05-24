<template>
  <a v-if="row" class="etype num" :draggable="isDrag">{{ index }}</a>
  <div v-else>#</div>
</template>

<script setup>
import { defineProps } from 'vue'

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

<style></style>