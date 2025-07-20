<template>
  <div class="flex h-full">
    <MonacoEditor 
      v-model="code"
      @change="handleChange"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MonacoEditor from './MonacoEditor.vue'

const code = ref('// TypeScript example\ninterface User {\n  name: string\n  age: number\n}')

const handleChange = (value) => {
  console.log('Editor content changed:', value)
}
</script>