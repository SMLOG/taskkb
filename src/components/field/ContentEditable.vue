<template>
  <div class="editable-dropdown h-full" ref="container" style="width: 100%;min-width: 1em;" @dblclick="dblclick">
    <div  class="flex flex-1 h-full justify-between">
      <div ref="contentEditable" :contenteditable="editable" @paste="sanitizePaste" @keydown.enter.prevent="handleEnter"
        @focus="showDropdown = true" class="text h-full flex-1" v-html="renderToHtml(modelValue)">
      </div>
      <div v-if="isText" class="h-full">
        <span>T</span>
      </div>
    </div>
    <div v-show="showDropdown && !isText && dropdownItems && dropdownItems.length" class="dropdown bg-white dark:bg-gray-800 z-9999">
      <ul>
        <li v-for="item in dropdownItems" :key="item" @click="selectItem(item)">
          {{ item }}
        </li>
      </ul>
    </div>
  </div>
  <div style="position:absolute;inset: 0;" @dblclick="dblclick" v-if="!editable" ></div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue';
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from 'highlight.js';

const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    }
  })
);


// Props
const props = defineProps({
  modelValue: {
    type: String,
    required: false,
  },
  isText: {
    type: Boolean,
    required: false,
  },
  dropdownItems: {
    type: Array,
    default: () => [],
  },
});

// Emits
const emit = defineEmits(['change', 'update:modelValue', 'enter']);

// Refs
const container = ref(null);
const contentEditable = ref(null);
const editing = ref(false);
const showDropdown = ref(false);
const editable = ref(false);
const timer = ref(null);

// Watchers
watch(showDropdown, (bool) => {
  if (bool) {
    contentEditable.value?.closest('.col')?.classList.add('promote');
  } else {
    contentEditable.value?.closest('.col')?.classList.remove('promote');
  }
});

// Methods
const sanitizePaste = (e) => {
  e.preventDefault();
  const text = e.clipboardData.getData('text/plain');
  document.execCommand('insertText', false, text);
};

const convertMarkdownToHtml = (markdown) => {
  const tempElement = document.createElement("div");
  tempElement.innerHTML = marked.parse(markdown);
  const links = tempElement.getElementsByTagName('a');
  for (let i = 0; i < links.length; i++) {
    links[i].setAttribute('target', '_blank');
  }
  return tempElement.innerHTML.replaceAll(/<\/?p>/g, '').replace(/>\n/g, '>');
};

const isHTMLSegment = (string) => {
  const parser = new DOMParser();
  const parsedDocument = parser.parseFromString(string, 'text/html');
  return parsedDocument.body.children.length > 0;
};

const renderToHtml = (modelValue) => {
  if (!editable.value) {
    if (modelValue) {
      return convertMarkdownToHtml(modelValue).replace(/\n/g, '<br>');
    }
  }
  return modelValue ? modelValue.replace(/\n/g, '<br>') : modelValue;
};

const moveCursorToEnd = (element) => {
  element.focus();
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
};

const handlerBlur = (event) => {
  const isClickInsideElement = container.value?.contains(event.target);
  if (!isClickInsideElement) {
    stopEditing();
  }
};

const dblclick = () => {
  if (!editable.value) {
    editable.value = true;
    setTimeout(() => {
      moveCursorToEnd(contentEditable.value);
      contentEditable.value?.focus();
    }, 100);
    document.addEventListener("click", handlerBlur);
  }
};

const startEditing = () => {
  editing.value = true;
};

const getValue = () => {
  return props.isText 
    ? contentEditable.value?.textContent.trim() 
    : contentEditable.value?.innerHTML.replace(/<[/]?div>/g, '').replace(/\r/g, '\n');
};

const stopEditing = () => {
  document.removeEventListener("click", handlerBlur);
  nextTick(() => {
    timer.value = setTimeout(() => {
      showDropdown.value = false;
      editing.value = false;
      editable.value = false;
      const newValue = getValue();
      emit('update:modelValue', newValue);
      if (newValue !== props.modelValue) {
        emit('change', newValue);
      }
    }, 500);
  });
};

const insertNewLine = (event) => {
  event.preventDefault();
  const selection = window.getSelection();
  const textNode = document.createElement('br');
  selection.getRangeAt(0).insertNode(textNode);
  selection.collapseToEnd();
};

const handleEnter = (event) => {
  if (event.key === 'Enter' && event.shiftKey) {
    insertNewLine(event);
  } else {
    contentEditable.value?.blur();
    emit('enter');
  }
};

const selectItem = (item) => {
  clearTimeout(timer.value);
  if (contentEditable.value) {
    contentEditable.value.focus();
    contentEditable.value.innerHTML = item;
    showDropdown.value = false;
  }
  stopEditing();
};

// Lifecycle
onMounted(() => {
  if (editing.value && contentEditable.value) {
    contentEditable.value.focus();
  }
});
</script>

<style scoped>
.editable-dropdown {
  position: relative;
  display: inline-block;
}

.editable-dropdown .dropdown {
  position: absolute;
  border: 1px solid #ccc;
}

.editable-dropdown .dropdown ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.editable-dropdown .dropdown ul li {
  padding: 8px 12px;
  cursor: pointer;
}

.editable-dropdown .dropdown ul li:hover {
  font-weight: bold;
}

.editable-dropdown input {
  flex: 1;
  margin-right: 10px;
}

.dropdown {
  position: absolute;
  border-left: 2px solid green !important;
  padding: 0 10px;
}

.text {
  min-height: 1em;
  word-break: break-all;
  outline: none;
}
</style>