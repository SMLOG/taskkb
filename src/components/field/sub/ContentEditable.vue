<template>
  <div class="editable-dropdown h-full" ref="container" style="width: 100%;min-width: 1em;" @dblclick="dblclick">
    <div  class="flex flex-1 h-full justify-between">
      <div ref="contentEditable" @dblclick="dblclick" @click="handleEditorClick"  :contenteditable="editable" @paste="sanitizePaste" @keyup.enter="handleEnterUp"  @keydown.enter="handleEnterDown"
        @focus="showDropdown = true" class="text h-full flex-1" :class="`${editable?'mr-3':''}`" v-html="truncateText(modelValue)">
      </div>
      <div v-if="showMoreLess&false">Less</div>
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
  class="absolute min-w-[100px]  w-full max-w-md mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-8 transition-all duration-300 ease-in-out"
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
  <div class="absolute inset-0 select-none m" @dblclick="dblclick" v-if="false&&!editable" ></div>
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

function convertUrlsToLinks(text) {
  // Regular expression to match URLs, domains, and subdomains with a broader range of TLDs
  const urlRegex = /(\b(https?:\/\/|www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s<>"']*)*\b)/gi;

  return text.replace(urlRegex, (url) => {
    // Add https:// if no protocol is present
    const href = url.match(/^(https?:\/\/)/i) ? url : `https://${url}`;
    return `<a href="${href}" target="_blank">${url}</a>`;
  });
}



const convertMarkdownToHtml = (markdown) => {
  const tempElement = document.createElement("div");
  let content = convertUrlsToLinks(markdown);

  try{

  tempElement.innerHTML = marked.parse(content);
  }catch(e){
 tempElement.innerHTML =content;
  }
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

function truncateHTMLWithLinks(html, charLimit) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  let charCount = 0;
  let shouldTruncate = false;
  const truncatedNodes = [];

  function processNode(node) {
    if (shouldTruncate) return;

    if (node.nodeType === Node.TEXT_NODE) {
      const remainingChars = charLimit - charCount;
      if (remainingChars <= 0) {
        shouldTruncate = true;
        return;
      }

      if (node.textContent.length > remainingChars) {
        const truncatedText = node.textContent.substring(0, remainingChars);
        const newNode = document.createTextNode(truncatedText /*+ '...'*/);
        truncatedNodes.push({
          parent: node.parentNode,
          original: node,
          newNode,
          nextSibling: node.nextSibling
        });
        node.parentNode.replaceChild(newNode, node);
        charCount += remainingChars;
        shouldTruncate = true;
      } else {
        charCount += node.textContent.length;
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Skip certain elements that don't contain visible text
      if (['br', 'hr', 'img'].includes(node.tagName.toLowerCase())) {
        return;
      }
      
      // Process child nodes
      const children = Array.from(node.childNodes);
      for (const child of children) {
        processNode(child);
        if (shouldTruncate) {
          // Remove remaining siblings in this parent
          let next = child.nextSibling;
          while (next) {
            const toRemove = next;
            next = next.nextSibling;
            node.removeChild(toRemove);
          }
          break;
        }
      }
    }
  }

  // Process all top-level nodes
  const children = Array.from(tempDiv.childNodes);
  for (const child of children) {
    processNode(child);
    if (shouldTruncate) {
      // Remove remaining top-level siblings
      let next = child.nextSibling;
      while (next) {
        const toRemove = next;
        next = next.nextSibling;
        tempDiv.removeChild(toRemove);
      }
      break;
    }
  }

  // Apply any text node truncations
  for (const {parent, newNode, nextSibling} of truncatedNodes) {
    let node = nextSibling;
    while (node) {
      const next = node.nextSibling;
      parent.removeChild(node);
      node = next;
    }
  }

  return tempDiv.innerHTML+(shouldTruncate?"<span class='show more'>...</span>":"");
}

const showMoreLess = ref(false);
function handleEditorClick(event){
  if(event.target.classList.contains('show')){
   const isMore = event.target.classList.contains('more');
    event.target.classList.remove(isMore?'more':'less');
    event.target.classList.add(isMore?'less':'more');
    event.target.innerHTML=isMore?'Less':'More';
    showMoreLess.value = !showMoreLess.value;

  }
}

function truncateText(modelValue){
  if( modelValue==undefined)return "";
  
  const html = renderToHtml(modelValue)

  if(editable.value)return html;
  if(showMoreLess.value){
    return html+"<span class='show less'>(Less)</span>"
  }
  return html;
  //return truncateHTMLWithLinks(html,100);
}


const moveCursorToEnd = (element) => {
  element.focus();
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
};

const handlerBlur = async (event) => {
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
    : contentEditable.value?.innerHTML.replace(/<div.*?>(.*?)<\/div>/gi, '\n$1').replace(/\r/g, '\n');
};

const stopEditing = async () => {
  document.removeEventListener("click", handlerBlur);
  await nextTick();
      showDropdown.value = false;
      editing.value = false;
      editable.value = false;
      const newValue = getValue();
      emit('update:modelValue', newValue);
      if (newValue !== props.modelValue) {
        emit('change', newValue);
      }

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

const handleEnterDown = async (event) => {
  if (event.key === 'Enter' && event.shiftKey) {
    event.preventDefault();
    insertNewLine(event);
    return false; 
  } else {

    //contentEditable.value?.blur();
    //editable.value=showDropdown.value=false;

  const event = new KeyboardEvent('keyup', {
    key: "Enter",
    bubbles: true,
    cancelable: true,
  });
   contentEditable.value.dispatchEvent(event);

    emit('enter');
    await stopEditing();

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