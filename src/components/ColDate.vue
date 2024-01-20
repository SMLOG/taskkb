<template>

  <div v-if="row">
    <ContentEditableDate v-model="row['c'+col.fn]"  :dropdownItems="col.field.options" @change="change" ></ContentEditableDate>
  </div>
  <div v-else-if="col">
    <ContentEditable v-model="col.name"   :isText="true"  ></ContentEditable>
  </div>
</template>

<script setup>
import ContentEditableDate from './ContentEditableDate.vue';
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

    change(oldVal,newVal){
      console.log(oldVal,newVal,'...')
      this.$emit('change',oldVal,newVal);

    }
  },
};
</script>

<style>

</style>