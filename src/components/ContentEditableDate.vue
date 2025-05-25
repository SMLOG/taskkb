<template>
  <div class="editable-dropdown" style="width: 100%; min-width: 1em;" @dblclick="dblclick">
    <VueDatePicker
      v-model="date"
      @update:modelValue="inputDate"
      placeholder="Start Typing ..."
      text-input
      auto-apply
    >
      <template #trigger>
        <div
          ref="contentEditable"
          :contenteditable="editable"
          @blur="stopEditing"
          @keydown.enter.prevent="handleEnter"
          @focus="startEditing"
          v-html="modelValue"
          class="text"
        ></div>
      </template>
    </VueDatePicker>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { format } from 'date-fns';

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
const emit = defineEmits(['update:modelValue', 'change', 'enter']);

// Reactive state
const date = ref(new Date());
const editable = ref(false);
const editing = ref(false);
const contentEditable = ref(null);

// Initialize date from modelValue
const initializeDate = () => {
  try {
    if (
      props.modelValue &&
      props.modelValue.trim() !== format(date.value, 'yyyy-MM-dd')
    ) {
      date.value = new Date(props.modelValue.trim());
    }
  } catch (ee) {
    console.error(ee);
  }
};

// Watch modelValue changes
watch(
  () => props.modelValue,
  () => {
    initializeDate();
  },
);

// On component mount
onMounted(() => {
  initializeDate();
  if (editing.value && contentEditable.value) {
    contentEditable.value.focus();
  }
});

// Methods
const formatDateToYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const inputDate = (event) => {
  if (event) {
    console.log(event);
    contentEditable.value.innerText = formatDateToYYYYMMDD(event);
    startEditing();
    stopEditing();
  }
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

const dblclick = () => {
  editable.value = true;
  setTimeout(() => {
    moveCursorToEnd(contentEditable.value);
  }, 100);
};

const startEditing = () => {
  editing.value = true;
  contentEditable.value.focus();
};

const getValue = () => {
  return props.isText
    ? contentEditable.value.textContent.trim()
    : contentEditable.value.innerHTML;
};

const stopEditing = () => {
    editing.value = false;
    editable.value = false;
    emit('update:modelValue', getValue());
    if (getValue() !== props.modelValue) {
      emit('change', getValue());
      console.log('changed', getValue());
    }
    console.log('stopEditing');
};

const handleEnter = () => {
  contentEditable.value.blur();
  emit('enter');
  stopEditing();
};

</script>

<style>
.editable-dropdown {
  position: relative;
  display: inline-block;
}

.editable-dropdown .dropdown {
  position: absolute;
  z-index: 1;
  background-color: #f9f9f9;
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
  background-color: #e5e5e5;
}

.editable-dropdown input {
  flex: 1;
  margin-right: 10px;
}

.dropdown {
  position: absolute;
  background: #ccc;
  border-left: 2px solid green !important;
  padding: 0 10px;
}

.text {
  min-height: 1em;
  word-break: break-all;
}

.dp__arrow_top {
  display: none;
}
</style>