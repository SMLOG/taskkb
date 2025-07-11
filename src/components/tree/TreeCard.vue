<template>
    <!-- Main Card -->
    <div v-if="depth !== ''" class="card min-h-[70px] bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <template v-for="(col, cellIndex) in cols" :key="cellIndex">
        <div class="flex">
          <div class="cell flex px-1 p-2">
            <b class="w-full text-gray-900 dark:text-gray-100">
              <component :is="resolveComponent(col.cp)" :col="col" v-if="resolveComponent(col.cp)"></component>
            </b>
          </div>
  
          <Cell 
            :row="row" 
            :col="col" 
            :level="level" 
            :cellIndex="cellIndex" 
            :index="id" 
            :depth="depth"
            class="p-2 border-r border-gray-100 dark:border-gray-700 last:border-r-0 flex-1"
          ></Cell>
        </div>
      </template>
    </div>
  
    <!-- Child Cards -->
    <template v-if="row._childs?.length && !row._collapsed" class="ml-6 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
      <TreeCard 
        v-for="(child, index) in row._childs" 
        :key="index" 
        :depth="depth + '.' + index" 
        :row="child"
        :cols="cols" 
        :showSch="showSch" 
        :days="days" 
        :firstDay="firstDay" 
        :level="level + 1" 
        :id="(id ? id + '.' : '') + (index + 1)" 
        :gridStyle="gridStyle" 
        :weeks="weeksRef" 
      />
    </template>
  </template>
  
  <script setup>
  import { useTree } from '@/composables/useTree';
  import { defineProps } from 'vue';
  import TreeCard from '@/components/tree/TreeCard.vue';
  import Cell from '@/components/tree/Cell.vue';
  import { resolveComponent } from '@/components/cpList';
  
  const { weeksRef } = useTree();
  
  const props = defineProps({
    row: { type: Object, required: true },
    cols: { type: Array, required: true },
    depth: { type: String, required: true },
    gridStyle: { type: Object },
    level: { type: Number, required: true },
    id: { type: String, default: '' },
    weeks: { type: Array },
    days: { type: Object },
    firstDay: { type: Object },
    showSch: { type: Boolean, default: false },
    schReady: { type: Boolean },
  });
  </script>
  
  <style scoped>
  .card {
    display: grid;
    grid-template-columns: repeat(var(--cols-count, 1), minmax(0, 1fr));
  }
  </style>