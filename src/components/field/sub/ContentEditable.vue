<template>
  <div class="editable-dropdown h-full" ref="container" style="width: 100%;min-width: 1em;" @dblclick="dblclick">
    <div  class="flex flex-1 h-full justify-between">
      <div ref="contentEditable" :contenteditable="editable" @paste="sanitizePaste" @keyup.enter="handleEnterUp"  @keydown.enter="handleEnterDown"
        @focus="showDropdown = true" class="text h-full flex-1" v-html="renderToHtml(modelValue)">
      </div>
      <div v-if="editable" class="dropdown-toggle absolute right-0 top-0 flex items-center justify-between p-0 mt-1 py-0 bg-white dark:bg-gray-800 border-none border-gray-300 dark:border-gray-600 rounded-md" @click="toggleDropdown">
        <svg class="w-3 h-3 m-0 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
      <div v-if="isText" class="h-full">
        <span>T</span>
      </div>
    </div>
    <div
  v-show="showDropdown && !isText && dropdownItems && dropdownItems.length"
  class="absolute  w-full max-w-md mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-6 transition-all duration-300 ease-in-out"
>
  <ul class="py-2">
    <li
      v-for="item in dropdownItems"
      :key="item"
      @click="selectItem(item)"
      class="px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200"
    >
      {{ item }}
    </li>
  </ul>
</div>
  </div>
  <div class="absolute inset-0 select-none m" @dblclick="dblclick" v-if="!editable" ></div>
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



const getValue = () => {
  return props.isText 
    ? contentEditable.value?.textContent.trim() 
    : contentEditable.value?.innerHTML.replace(/<[/]?div>/g, '').replace(/\r/g, '\n');
};

const stopEditing = () => {
  document.removeEventListener("click", handlerBlur);
  nextTick(() => {
      showDropdown.value = false;
      editing.value = false;
      editable.value = false;
      const newValue = getValue();
      emit('update:modelValue', newValue);
      if (newValue !== props.modelValue) {
        emit('change', newValue);
      }
  });
};

const insertNewLine = (event) => {
  event.preventDefault();
  const selection = window.getSelection();
  
  if (!selection.rangeCount) return;
  
  const range = selection.getRangeAt(0);
  
  const fragment = document.createDocumentFragment();
  fragment.appendChild(document.createElement('br'));
  const zwsp = document.createTextNode('\u200B'); 
  fragment.appendChild(zwsp);
  
  range.insertNode(fragment);
  
  const newRange = document.createRange();
  newRange.setStart(zwsp, 1);
  newRange.collapse(true);
  
  selection.removeAllRanges();
  selection.addRange(newRange);
};

const handleEnterDown = (event) => {
  if (event.key === 'Enter' && event.shiftKey) {
    event.preventDefault();
    insertNewLine(event);
    return false; 
  } else {

    contentEditable.value?.blur();
  const event = new KeyboardEvent('keyup', {
    key: "Enter",
    bubbles: true,
    cancelable: true,
  });
   contentEditable.value.dispatchEvent(event);

    emit('enter');
    return true; 
  }
};

const handleEnterUp = (event) => {
  console.log('Enter released');

    return true
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