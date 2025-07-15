<template>
  <div class="flex">
    <div
      v-for="(col, index) in columns"
      :key="col.key || index"
      :class="{
        'col': true,
        'bordert': i > 0
      }"
      :style="{
        ...colStyle(col, index),
        width: getWith(col)
      }"
    >
      <div v-if="col.show" :class="cellClass(col)">
        <div class="cell flex flex-1 px-1">
          <b class="w-full">
            <component :is="resolveComponent(col.cp)" :col="col" v-if="resolveComponent(col.cp)" />
          </b>
        </div>
      </div>
      <div
        v-if="col.children?.length"
        class="flex"
        :style="{ width: getWith(col) }"
      >
        <TreeColumn
          v-if="col.children && col.children.length > 0"
          :columns="col.children"
          :col-style="colStyle"
          :cell-class="cellClass"
          :resolve-component="resolveComponent"
          :i="i + 1"
        />
      </div>
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
  if (col.children?.length) return 'auto';
  return col.width + 'px';
};

const getColspan = (col) => {
  if (!col.children || col.children.length === 0) return 1;
  return col.children.reduce((total, child) => total + getColspan(child), 0);
};
</script>

<style lang="css" scoped>
.col {
  border-right: 1px solid #ccc;
}

/* Remove right border from the last column to prevent double borders */
.col:not(:last-child) {
  border-right: 1px solid #ccc;
}

/* Apply left border only to the first column */
.col:first-child {
  border-left: 1px solid #ccc;
}

/* Apply top border only for nested levels (i > 0) */
.bordert {
  border-top: 1px solid #ccc;
}
</style>