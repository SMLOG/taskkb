<template>
  <div 
    class="fixed inset-0 flex items-center justify-center z-50" 
    v-if="modelValue"
  >
    <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-lg p-6 w-96 shadow-xl border border-white/20 dark:border-gray-700/30">
      <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Choose an option</h2>
      
      <!-- Open File Option -->
      <div class="mb-4">
        <button 
          @click="openFile"
          class="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-white/30 dark:hover:bg-gray-700/50 transition border-white/30 dark:border-gray-600/50 bg-white/20 dark:bg-gray-800/20"
        >
          <span class="text-gray-800 dark:text-gray-200">Open existing file</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </button>
      </div>
      
      <!-- Or divider -->
      <div class="flex items-center my-4">
        <div class="flex-grow border-t border-white/30 dark:border-gray-600/50"></div>
        <span class="mx-3 text-gray-500 dark:text-gray-400">or</span>
        <div class="flex-grow border-t border-white/30 dark:border-gray-600/50"></div>
      </div>
      
      <!-- Template Selection -->
      <div>
        <h3 class="font-medium mb-2 text-gray-800 dark:text-gray-200">Choose a template:</h3>
        <div class="space-y-2">
          <button 
            v-for="template in templates" 
            :key="template.id"
            @click="selectTemplate(template)"
            class="w-full text-left p-3 border rounded-lg hover:bg-white/30 dark:hover:bg-gray-700/50 transition border-white/30 dark:border-gray-600/50 bg-white/20 dark:bg-gray-800/20"
          >
            <div class="w-8 h-8 rounded-full flex items-center justify-center mr-3" :class="template.color">
              <span class="text-white font-medium">{{ template.icon }}</span>
            </div>
            <div>
              <div class="font-medium text-gray-800 dark:text-gray-200">{{ template.name }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">{{ template.description }}</div>
            </div>
          </button>
        </div>
      </div>
      
      <!-- Close button -->
      <button 
        @click="closePopup"
        class="mt-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition"
      >
        Cancel
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'select-file', 'select-template']);

const templates = ref([
  {
    id: 1,
    name: 'Todo',
    icon: '✓',
    description: 'Task list template',
    color: 'bg-blue-500'
  },
  {
    id: 2,
    name: 'Plan',
    icon: '🗓',
    description: 'Planning template',
    color: 'bg-green-500'
  },
  {
    id: 3,
    name: 'Record',
    icon: '📝',
    description: 'Note-taking template',
    color: 'bg-purple-500'
  }
]);

const openFile = () => {
  emit('select-file');
  emit('update:modelValue', false);
};

const selectTemplate = (template) => {
  emit('select-template', template);
  emit('update:modelValue', false);
};

const closePopup = () => {
  emit('update:modelValue', false);
};
</script>