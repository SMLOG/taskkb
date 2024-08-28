<template>
  <div v-if="row">
    <a class="etype num" :draggable="1">{{ row._rIndex }}</a>
  </div>
  <div v-else>
    #
  </div>
</template>

<script setup>
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