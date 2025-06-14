<template>
  <div class="editable-dropdown flex-1 h-full" @dblclick="startEditing">
    <VueDatePicker
      v-model="date"
      ref="datePicker"
      @open="onOpen"
      @blur="onClose"
      @update:model-value="handleDateChange"
      @calendar-close="stopEditing"
      placeholder="Select or type a date..."
      text-input
      auto-apply
      :enable-time-picker="false"
      format="yyyy-MM-dd"
      :clearable="false"
      :class="{ 'is-editing': editable || isOpen }"
    >
      <template #trigger>
        <div
          ref="contentEditable"
          :contenteditable="editable"
          @blur="stopEditing"
          @focusout="stopEditing"
          @keydown.enter.prevent="handleEnter"
          @keydown.esc="stopEditing"
          @input="handleInput"
          v-html="formattedValue"
          class="text min-h-6 flex-1"
        ></div>
      </template>
    </VueDatePicker>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { format, parse, isValid } from 'date-fns';

// Props
const props = defineProps({
  modelValue: String,
  isText: Boolean,
});

// Emits
const emit = defineEmits(['update:modelValue', 'enter']);

// Reactive state
const date = ref(null);
const editable = ref(false);
const contentEditable = ref(null);
const datePicker = ref(null);
const isOpen = ref(false);
const onOpen = () => {
  isOpen.value = true;
};
const onClose = () => {
  isOpen.value = false;
};

// Computed
const formattedValue = computed(() => {
  return date.value ? format(date.value, 'yyyy-MM-dd') : '';
});

// Parse date
const parseDate = (value) => {
  if (!value) return null;
  const parsed = parse(value, 'yyyy-MM-dd', new Date());
  return isValid(parsed) ? parsed : null;
};

// Watch modelValue
watch(
  () => props.modelValue,
  (value) => {
    date.value = parseDate(value);
  },
  { immediate: true }
);

// Methods
const handleDateChange = (newDate) => {
  if (!newDate) return;
  const formatted = format(newDate, 'yyyy-MM-dd');
  if (contentEditable.value) {
    contentEditable.value.textContent = formatted;
  }
  emit('update:modelValue', formatted);
  editable.value = false;
  onClose();
};

const handleInput = () => {
  if (!props.isText) return;
  const value = contentEditable.value.textContent.trim();
  emit('update:modelValue', value);
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

const startEditing = () => {
  if (editable.value) return;
  editable.value = true;
  if (contentEditable.value) {
    moveCursorToEnd(contentEditable.value);
  }
};

const stopEditing = () => {
  onClose();
  if (!editable.value) return;
  editable.value = false;

  if (contentEditable.value) {
    const value = contentEditable.value.textContent.trim();
    emit('update:modelValue', value);
  }
};

const handleEnter = () => {
  datePicker?.value?.closeMenu();
  onClose();
  if (!editable.value || !contentEditable.value) {
    emit('enter');
    return;
  }

  const value = contentEditable.value.textContent.trim();
  if (props.isText) {
    emit('update:modelValue', value);
  } else {
    const parsed = parseDate(value);
    if (parsed) {
      date.value = parsed;
      const formatted = format(parsed, 'yyyy-MM-dd');
      contentEditable.value.textContent = formatted;
      emit('update:modelValue', formatted);
    } else {
      emit('update:modelValue', date.value ? format(date.value, 'yyyy-MM-dd') : '');
    }
  }

  editable.value = false;
  emit('enter');
};

// Handle clicks outside
onMounted(() => {
  const handleOutsideClick = (event) => {
    if (
      editable.value &&
      contentEditable.value &&
      !contentEditable.value.contains(event.target) &&
      !event.target.closest('.dp__calendar') &&
      !event.target.closest('.dp__input')
    ) {
      stopEditing();
    }
  };
  document.addEventListener('mousedown', handleOutsideClick);
  onUnmounted(() => document.removeEventListener('mousedown', handleOutsideClick));
});

// Cleanup on unmount
onUnmounted(() => {
  if (editable.value) {
    stopEditing();
  }
});
</script>

<style scoped>
@reference "@/assets/main.css";

.text {
  min-height: 1em;
  word-break: break-all;
  outline: none;
  flex-grow: 1;
}

.editable-dropdown {
  @apply inline-block w-full min-w-[1em];
}

:deep(.dp__input) {
  @apply border-none p-0 bg-transparent text-gray-900 dark:text-gray-100;
}

:deep(.dp__calendar) {
  @apply bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100;
  @apply border-gray-300 dark:border-gray-600;
}

:deep(.dp__menu) {
  @apply bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600;
}

:deep(.dp__calendar_item) {
  @apply text-gray-900 dark:text-gray-100;
}

:deep(.dp__active_date) {
  @apply bg-blue-500 text-white dark:bg-blue-600;
}

:deep(.dp__today) {
  @apply border-blue-500 dark:border-blue-400;
}

:deep(.dp__arrow_top) {
  @apply hidden;
}
</style>