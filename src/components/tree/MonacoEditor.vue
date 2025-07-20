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
  modelValue: String
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

