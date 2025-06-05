<template>
  <div class="editable-dropdown" ref="containerRef" style="width: 100%; min-width: 1em;" @dblclick="handleDoubleClick">
    <div style="display: flex; justify-content: space-between;">
      <div
        ref="contentEditableRef"
        :contenteditable="editable"
        @paste="sanitizePaste"
        @keydown.enter.prevent="handleEnter"
        @focus="showDropdown = true"
        class="text"
        v-html="renderToHtml(modelValue)"
      ></div>
      <div v-if="isText">
        <span>T</span>
      </div>
    </div>
    <div
      v-if="showDropdown && !isText && dropdownItems?.length"
      ref="dropdownRef"
      class="dropdown bg-white dark:bg-gray-800 z-9999"
    >
      <ul>
        <li
          v-for="item in dropdownItems"
          :key="item"
          @click="selectItem(item)"
          class="dropdown-item"
        >
          {{ item }}
        </li>
      </ul>
    </div>
  </div>
  <div
    v-if="!editable"
    style="position: absolute; inset: 0;"
    @dblclick="handleDoubleClick"
    @click.stop
  ></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';

// Define props with TypeScript
interface Props {
  modelValue?: string;
  isText?: boolean;
  dropdownItems?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  isText: false,
  dropdownItems: () => [],
});

// Define emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string): void;
  (e: 'enter'): void;
}>();

// Reactive state
const editable = ref(false);
const showDropdown = ref(false);
const containerRef = ref<HTMLElement | null>(null);
const contentEditableRef = ref<HTMLElement | null>(null);
const dropdownRef = ref<HTMLElement | null>(null);
const timer = ref<NodeJS.Timeout | null>(null);

// Markdown setup
const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    },
  })
);

// Watch for dropdown visibility changes
watch(showDropdown, (newVal) => {
  const parentCol = contentEditableRef.value?.closest('.col');
  if (parentCol) {
    if (newVal) {
      parentCol.classList.add('promote');
    } else {
      parentCol.classList.remove('promote');
    }
  }
});

// Handle pointerdown outside for dropdown
const handleClickOutside = (event: PointerEvent) => {
  if (
    dropdownRef.value &&
    !dropdownRef.value.contains(event.target as Node) &&
    containerRef.value &&
    !containerRef.value.contains(event.target as Node)
  ) {
    showDropdown.value = false;
  }
};

// Methods
const sanitizePaste = (e: ClipboardEvent) => {
  e.preventDefault();
  const text = e.clipboardData?.getData('text/plain') ?? '';
  document.execCommand('insertText', false, text);
};

const convertMarkdownToHtml = (markdown: string) => {
  const tempElement = document.createElement('div');
  tempElement.innerHTML = marked.parse(markdown) as string;
  const links = tempElement.getElementsByTagName('a');
  Array.from(links).forEach((link) => {
    link.setAttribute('target', '_blank');
  });
  return tempElement.innerHTML
    .replaceAll(/<\/?p>/g, '')
    .replace(/>\n/g, '>');
};

const renderToHtml = (value: string | undefined) => {
  if (!editable.value && value) {
    return convertMarkdownToHtml(value).replace(/\n/g, '<br>');
  }
  return value?.replace(/\n/g, '<br>') ?? '';
};

const moveCursorToEnd = (element: HTMLElement) => {
  element.focus();
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
};

const handleDoubleClick = () => {
  if (!editable.value) {
    editable.value = true;
    setTimeout(() => {
      if (contentEditableRef.value) {
        moveCursorToEnd(contentEditableRef.value);
        contentEditableRef.value.focus();
      }
    }, 100);
  }
};

const getValue = () => {
  if (!contentEditableRef.value) return '';
  return props.isText
    ? contentEditableRef.value.textContent?.trim() ?? ''
    : contentEditableRef.value.innerHTML
        .replace(/<[/]?div>/g, '')
        .replace(/\r/g, '\n');
};

const stopEditing = () => {
  if (timer.value) clearTimeout(timer.value);
  
  setTimeout(() => {
    showDropdown.value = false;
    editable.value = false;
    const newValue = getValue();
    emit('update:modelValue', newValue);
    
    if (newValue !== props.modelValue) {
      emit('change', newValue);
    }
  }, 500);
};

const insertNewLine = (event: KeyboardEvent) => {
  event.preventDefault();
  const selection = window.getSelection();
  if (!selection) return;
  
  const textNode = document.createElement('br');
  selection.getRangeAt(0).insertNode(textNode);
  selection.collapseToEnd();
};

const handleEnter = (event: KeyboardEvent) => {
  if (event.shiftKey) {
    insertNewLine(event);
  } else {
    contentEditableRef.value?.blur();
    emit('enter');
    stopEditing();
  }
};

const selectItem = (item: string) => {
  if (contentEditableRef.value) {
    contentEditableRef.value.innerHTML = item;
    contentEditableRef.value.focus();
    showDropdown.value = false;
    stopEditing();
  }
};

// Lifecycle hooks
onMounted(() => {
  if (editable.value && contentEditableRef.value) {
    contentEditableRef.value.focus();
  }
  window.addEventListener('pointerdown', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('pointerdown', handleClickOutside);
  if (timer.value) clearTimeout(timer.value);
});
</script>

<style scoped>
.editable-dropdown {
  position: relative;
  display: inline-block;
}

.dropdown {
  position: absolute;
  border: 1px solid #ccc;
  border-left: 2px solid green;
  padding: 0 10px;
  z-index: 9999;
}

.dropdown ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.dropdown-item {
  padding: 8px 12px;
  cursor: pointer;
}

.dropdown-item:hover {
  font-weight: bold;
}

.text {
  min-height: 1em;
  word-break: break-all;
  outline: none;
  flex-grow: 1;
}
</style>