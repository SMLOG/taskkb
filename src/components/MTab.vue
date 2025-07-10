<template>
  <div 
    class="tab mx-2 px-2 py-1.5 cursor-pointer font-medium rounded-md "
    :class="{ 
      'active bg-gray-100 dark:bg-gray-700': isActive,
      'hover:bg-gray-50 dark:hover:bg-gray-800': !isActive
    }" 
    @click="$emit('click')"
    @dblclick="startEditing"
  >
    <!-- Emoji and Title -->
    <div class="flex items-center">
      <span v-if="tab.emoji" class="flex-none mr-2 text-base">{{ tab.emoji }}</span>
      <span 
        v-if="!isEditing" 
        class="text-sm text-gray-800 dark:text-gray-200"
        :class="{ 'font-semibold': isActive }"
      >
        {{ tab.title }}
      </span>
      <input 
      v-else
        v-model="editedTitle"
        @blur="saveTitle"
        @keyup.enter="saveTitle"
        @keyup.esc="cancelEditing"
        ref="titleInput"
        class="px-2 py-0.5 dark:text-white text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        type="text"
      />
    </div>

    <!-- Unsaved indicator -->
    <div 
      v-if="!tab.saved" 
      class="absolute top-2.5 right-3 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"
    ></div>

    <!-- Close button (shown on hover) -->
    <button 
      class="close-btn absolute top-1/2 -translate-y-1/2 right-1 w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition-all duration-150 ease-in-out focus:outline-none"
      @click.stop="$emit('removeTab')"
      aria-label="Close tab"
    >
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';

const props = defineProps({
  tab: {
    type: Object,
    required: true,
  },
  isActive: Boolean,
});

const emit = defineEmits(['click', 'removeTab', 'update:tab']);

const isEditing = ref(false);
const editedTitle = ref('');
const titleInput = ref(null);

const startEditing = () => {
  isEditing.value = true;
  editedTitle.value = props.tab.title;
};

const saveTitle = () => {
  if (editedTitle.value.trim()) {
    emit('update:tab', { ...props.tab, title: editedTitle.value.trim() });
    props.tab.title = editedTitle.value.trim();
  }
  isEditing.value = false;
};

const cancelEditing = () => {
  isEditing.value = false;
  editedTitle.value = props.tab.title;
};


</script>

<style scoped>
.tab {
  transition: all 0.2s ease;
  max-width: 320px;
  min-width: 120px;
  width: max-content;
}

.tab.active {
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.05);
  @apply dark:shadow-none;
}

.close-btn {
  transform: translateY(-50%) scale(0.95);
}

.close-btn:hover {
  transform: translateY(-50%) scale(1);
}

</style>