<template>
  <div class="flex w-full h-full">
    <textarea class="w-full h-full" v-model="sourceCode"></textarea>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useAppStore } from '@/stores/appStore';
import { useSchedule } from '@/composables/useSchedule';
import { generateWeeks } from '@/lib/schedule';
import { storeToRefs } from 'pinia';
import { debounce } from 'lodash';
import { useRowDrag } from '@/composables/useRowDrag';
import { weeksRef, moveType, isDragging } from '@/composables/context';
import { useContextHandler } from '@/composables/useContextHandler';
import { useTree } from '@/composables/useTree';

import {loopTree} from '@/lib/treelib'
import {jsonToMarkdown} from '@/lib/jsonMark'
const tableRef = ref(null);

const appStore = useAppStore();

const sourceCode = ref('')

const {
  selectStartRef
} = useSchedule(tableRef);

useRowDrag(tableRef, { selectedClass: 'selected', filter: '.header', multiDrag: true, });
useContextHandler(tableRef);




const { configRef, treeRef, activeTabRef, schReadyRef } = storeToRefs(appStore);



function flattenTree(tree, prefix = '', result = [], depth = []) {
  // Handle array input (multiple root nodes)
  if (Array.isArray(tree)) {
    tree.forEach((node, index) => {
      flattenTree(node, `${index + 1}`, result, [index + 1]);
    });
    return result;
  }

  // Create flattened node with depth index
  const flatNode = {
    ...tree,
    depthIndex: prefix || '1',
  };
  
  // Add current node to result
  result.push(flatNode);

  // Recursively process children (rows)
  if (tree.rows && Array.isArray(tree.rows)) {
    tree.rows.forEach((child, index) => {
      const newPrefix = prefix ? `${prefix}.${index + 1}` : `${index + 1}`;
      flattenTree(child, newPrefix, result, [...depth, index + 1]);
    });
  }

  return result;
}



if(treeRef.value){
  const flatArray = flattenTree(treeRef.value);
  sourceCode.value = jsonToMarkdown(flatArray);
}


</script>

<style src="@/components/tree/tree.css" scoped></style>