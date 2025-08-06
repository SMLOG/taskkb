<template>
  <div v-if="row" class="etype num block flex-1" :draggable="isDrag"><span :class="{major:index.indexOf('.')==-1}">{{ index }}</span></div>
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

<style>
.selected .num{
  cursor: move;
}
.major{
    background: darkblue;
    display: inline-block;
    border-radius: 100%;
    text-align: center;
    line-height: 1.8em;
    width: 1.8em;
    color: white;
}
.num::after{
  content: "";
}
</style>