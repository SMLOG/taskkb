<template>
    <a v-if="row" class="etype num" :draggable="isDrag">{{ row._rIndex }}</a>
  <div v-else>
    #
  </div>
</template>

<script setup>
import { useTableComposable } from '@/components/useTableComposable'

const { isDrag
  } = useTableComposable();
</script>
<script>
export default {

  props: {
    col: {
      type: Object
    },
    row: {
      type: Object,
      required: false,
    },
  },
  data() {
    return {

    };
  },
  methods: {

  },
};
</script>

<style></style>