<template>
  <div v-for="(col, index) in columns" :key="col.key || index" :style="{
      ...colStyle(col, index),
      width:getWith(col)
    }">
    <div v-if="col.show"  :class="cellClass(col)">
      <div class="cell flex flex-1 px-1">
        <b class="w-full">
          <component :is="resolveComponent(col.cp)" :col="col" v-if="resolveComponent(col.cp)" />
        </b>
      </div>
    </div>
    <div class="flex" :style="{width:getWith(col)}">
      <TreeColumn v-if="col.children && col.children.length > 0" :columns="col.children" :col-style="colStyle"
        :cell-class="cellClass" :resolve-component="resolveComponent" />
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  columns: Array,
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