<template>
  <div class="flex h-full">
    <MonacoEditor 
      v-model="code"
      @change="handleChange"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import MonacoEditor from './MonacoEditor.vue'
import {jsonToMarkdown} from '@/lib/jsonMark';
import { storeToRefs } from 'pinia';
import { useAppStore } from '@/stores/appStore';
const appStore = useAppStore();
const { treeRef} = storeToRefs(appStore);

const code = ref('// TypeScript example\ninterface User {\n  name: string\n  age: number\n}')

const handleChange = (value) => {
  console.log('Editor content changed:', value)
}

watch(treeRef, (newTree) => {
  if (newTree) {
   code.value = jsonToMarkdown(newTree)
  }
}, { immediate: true })
</script>