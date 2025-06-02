<template>
  <div @mouseup="checkSelection">
    <slot></slot>
  </div>
  <div id="formatTool" class="fixed bg-white dark:bg-black" style="z-index: var(--vt-index-tooltip);" v-show="isFormatToolVisible" :style="{ left: formatToolLeft, top: formatToolTop }">
    <button @click="applyBold">{{ isBoldNow ? 'Un' : '' }}Bold</button>
    <button class="indicative-element" ref="indicativeElement" @click.prevent.stop="toggleColorSelect" style="color:">
      Color
    </button>
    <button @click="removeFontColor">-Color</button>
    <div>
      <ColorSelector v-model="fontColor" @select="selectColor" style="user-select: none;" v-if="showColorSelect" :position="colorSelectPosition"></ColorSelector>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import ColorSelector from './ColorSelector.vue';

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

const applyFontColor2 = () => {
  const selection = window.getSelection();

  const parentSpan = selection.anchorNode.parentElement;
  if (parentSpan.tagName === 'SPAN') {
    parentSpan.style.color = fontColor.value;
  } else {
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.color = fontColor.value;
    range.surroundContents(span);
  }
  console.log('apply color');
};

const checkSelection = () => {
  const selectedText = window.getSelection().toString();

  if (selectedText.length > 0) {
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
