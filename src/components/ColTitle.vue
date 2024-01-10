<template>

  <div v-if="row">

    <div style="display: flex" >
          
                <span
                  style="
                    background: #aaa;
                    margin-right: 5px;
                    border-radius: 5px;
                  "
                  ></span
                >
                <div style="margin-right:15px;" :level="row._level" :style="{paddingLeft:row._level*15+'px'}" ><span>{{ row._id }}</span><span @click="row._collapsed=!row._collapsed" :class="{arrow:row._childs&&row._childs.length,collapsed:row._childs&&row._childs.length&&row._collapsed}"></span> </div>
                <ContentEditable v-model="row[col.field.name]"   ></ContentEditable>

              </div>

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
.arrow {
  content: "";
  width: 0;
    height: 0;
    border-left: 0.5em solid transparent;
    border-right: 0.5em solid transparent;
    border-bottom: 0.5em solid gray;
    transform: rotate(180deg);
    display: inline-block;
    cursor: pointer;
    transition: all 0.3s ease;

  }
  .collapsed{
    transform: rotate(90deg);
  }
</style>