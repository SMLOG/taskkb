<template>
  <div id="operation" class="sticky bottom-0 left-0 z-[50] bg-white dark:bg-gray-900 shadow-lg">
    <div class="max-w-screen-xl mx-auto px-4">
      <div class="flex flex-col sticky left-0 bottom-0 active">
        <Config v-if="showConfig" :config="configRef" :isOpen="showConfig" :close="()=>showConfig=false"></Config>
        <div class="flex flex-wrap items-center gap-2 py-3">
          <div class="flex items-center gap-2 pr-2 border-r border-gray-200 dark:border-gray-700">
            <button @click="addRow(1)" class="btn-secondary">
              ＋ Add Row
            </button>
            <button v-if="selectDepths.length==1" @click="copyNode" class="btn-secondary">
              ⎘ Copy
            </button>
            <button v-if="selectDepths.length" @click="deleteSelectedNodes()" class="btn-secondary">
              ✕ Delete {{ selectDepths.length }}
            </button>
          </div>

          <div class="flex items-center gap-2 pr-2 border-r border-gray-200 dark:border-gray-700">
            <button @click="saveData(0)" class="btn-secondary">
              💾 Save
            </button>
            <button @click="showConfig = !showConfig" class="btn-secondary">
              ⚙ Config
            </button>
          </div>

          <div class="flex items-center gap-2 pr-2 border-r border-gray-200 dark:border-gray-700">
            <button v-if="false" @click="showConfig = !showConfig" class="btn-secondary">
              👥 Team
            </button>
          </div>

          <div class="relative" @mouseleave="showDropdown = false" @blur="showDropdown = false">
            <button
              ref="moreButton"
              @mouseenter="handleShowDropdown"
              @focus="handleShowDropdown"
              @click="handleShowDropdown"
              class="btn-secondary"
            >
              ⋮ Export
            </button>
            <div
              v-show="showDropdown"
              :class="[
                'absolute left-0 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10',
                dropdownPosition === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'
              ]"
              tabindex="-1"
            >
              <button @click="download" class="btn-link w-full text-left px-3 py-2">
                📤 Export
              </button>
              <button  @click="exportCSV" class="btn-link w-full text-left px-3 py-2">
                📊 Selected to CSV
              </button>
              <button  @click="csvToMarkdown" class="btn-link w-full text-left px-3 py-2">
                📝 Selected to Markdown
              </button>
              <button @click="copyClipboard" class="btn-link w-full text-left px-3 py-2">
                📋 Selected to Clipboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@reference "@/assets/main.css";

button {
  @apply px-2 py-1 text-xs font-medium rounded-md transition-colors duration-200;
}

.btn-secondary {
  @apply bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200
         dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:border-gray-600;
}

.btn-info {
  @apply bg-indigo-600 text-white hover:bg-indigo-700
         dark:bg-indigo-500 dark:hover:bg-indigo-600;
}

.btn-warning {
  @apply bg-purple-600 text-white hover:bg-purple-700
         dark:bg-purple-500 dark:hover:bg-purple-600;
}

.btn-link {
  @apply text-blue-600 hover:text-blue-800 hover:bg-gray-100
         dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-gray-700 no-underline;
}
</style>

<script setup>
import { ref, watch,inject } from 'vue';
import { useTree } from '@/composables/useTree';
import Config from '@/components/Config.vue';
import { useAppStore } from "@/stores/appStore";
import { storeToRefs } from 'pinia'

const showNotification = inject('showNotification');

const tree = useTree();

const { selectDepths } = tree;
const showConfig = ref(false);
const {configRef,treeRef} = storeToRefs(useAppStore());


const showDropdown = ref(false);

function downloadJSON(jsonData, filename = 'data.json') {
  const jsonString = JSON.stringify(jsonData);
  const encodedJsonString = encodeURIComponent(jsonString);
  const downloadLink = document.createElement("a");
  downloadLink.setAttribute("href", "data:application/json;charset=utf-8," + encodedJsonString);
  downloadLink.setAttribute("download", filename);
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}
const moreButton = ref(null);
const dropdownPosition = ref('top');
const DROPDOWN_HEIGHT = 200;

const handleShowDropdown = () => {
  if (!moreButton.value) return;

  const rect = moreButton.value.getBoundingClientRect();
  const spaceAbove = rect.top;
  const spaceBelow = window.innerHeight - rect.bottom;

  dropdownPosition.value = spaceAbove < DROPDOWN_HEIGHT && spaceBelow >= DROPDOWN_HEIGHT ? 'bottom' : 'top';
  showDropdown.value = true;
};



function download() {

  let data = JSON.parse(JSON.stringify(treeRef.value));
  configRef.value.title=useAppStore().getCurrentTab().title;
  downloadJSON({ data, config: configRef.value, timestamp: new Date().getTime() },useAppStore().getCurrentTab().title+".json");
}

function saveData(bool) {
  if (!bool || configRef.value.autoSave) {
    useAppStore().saveConfig();
    useAppStore().saveData();
  }
}

function deleteSelectedNodes() {
  if (confirm("Please confirm to delete it?")) {
    tree.delSelectedNode();
    saveData(true);
  }
}

function addRow(num) {
  tree.insertNode({ _id: '' });
}

function copyNode() {
  tree.copySelectedNode();
}

function dowloadText(text, name) {
  let link = document.createElement("a");
  link.setAttribute("download", name);
  link.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  document.body.append(link);
  link.click();
  document.body.removeChild(link);
}

function exportCSV() {
  let text = tree.exportCSV(configRef.value);
  dowloadText(text, "exportcsv.csv");
  showNotification('export CSV', 'success');
}

function csvToMarkdown() {
  let csvString = tree.exportCSV(configRef.value, true);
  const lines = csvString.trim().split('\n');
  const table = lines.map(line => line.split(',').map(item => item.trim()));
  let markdown = [];
  const header = table[0];
  markdown.push('| ' + header.join(' | ') + ' |');
  markdown.push('|-' + '-|-'.repeat(header.length - 1) + '-|');
  for (let i = 1; i < table.length; i++) {
    markdown.push('| ' + table[i].join(' | ') + ' |');
  }
  let md = markdown.join('\n');
  navigator.clipboard.writeText(md).then(function () {
    console.log('Text copied to clipboard!');
    showNotification('copied to clipboard!', 'success');

  }).catch(function (err) {
    console.error('Could not copy text: ', err);
  });
  return markdown.join('\n');
}

function copyClipboard() {
  let text = tree.exportCSV(configRef.value, false, '\t');
  navigator.clipboard.writeText(text).then(function () {
    console.log('Text copied to clipboard!');
    showNotification('copied to clipboard!', 'success');

  }).catch(function (err) {
    console.error('Could not copy text: ', err);
  });
}

watch(
  () => tree.treeRef,
  () => {
    saveData();
  },
  { deep: true }
);
</script>