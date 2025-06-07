<template>
  <div 
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" 
    v-if="showPopup"
  >
    <div class="bg-white rounded-lg p-6 w-96 shadow-xl">
      <h2 class="text-xl font-bold mb-4">Choose an option</h2>
      
      <!-- Open File Option -->
      <div class="mb-4">
        <button 
          @click="openFile"
          class="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition"
        >
          <span>Open existing file</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </button>
      </div>
      
      <!-- Or divider -->
      <div class="flex items-center my-4">
        <div class="flex-grow border-t border-gray-300"></div>
        <span class="mx-3 text-gray-500">or</span>
        <div class="flex-grow border-t border-gray-300"></div>
      </div>
      
      <!-- Template Selection -->
      <div>
        <h3 class="font-medium mb-2">Choose a template:</h3>
        <div class="space-y-2">
          <button 
            v-for="template in templates" 
            :key="template.id"
            @click="selectTemplate(template)"
            class="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition flex items-center"
          >
            <div class="w-8 h-8 rounded-full flex items-center justify-center mr-3" :class="template.color">
              <span class="text-white font-medium">{{ template.icon }}</span>
            </div>
            <div>
              <div class="font-medium">{{ template.name }}</div>
              <div class="text-xs text-gray-500">{{ template.description }}</div>
            </div>
          </button>
        </div>
      </div>
      
      <!-- Close button -->
      <button 
        @click="closePopup"
        class="mt-4 text-gray-500 hover:text-gray-700 transition"
      >
        Cancel
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const showPopup = ref(true);

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
  // Implement file opening logic
  console.log('Opening file...');
  showPopup.value = false;
  
  // For actual file selection:
  // const input = document.createElement('input');
  // input.type = 'file';
  // input.click();
  // input.onchange = (e) => { /* handle file */ };
};

const selectTemplate = (template) => {
  // Handle template selection
  console.log('Selected template:', template.name);
  showPopup.value = false;
  
  // You would typically emit an event here:
  // emit('template-selected', template);
};

const closePopup = () => {
  showPopup.value = false;
};

// If you need to emit events:
// const emit = defineEmits(['template-selected']);
</script>