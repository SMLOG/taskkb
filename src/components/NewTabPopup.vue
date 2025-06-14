<template>
  <div 
    class="fixed inset-0 flex items-center justify-center z-9999" 
    v-if="modelValue"
    @click.self="closePopup()">
 
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
        <input type="file" ref="fileInput" @change="loadFile" accept=".json" class="hidden" />

      </div>
      
      <!-- Beautiful "OR" Divider -->
<div class="flex items-center my-4"><div class="flex-grow border-t border-gray-300 dark:border-gray-600"></div><span class="mx-3 text-gray-500 dark:text-gray-400">or</span><div class="flex-grow border-t border-gray-300 dark:border-gray-600"></div></div>
      
      <!-- Template Selection -->
      <div>
        <h3 class="font-medium mb-2 text-gray-800 dark:text-gray-200">Choose a template:</h3>
        <div class="space-y-2">
          <button 
            v-for="template in templates" 
            :key="template.id"
            @click="selectTemplate(template)"
            class="w-full flex text-left p-3 border rounded-lg hover:bg-white/30 dark:hover:bg-gray-700/50 transition border-white/30 dark:border-gray-600/50 bg-white/20 dark:bg-gray-800/20"
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
      
      <!-- Enhanced Cancel Button -->
      <button 
        @click="closePopup"
        class="mt-6  w-full py-2 px-4 rounded-lg border border-red-400 dark:border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all flex items-center justify-center gap-2 font-medium"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        Cancel
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref,computed } from 'vue';
import { useAppStore } from "@/stores/appStore";
import { v4 as uuidv4 } from 'uuid';
import sample from '@/assets/sample';

const tabsStore = useAppStore();
const tabs = computed(() => tabsStore.tabs);

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
    name: 'Todo List',
    icon: '✓',
    description: 'Task list template',
    color: 'bg-blue-500',
  },
  {
    id: 2,
    name: 'Project Plan',
    icon: '🗓',
    description: 'Project Plan/Timeline',
    color: 'bg-green-500'
  },
  {
    id: 3,
    name: 'Blank',
    icon: '📝',
    description: 'A blank template',
    color: 'bg-purple-500'
  }
]);

const fileInput =ref(null)
const openFile = () => {
  fileInput.value.click();

};

function loadFile(event) {
  const file = event.target.files[0];
  if (file && file.type === "application/json") {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
          let data = JSON.parse(e.target.result);
          if (data && data.data && data.config) {
            const newTabId = uuidv4();

            useAppStore().importToNewTab(newTabId,data);
            emit('select-file');
            emit('update:modelValue', false);
          } else {
            throw new Error("wrong format");
          }
       
      } catch (error) {
        console.error("Invalid JSON file", error);
      }
    };
    reader.readAsText(file);
  } else {
    alert("Please select a valid JSON file.");
  }
}

function loopTree(tree, callback) {
  if (tree.id) {
    callback(tree);
  }
  
  if (tree._childs && Array.isArray(tree._childs)) {
    tree._childs.forEach(child => loopTree(child, callback));
  }
}

const selectTemplate = (template) => {
  emit('select-template', template);
  emit('update:modelValue', false);
  const tabName =  `${template.name} ${tabs.value.length + 1}`;
  const newTabId = uuidv4();

  let data = sample[template.id];
  if(data){
    data.config.startDate = new Date();
    data.config.title = tabName;
    data.config.cols.map(col=>col.id=uuidv4())
    loopTree(data.data,(node)=>node.id=uuidv4());
    useAppStore().importToNewTab(newTabId,data);
  }else{
    tabsStore.addTab(newTabId, tabName);
  }

};

const closePopup = () => {
  emit('update:modelValue', false);
};
</script>