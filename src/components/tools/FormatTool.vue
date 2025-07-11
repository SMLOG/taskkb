<template>
  <div @mouseup="checkSelection" class="selection-container">
    <slot></slot>
  </div>

  <div 
    ref="formatTool"
    class="format-toolbar select-none fixed bg-white dark:bg-gray-800 shadow-lg rounded-lg p-1 z-[9999] flex items-center gap-1 border border-gray-200 dark:border-gray-700 transition-all duration-200 ease-out"
    :class="{
      'opacity-0 scale-95 pointer-events-none': !isFormatToolVisible,
      'opacity-100 scale-100': isFormatToolVisible
    }"
    :style="{ 
      left: formatToolLeft, 
      top: formatToolTop,
      transformOrigin: 'left center'
    }" 
    role="toolbar" 
    aria-label="Text formatting options"
    @mousedown.prevent
    @click.stop
  >
    <!-- Bold Button -->
    <button 
      @click.stop="toggleFormat('bold', true)" 
      class="format-button transition-colors duration-150 px-3 py-1.5 rounded-md flex items-center justify-center w-9 h-8"
      :class="{ 
        'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white': isBoldNow,
        'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300': !isBoldNow
      }" 
      aria-label="Toggle bold"
      aria-pressed="isBoldNow"
      title="Bold"
    >
      <span class="text-sm font-bold">B</span>
    </button>

    <!-- Italic Button -->
    <button 
      @click.stop="toggleFormat('italic', true)" 
      class="format-button transition-colors duration-150 px-3 py-1.5 rounded-md flex items-center justify-center w-9 h-8"
      :class="{ 
        'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white': isItalicNow,
        'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300': !isItalicNow
      }" 
      aria-label="Toggle italic"
      aria-pressed="isItalicNow"
      title="Italic"
    >
      <span class="text-sm italic">I</span>
    </button>

    <!-- Color Picker -->
    <div class="relative">
      <button 
        class="format-button transition-colors duration-150 px-3 py-1.5 rounded-md flex items-center gap-1.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300 h-8"
        @click.stop="showColorSelect = !showColorSelect" 
        aria-haspopup="true"
        :aria-expanded="showColorSelect" 
        aria-label="Text color"
        title="Text color"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
        <span 
          class="color-preview w-3 h-3 rounded-sm inline-block border border-gray-300 dark:border-gray-600 transition-colors"
          :style="{ backgroundColor: fontColor || 'transparent' }"
        ></span>
      </button>

        <ColorSelector 
          v-if="showColorSelect"
          v-model="fontColor" 
          @select="selectColor" 
          class="color-selector absolute left-0 mt-1 z-999"
          @click.stop
        />
    </div>

    <!-- Remove Formatting Button -->
    <button 
      @click.stop="removeFormatting" 
      class="format-button transition-colors duration-150 px-3 py-1.5 rounded-md flex items-center justify-center w-9 h-8 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
      aria-label="Remove formatting"
      title="Clear formatting"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import ColorSelector from '@/components/tools/ColorSelector.vue';

const isFormatToolVisible = ref(false);
const formatToolLeft = ref('0px');
const formatToolTop = ref('0px');
const fontColor = ref('#3B82F6');
const showColorSelect = ref(false);
const isBoldNow = ref(false);
const isItalicNow = ref(false);
const editor = ref(null);
const formatTool = ref(null);

// Save and restore selection
const saveSelection = () => {
  const selection = window.getSelection();
  return selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
};

const restoreSelection = (range) => {
  if (range) {
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }
};

const checkFormatting = () => {
  const selection = window.getSelection();
  if (selection.rangeCount === 0 || selection.toString().length === 0) {
    return { bold: false, italic: false };
  }

  const range = selection.getRangeAt(0);
  let parentElement = range.commonAncestorContainer;
  if (parentElement.nodeType === Node.TEXT_NODE) {
    parentElement = parentElement.parentElement;
  }
  const computedStyle = window.getComputedStyle(parentElement);
  
  return {
    bold: computedStyle.fontWeight === 'bold' || parseInt(computedStyle.fontWeight) >= 700,
    italic: computedStyle.fontStyle === 'italic'
  };
};

let savedRange = null;
const checkSelection = (event) => {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  if (selectedText.length > 0) {
    const range = selection.getRangeAt(0);
    const boundingRect = range.getBoundingClientRect();
    
    formatToolLeft.value = `${boundingRect.left + window.scrollX + (boundingRect.width / 2)}px`;
    formatToolTop.value = `${boundingRect.top + window.scrollY - 40}px`;
    
    const formatting = checkFormatting();
    isBoldNow.value = formatting.bold;
    isItalicNow.value = formatting.italic;
    editor.value = getSelectionTarget()?.closest('[contentEditable]');
    savedRange = saveSelection();
    
    setTimeout(() => {
      isFormatToolVisible.value = true;
    }, 50);
  } else if (!formatTool.value?.contains(event.target)) {
    isFormatToolVisible.value = false;
    showColorSelect.value = false;
    editor.value = null;
  }
};

const getSelectionTarget = () => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  return range.commonAncestorContainer.nodeType === Node.TEXT_NODE
    ? range.commonAncestorContainer.parentNode
    : range.commonAncestorContainer;
};

const toggleFormat = async (command, value = null) => {
  if (!editor.value) return;
  
  editor.value.focus();
  restoreSelection(savedRange);
  
  document.execCommand(command, false, value || '');
  
  const formatting = checkFormatting();
  isBoldNow.value = formatting.bold;
  isItalicNow.value = formatting.italic;
  savedRange = saveSelection();
};

const removeFormatting = () => {
  if (!editor.value) return;
  
  editor.value.focus();
  restoreSelection(savedRange);
  document.execCommand('removeFormat', false, '');
  
  isBoldNow.value = false;
  isItalicNow.value = false;
  savedRange = saveSelection();
};

const selectColor = async (color) => {
  fontColor.value = color;
  await toggleFormat('foreColor', color);
  await nextTick();
  showColorSelect.value = false;
};

const handleClickOutside = (event) => {
  if (formatTool.value && !formatTool.value.contains(event.target)) {
    isFormatToolVisible.value = false;
    showColorSelect.value = false;
  } 
};

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
  transform-origin: top left;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.format-button {
  transition: all 0.15s ease;
  min-width: 2.25rem;
}

.format-button:active {
  transform: scale(0.95);
}

.format-toolbar {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 0.25rem;
  gap: 0.25rem;
}

.dark .format-toolbar {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
}

.color-preview {
  margin-left: 0.25rem;
}
</style>