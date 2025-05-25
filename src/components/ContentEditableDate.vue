<template>
  <div class="editable-dropdown" :style="{ width: '100%', minWidth: '1em' }" @dblclick="startEditing">
    <VueDatePicker
      v-model="date"
      @update:modelValue="handleDateChange"
      placeholder="Select or type a date..."
      text-input
      auto-apply
      :enable-time-picker="false"
      format="yyyy-MM-dd"
      :clearable="false"
    >
      <template #trigger>
        <div
          ref="contentEditable"
          :contenteditable="editable"
          @blur="stopEditing"
          @keydown.enter.prevent="handleEnter"
          @keydown.esc="stopEditing"
          @input="handleInput"
          v-html="formattedValue"
          class="text"
        ></div>
      </template>
    </VueDatePicker>
  </div>
</template>

<script setup>
import { ref, watch, computed, nextTick } from 'vue';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { format, parse } from 'date-fns';

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  isText: {
    type: Boolean,
    default: false,
  },
});

// Emits
const emit = defineEmits(['update:modelValue',  'enter']);

// Reactive state
const date = ref(null);
const editable = ref(false);
const contentEditable = ref(null);

// Computed
const formattedValue = computed(() => {
  return date && date.value && formatDateToYYYYMMDD(date.value);
});

// Initialize date from modelValue
const initializeDate = () => {
  if (!props.modelValue) return;
  try {
    const parsedDate = parse(props.modelValue, 'yyyy-MM-dd', new Date());
    if (!isNaN(parsedDate.getTime())) {
      date.value = parsedDate;
    }
  } catch (error) {
    console.warn('Invalid date format:', error);
  }
};

// Watch modelValue changes
watch(() => props.modelValue, initializeDate, { immediate: true });

// Methods
const formatDateToYYYYMMDD = (date) => {
  return format(date, 'yyyy-MM-dd');
};

const handleDateChange = (newDate) => {
  if (newDate) {
    const formatted = formatDateToYYYYMMDD(newDate);
    contentEditable.value.innerText = formatted;
    emitUpdate(formatted);
  }
};

const handleInput = () => {
  if (props.isText) {
    emitUpdate(contentEditable.value.textContent.trim());
  }
};

const emitUpdate = (value) => {
  emit('update:modelValue', value);
};

const moveCursorToEnd = async (element) => {
  await nextTick();
  element.focus();
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
};

const startEditing = async () => {
  if (!editable.value) {
    editable.value = true;
    await nextTick();
    if (contentEditable.value) {
      moveCursorToEnd(contentEditable.value);
    }
  }
};

const stopEditing = () => {
  if (editable.value) {
    editable.value = false;
    const value = contentEditable.value.textContent.trim();
    emitUpdate(value);
  }
};

const handleEnter = () => {
  emit('enter');
  stopEditing();
};
</script>

<style scoped>
.editable-dropdown {
  position: relative;
  display: inline-block;
}

.text {
  min-height: 1em;
  word-break: break-word;
  padding: 4px;
  border: 1px solid transparent;
  border-radius: 4px;
  outline: none;
}

.text:focus {
  border-color: #007bff;
  background: #fff;
}

:deep(.dp__input) {
  border: none;
  padding: 0;
}

:deep(.dp__arrow_top) {
  display: none;
}
</style>