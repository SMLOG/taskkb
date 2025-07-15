<template>
  <div :class="{col:i===0,bordert:i}" v-for="(col, index) in columns" :key="col.key || index" :style="{
      ...colStyle(col, index),
      width:getWith(col)
    }" >
    <div v-if="col.show"  :class="cellClass(col)" >
      <div class="cell flex flex-1 px-1">
        <b class="w-full">
          <component :is="resolveComponent(col.cp)" :col="col" v-if="resolveComponent(col.cp)" />
        </b>
      </div>
    </div>
    <div v-if="col.children?.length " class="flex" :class="{bordert:i}" :style="{width:getWith(col)}">
      <TreeColumn v-if="col.children && col.children.length > 0" :columns="col.children" :col-style="colStyle"
        :cell-class="cellClass" :resolve-component="resolveComponent" :i="i+1" />
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  columns: Array,
  i: Number,
  colStyle: Function,
  cellClass: Function,
  resolveComponent: Function,
});


const getWith = (col) => {
  if(col.children?.length)return 'auto';
  return col.width+'px';
};



const getColspan = (col) => {
  if (!col.children || col.children.length === 0) return 1;
  return col.children.reduce((total, child) => total + getColspan(child), 0);
};
</script>

<style lang="css" scoped>
 .col:first-child {
    border-left-style: var(--tw-border-style);
    border-left-width: 1px;
}
.col
 {
    border-right-style: var(--tw-border-style);
    border-right-width: 1px;
}
.bordert{
  border-top: 1px solid #ccc;
}

</style>