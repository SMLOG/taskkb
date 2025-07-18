<template>
    <div ref="editorContainer" class="editor-container"></div>
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
  import loader from '@monaco-editor/loader'  // Note: default import now
  
  loader.config({
  paths: {
    vs: '/node_modules/monaco-editor/min/vs'
  }
})

  const props = defineProps({
    modelValue: String,
    language: {
      type: String,
      default: 'javascript'
    },
    theme: {
      type: String,
      default: 'vs-dark'
    },
    options: {
      type: Object,
      default: () => ({})
    }
  })
  
  const emit = defineEmits(['update:modelValue', 'change'])
  
  const editorContainer = ref(null)
  const editor = ref(null)
  
  // Initialize editor
  onMounted(async () => {
    // Load monaco
    await loader.init()
    
    // Create editor instance
    editor.value = monaco.editor.create(editorContainer.value, {
      value: props.modelValue || '',
      language: props.language,
      theme: props.theme,
      ...props.options
    })
  
    // Handle changes
    editor.value.onDidChangeModelContent(() => {
      const value = editor.value.getValue()
      emit('update:modelValue', value)
      emit('change', value)
    })
  })
  
  // Cleanup
  onBeforeUnmount(() => {
    editor.value?.dispose()
  })
  
  // Watch for prop changes
  watch(() => props.modelValue, (newValue) => {
    if (editor.value && newValue !== editor.value.getValue()) {
      editor.value.setValue(newValue)
    }
  })
  
  watch(() => props.language, (newLang) => {
    if (editor.value) {
      monaco.editor.setModelLanguage(editor.value.getModel(), newLang)
    }
  })
  
  watch(() => props.theme, (newTheme) => {
    monaco.editor.setTheme(newTheme)
  })
  </script>
  
  <style>
  .editor-container {
    height: 500px;
    width: 100%;
    border: 1px solid #ddd;
  }
  </style>