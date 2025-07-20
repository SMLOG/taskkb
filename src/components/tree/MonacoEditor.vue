<template>
  <div class="editor-container overflow-hidden h-full w-full">
    <textarea
      ref="editor"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      @change="$emit('change', $event.target.value)"
      :style="textareaStyle"
    ></textarea>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

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

const editor = ref(null)

// Apply basic theming to the textarea
const textareaStyle = computed(() => {
  const styles = {
    width: '100%',
    height: '100%',
    padding: '10px',
    border: 'none',
    outline: 'none',
    resize: 'none',
    fontFamily: "'Courier New', monospace",
    fontSize: '14px',
    lineHeight: '1.5',
    tabSize: 2 // For better code indentation
  }

  // Apply dark theme if selected
  if (props.theme === 'vs-dark') {
    styles.backgroundColor = '#1e1e1e'
    styles.color = '#d4d4d4'
    styles.caretColor = '#ffffff' // Cursor color
  } else {
    styles.backgroundColor = '#ffffff'
    styles.color = '#000000'
  }

  // Apply any additional options
  if (props.options.fontSize) {
    styles.fontSize = `${props.options.fontSize}px`
  }
  if (props.options.tabSize) {
    styles.tabSize = props.options.tabSize
  }

  return styles
})

// Focus the editor when mounted
onMounted(() => {
  if (editor.value) {
    editor.value.focus()
    
    // Add basic auto-indentation
    editor.value.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault()
        const start = e.target.selectionStart
        const end = e.target.selectionEnd
        e.target.value = e.target.value.substring(0, start) + '  ' + e.target.value.substring(end)
        e.target.selectionStart = e.target.selectionEnd = start + 2
        emit('update:modelValue', e.target.value)
      }
    })
  }
})
</script>

