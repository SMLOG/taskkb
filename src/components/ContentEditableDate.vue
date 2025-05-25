<template>
  <div class="editable-dropdown" @dblclick="startEditing">
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
      :class="{ 'is-editing': editable||isOpen }"
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
          class="text min-h-6"
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
  console.log(isOpen)
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
  editable.value = false; // Reset editable after date selection
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
    // In text mode, emit the raw input value
    emit('update:modelValue', value);
  } else {
    // In date mode, validate the input as a date
    const parsed = parseDate(value);
    if (parsed) {
      date.value = parsed;
      const formatted = format(parsed, 'yyyy-MM-dd');
      contentEditable.value.textContent = formatted;
      emit('update:modelValue', formatted);
    } else {
      // If invalid date, emit the raw value or reset to previous valid date
      emit('update:modelValue', date.value ? format(date.value, 'yyyy-MM-dd') : '');
    }
  }

  editable.value = false; // Explicitly reset editable state
  emit('enter'); // Emit enter event for parent component
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
.editable-dropdown {
  display: inline-block;
  width: 100%;
  min-width: 1em;
}

.text {
  word-break: break-word;
  padding: 4px;
  border: 1px solid transparent;
  border-radius: 4px;
  outline: none;
}

.is-editing .text {
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