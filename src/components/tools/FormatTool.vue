<template>
  <div @mouseup="checkSelection" class="selection-container">
    <slot></slot>
  </div>

  <div @mousedown.prevent ref="formatTool" @click.prevent.stop
    class="format-toolbar select-none fixed bg-white dark:bg-gray-800 shadow-md rounded-md p-1 z-999 flex items-center gap-1 border border-gray-200 dark:border-gray-700"
    v-show="isFormatToolVisible"
    :style="{ left: formatToolLeft, top: formatToolTop }" role="toolbar" aria-label="Text formatting toolbar">
    <button @click.prevent.stop="toggleFormat('bold', true)" class="format-button hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded"
      :class="{ 'font-bold': isBoldNow, 'bg-gray-100 dark:bg-gray-700': isBoldNow }" aria-label="Toggle bold">
      {{ isBoldNow ? 'Unbold' : 'Bold' }}
    </button>

    <div class="relative select-none">
      <button class="format-button hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded indicative-element"
        ref="indicativeElement" @click.prevent.stop="showColorSelect = !showColorSelect" aria-haspopup="true"
        :aria-expanded="showColorSelect" aria-label="Text color">
        Color
        <span class="color-preview w-3 h-3 inline-block ml-1 border border-gray-300 dark:border-gray-600"
          :style="{ backgroundColor: fontColor || 'transparent' }"></span>
      </button>

      <ColorSelector v-model="fontColor" @select="selectColor" class="color-selector" v-if="showColorSelect"/>
    </div>

    <button @click.prevent.stop="toggleFormat('foreColor')" class="format-button hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded"
      aria-label="Remove text color">
      Remove Color
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import ColorSelector from '@/components/tools/ColorSelector.vue';

const props = defineProps({
  editable: {
    type: Boolean,
    required: false,
  },
});

const isFormatToolVisible = ref(false);
const formatToolLeft = ref(0);
const formatToolTop = ref(0);
const fontColor = ref('#FF0000');
const showColorSelect = ref(false);
const isBoldNow = ref(false);
const indicativeElement = ref(null);
const editor = ref(null);
const formatTool = ref(null); // Reference to formatTool div

// Save and restore selection
const saveSelection = () => {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    return selection.getRangeAt(0);
  }
  return null;
};

const restoreSelection = (range) => {
  if (range) {
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }
};

const isBold = () => {
  const selection = window.getSelection();
  if (selection.rangeCount === 0 || selection.toString().length === 0) {
    return false;
  }

  const range = selection.getRangeAt(0);
  let parentElement = range.commonAncestorContainer;
  if (parentElement.nodeType === Node.TEXT_NODE) {
    parentElement = parentElement.parentElement;
  }
  const computedStyle = window.getComputedStyle(parentElement);
  return computedStyle.fontWeight === 'bold' || parseInt(computedStyle.fontWeight) >= 700;
};

let savedRange;
const checkSelection = (event) => {
  const selection = window.getSelection();
  const selectedText = selection.toString();

  if (selectedText.trim().length > 0) {
    isFormatToolVisible.value = true;
    const range = selection.getRangeAt(0);
    const boundingRect = range.getBoundingClientRect();
    formatToolLeft.value = boundingRect.right + 'px';
    formatToolTop.value = boundingRect.bottom + 'px';
    isBoldNow.value = isBold();
    editor.value = getSelectionTarget()?.closest('[contentEditable]');
    savedRange = saveSelection();
  } else {
    // Only hide if not clicking inside formatTool
    if (!formatTool.value?.contains(event.target)) {
      isFormatToolVisible.value = false;
      showColorSelect.value = false; // Also hide color selector
      editor.value = null;
    }
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
  editor.value?.focus();
  restoreSelection(savedRange);
  if (!value) {
    document.execCommand('removeFormat', false, command);
  } else {
    document.execCommand(command, false, value);
  }
  isBoldNow.value = isBold();
  savedRange = saveSelection();
};

const selectColor = (color) => {
  toggleFormat('foreColor', color);
};

// Handle click outside
const handleClickOutside = (event) => {
  if (
    isFormatToolVisible.value &&
    formatTool.value &&
    !formatTool.value.contains(event.target) 
  ) {
    isFormatToolVisible.value = false;
    showColorSelect.value = false;
    editor.value = null;
  }
};

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});
</script>