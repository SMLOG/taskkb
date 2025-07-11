<template>
  <div @mouseup="checkSelection" class="selection-container">
    <slot></slot>
  </div>

  <div @mousedown.prevent id="formatTool"
    class="format-toolbar fixed bg-white dark:bg-gray-800 shadow-md rounded-md p-1 flex items-center gap-1 border border-gray-200 dark:border-gray-700"
    style="z-index: var(--vt-index-tooltip);" v-show="isFormatToolVisible"
    :style="{ left: formatToolLeft, top: formatToolTop }" role="toolbar" aria-label="Text formatting toolbar">
    <button @mousedown.prevent  @click="applyBold" class="format-button hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded"
      :class="{ 'font-bold': isBoldNow, 'bg-gray-100 dark:bg-gray-700': isBoldNow }" aria-label="Toggle bold">
      {{ isBoldNow ? 'Unbold' : 'Bold' }}
    </button>

    <div class="relative">
      <button class="format-button hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded indicative-element"
        ref="indicativeElement" @click.prevent.stop="toggleColorSelect" aria-haspopup="true"
        :aria-expanded="showColorSelect" aria-label="Text color">
        Color
        <span class="color-preview w-3 h-3 inline-block ml-1 border border-gray-300 dark:border-gray-600"
          :style="{ backgroundColor: fontColor || 'transparent' }"></span>
      </button>

      <ColorSelector v-model="fontColor" @select="selectColor" class="color-selector" v-if="showColorSelect"
        :position="colorSelectPosition" />
    </div>

    <button @click="removeFontColor" class="format-button hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded"
      aria-label="Remove text color">
      Remove Color
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
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
const colorSelectPosition = ref({
  top: 0,
  left: 0,
});
const indicativeElement = ref(null);

const isBold = () => {
  const selectedText = window.getSelection().toString();

  if (selectedText.length > 0) {
    const range = window.getSelection().getRangeAt(0);
    const parentElement = range.commonAncestorContainer.parentElement;
    const computedStyle = window.getComputedStyle(parentElement);
    return computedStyle.fontWeight === 'bold' || parseInt(computedStyle.fontWeight) >= 700;
  }

  return false;
};

const selectColor = (color) => {
  applyFontColor(null, color);
  showColorSelect.value = false;
};

const toggleColorSelect = () => {
  showColorSelect.value = !showColorSelect.value;
  if (showColorSelect.value) {
    calculateColorSelectPosition();
  }
};

const calculateColorSelectPosition = () => {
  const indicativeElementRect = indicativeElement.value.getBoundingClientRect();
  colorSelectPosition.value = {
    top: indicativeElementRect.bottom + 'px',
    left: indicativeElementRect.left + 'px',
  };
};

const applyFontColor = (event, color) => {
  if (color) fontColor.value = color;
  document.execCommand('foreColor', false, fontColor.value);
};

const removeFontColor = () => {
  document.execCommand('removeFormat', false, 'foreColor');
};


const checkSelection = () => {
  const selectedText = window.getSelection().toString();
  console.log(selectedText.trim())

  if (selectedText.trim().length > 0) {
    isFormatToolVisible.value = true;
    const selection = window.getSelection().getRangeAt(0);
    const boundingRect = selection.getBoundingClientRect();
    formatToolLeft.value = boundingRect.right + 'px';
    formatToolTop.value = boundingRect.bottom + 'px';
    isBoldNow.value = isBold();
  } else {
    isFormatToolVisible.value = false;
  }
};

const applyBold = (event) => {
  event.preventDefault();

  if (isBold()) {
    document.execCommand('bold');
    isBoldNow.value = false;
  } else {
    document.execCommand('bold', false, null);
    isBoldNow.value = true;
  }
};
</script>
