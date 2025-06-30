<template>

  <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Choose an option</h2>

  <div class="mb-4">
    <button @click="openFile"
      class="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-white/30 dark:hover:bg-gray-700/50 transition border-white/30 dark:border-gray-600/50 bg-white/20 dark:bg-gray-800/20">
      <span class="text-gray-800 dark:text-gray-200">Import from existing file</span>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none"
        viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    </button>
    <input type="file" ref="fileInput" @change="selectTemplate" accept=".json" class="hidden" />
    <button @click="startImportFromJson"
      class="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-white/30 dark:hover:bg-gray-700/50 transition border-white/30 dark:border-gray-600/50 bg-white/20 dark:bg-gray-800/20">
      <span class="text-gray-800 dark:text-gray-200">Import from JSON file</span>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none"
        viewBox="0 0 24 24" stroke="currentColor">
        <!-- JSON curly braces icon -->
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M14 3v4a1 1 0 001 1h4m-5 10h-4a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V16a2 2 0 01-2 2h-1" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M7 9v2a1 1 0 01-1 1H5m0 3v-2a1 1 0 011-1h1" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M17 9v2a1 1 0 001 1h1m0 3v-2a1 1 0 00-1-1h-1" />
      </svg>
    </button>
  </div>

  <div class="flex items-center my-4">
    <div class="flex-grow border-t border-gray-300 dark:border-gray-600"></div><span
      class="mx-3 text-gray-500 dark:text-gray-400">or</span>
    <div class="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
  </div>

  <div>
    <h3 class="font-medium mb-2 text-gray-800 dark:text-gray-200">Choose a template:</h3>
    <div class="space-y-2">
      <button v-for="template in templates" :key="template.id" @click="selectTemplate($event, template)"
        class="w-full flex text-left p-3 border rounded-lg hover:bg-white/30 dark:hover:bg-gray-700/50 transition border-white/30 dark:border-gray-600/50 bg-white/20 dark:bg-gray-800/20">
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

  <button @click="closePopup"
    class="mt-6  w-full py-2 px-4 rounded-lg border border-red-400 dark:border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all flex items-center justify-center gap-2 font-medium">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
    Cancel
  </button>


</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import { useAppStore } from "@/stores/appStore";
import { v4 as uuidv4 } from 'uuid';
import sample from '@/assets/sample';
import { loopTree } from '@/lib/treelib';
import { deepClone, jsonParse } from '@/lib/parse';
import { showDialog } from '@/composables/useSystem';
import JsonDataMapper from '@/data/JsonDataMapper.vue';


const appStore = useAppStore();
const tabs = computed(() => appStore.tabs);


const props = defineProps({
  params: {
  }
});

const emit = defineEmits(['update:modelValue', 'select-file', 'select-template', "confirm", "cancel"]);

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

const fileInput = ref(null)
const openFile = () => {
  fileInput.value.click();

};

async function startImportFromJson() {
  const { headers, rows } = await showDialog(JsonDataMapper, null, { size: '2md', backdrop: false });
  if (headers && rows) {
    const newTabId = uuidv4();
    const tabName = `New Tab ${tabs.value.length + 1}`;
    const data = {
      config: {
        title: tabName,
        startDate: new Date(),
        cols: headers.map((header, index) => ({
          id: uuidv4(),
          fn: index + 1,
          name: header['name'],
          cp: 'ColDropText',
          sticky: false,
          show: true,
          width: 100, field: {}
        }))
      },
      data: {
        _childs: rows.map((row, rowIndex) => {
          const newRow = { id: uuidv4() };
          headers.forEach((cell, cellIndex) => {
            newRow[`c${cellIndex + 1}`] = "" + row[cell.id];
          });
          return newRow;
        })
      }
    };
    useAppStore().importToNewTab(newTabId, data);
    emit('confirm');
  }

}
function loadFile(event) {
  const file = event.target.files[0];
  if (file && file.type === "application/json") {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let data = jsonParse(e.target.result);
        if (data && data.data && data.config) {
          const newTabId = uuidv4();

          useAppStore().importToNewTab(newTabId, data);
          emit('select-file');
          emit('update:modelValue', false);
        } else {
          throw new Error("wrong format");
        }

      } catch (error) {
        console.error("Invalid JSON file", error);
        alert("Invalid JSON file")
      }
    };
    reader.readAsText(file);
    return;
  } else {
    alert("Please select a valid JSON file.");
  }
}



const selectTemplate = async (event, template) => {

  if (template) {

    emit('select-template', template);
    emit('update:modelValue', false);
    const tabName = `${template.name} ${tabs.value.length + 1}(New)`;
    const newTabId = uuidv4();

    let data = deepClone(sample[template.id]);
    if (data) {
      data.config.startDate = new Date();
      data.config.title = tabName;
      data.config.cols.map(col => col.id = uuidv4());
      loopTree(data.data, (node) => node.id = uuidv4());
      useAppStore().importToNewTab(newTabId, data);

    } else {
      appStore.addTab(newTabId, tabName);
    }
  } else {
    loadFile(event);
  }
  await nextTick();
  emit('confirm');


};

const closePopup = () => {
  emit('cancel', false);
};
</script>