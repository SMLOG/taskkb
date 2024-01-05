<template>

  <div v-if="row">
    <ContentEditable v-model="row[col.field.name]"  :dropdownItems="col.field.options"  ></ContentEditable>
  </div>
  <div v-else-if="col">
       {{ col.field.name }}
  </div>
</template>

<script setup>
import ContentEditable from './ContentEditable.vue';
</script>
<script>
export default {

  props: {
    col:{
      type:Object
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

<style>

</style>