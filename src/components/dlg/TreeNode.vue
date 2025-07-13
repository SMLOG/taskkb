<template>
    <div>
      <div class="flex rounded-md p-3 mb-1 bg-gray-100 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex-col"
        :style="{ 'margin-left': `${depth * 20}px` }">
        <div class="flex items-center">
          <div class="text-center text-gray-500 dark:text-gray-400">
            {{ index + 1 }}
          </div>
          <div class="mx-2 w-20">
            <select v-model="node.cp"
              class="w-full rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 text-sm py-1.5 focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400">
              <option v-for="cp in cpList" :key="cp.type" :value="cp.type">
                {{ cp.name }}
              </option>
            </select>
          </div>
          <div class="min-w-[80px] flex-1 mx-2">
            <input v-model="node.name"
              class="w-full rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-gray-100 text-sm py-1.5 focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
              placeholder="Column Name" />
          </div>
          <label class="flex items-center gap-1 text-sm text-gray-800 dark:text-gray-300">
            <input type="checkbox" v-model="node.sticky"
              class="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400" />
            Sticky
          </label>
          <label class="flex items-center gap-1 text-sm text-gray-800 dark:text-gray-300">
            <input type="checkbox" v-model="node.show"
              class="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400" />
            Show
          </label>
          <button class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            title="Click to delete this item." @click="$emit('delete', node, parentArray || cols, index)">
            x
          </button>
          <button @click="toggleDetail"
            class="flex items-center justify-center w-8 h-8 text-red-500 hover:font-bold rounded-full transition-colors duration-200 bg-blue-100"
            style="border-radius: 50%;" aria-label="Open dropdown menu" aria-haspopup="true" aria-expanded="false">
            <svg class="w-5 h-5 transition-transform duration-200" focusable="false" viewBox="0 0 24 24"
              :class="{ 'rotate-180': showDetail }" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"></path>
            </svg>
          </button>
          <button @click="$emit('add-child', node)"
            class="ml-2 rounded bg-green-500 px-2 py-1 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-xs">
            + Child
          </button>
        </div>
        
        <div class="mt-2">
          <div class="flex" v-if="showDetail">
            <div class="flex gap-2 flex-col flex-1">
              <div v-if="node.cp === 'ColDropText'">
                <input v-model="node.options"
                  class="w-full bg-white rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 text-sm py-1.5 focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                  placeholder="Drop down options, separate by [,]" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="showDetail && node.children && node.children.length">
        <tree-node
          v-for="(child, childIndex) in node.children"
          :key="child.id"
          :node="child"
          :index="childIndex"
          :depth="depth + 1"
          :parent-array="node.children"
          @add-child="$emit('add-child', $event)"
          @delete="$emit('delete', $event, node.children, childIndex)"
          @toggle-detail="$emit('toggle-detail', $event)"
        />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import { cpList } from "@/components/cpList";
  
  const props = defineProps({
    node: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    depth: {
      type: Number,
      default: 0
    },
    parentArray: {
      type: Array,
      default: null
    }
  });
  
  const emit = defineEmits(['add-child', 'delete', 'toggle-detail']);
  
  const showDetail = ref(false);
  
  const toggleDetail = () => {
    showDetail.value = !showDetail.value;
    emit('toggle-detail', props.node);
  };
  </script>
  
  <style scoped>
  /* Add any tree-specific styles here */
  </style>