<template>
  <div>
    <MonacoEditor 
      v-model="code"
      language="typescript"
      theme="vs-light"
      :options="{
        minimap: { enabled: true },
        fontSize: 16
      }"
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