<template>
  <a v-if="row" class="etype num" :draggable="isDrag">{{ index||row._rIndex }}</a>
  <div v-else>#</div>
</template>

<script setup>
import { useTableComposable } from '@/components/useTableComposable'
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
  }
})

const { isDrag } = useTableComposable()
</script>

<style></style>