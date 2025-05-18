<template>
  <div class="sticky bottom-0 left-0 z-[4] bg-white border-t border-gray-200 shadow-lg">
    <div class="max-w-screen-xl mx-auto px-4">
      <div class="flex flex-col sticky left-0 bottom-0 active">
        <Config v-if="showConfig" :config="config"></Config>
        <div class="flex flex-wrap items-center gap-2 py-3">
          <!-- Action Buttons -->
          <div class="flex items-center gap-2 pr-2 border-r border-gray-200">
            <button @click="addRow(1)" class="btn-primary">
              ＋ Add Row
            </button>
            <button @click="copyNode" class="btn-secondary">
              ⎘ Copy
            </button>
            <button v-if="selectDepths.length" @click="deleteSelectedNodes()" class="btn-danger">
              ✕ Delete {{ selectDepths.length }}
            </button>
          </div>

          <!-- Save/Export -->
          <div class="flex items-center gap-2 pr-2 border-r border-gray-200">
            <button @click="saveData(0)" class="btn-success">
              💾 Save
            </button>
            <button @click="download" class="btn-info">
              📤 Export
            </button>
          </div>

          <!-- Configuration -->
          <div class="flex items-center gap-2 pr-2 border-r border-gray-200">
            <button @click="showConfig = !showConfig" class="btn-secondary">
              ⚙ Config
            </button>
            <button v-if="false" @click="showConfig = !showConfig" class="btn-secondary">
              👥 Team
            </button>
          </div>

          <!-- File Operations -->
          <div class="flex items-center gap-2 pr-2 border-r border-gray-200">
            <button @click="openFile" class="btn-secondary">
              📂 Open
            </button>
            <input type="file" ref="fileInput" @change="loadFile" accept=".json" class="hidden" />

          </div>

          <!-- Data Operations -->
          <div class="flex items-center gap-2">
            <button @click="downloadSch" class="btn-secondary">
              📎 Export Sch
            </button>
            <button @click="exportCSV" class="btn-secondary">
              📊 CSV
            </button>
            <button @click="csvToMarkdown" class="btn-secondary">
              📝 Markdown
            </button>
            <button @click="copyClipboard" class="btn-warning">
              📋 Clipboard
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@reference "@/assets/main.css";

button {
  @apply px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-200;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.btn-secondary {
  @apply bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200;
}

.btn-danger {
  @apply bg-red-600 text-white hover:bg-red-700;
}

.btn-success {
  @apply bg-green-600 text-white hover:bg-green-700;
}

.btn-info {
  @apply bg-indigo-600 text-white hover:bg-indigo-700;
}

.btn-warning {
  @apply bg-purple-600 text-white hover:bg-purple-700;
}
</style>

<script setup>
import { ref, watch } from 'vue';
import { useConfigStore } from '@/stores/config';
import { useTree } from '@/components/tree/useTree';
import Config from '@/components/Config.vue';

const configStore = useConfigStore();
const treeRowsStore = useTree();

const {selectDepths} =treeRowsStore;
const showConfig = ref(false);
const config = ref(configStore.config);
const treeRoot = ref(treeRowsStore.rootObj);
const fileInput = ref(null);

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

function openFile() {
  fileInput.value.click();
}

function loadFile(event) {
  const file = event.target.files[0];
  if (file && file.type === "application/json") {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if(confirm("will overwrite current data,are you sure to continue?")){
        let data = JSON.parse(e.target.result);
        if (data && data.data && data.config) {
          localStorage.setItem('data', JSON.stringify(data.data));
          localStorage.setItem('config', JSON.stringify(data.config));
          location.reload();
        } else {
          throw new Error("wrong format");
        }
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

function download() {
  let data = JSON.parse(JSON.stringify(treeRoot.value));
  downloadJSON({ data, config: config.value, timestamp: new Date().getTime() });
}

function saveData(bool) {
  if (!bool || config.value.autoSave) {

    localStorage.setItem('data', JSON.stringify(treeRoot.value));
    localStorage.setItem('config', JSON.stringify(config.value));

  }
}

function deleteSelectedNodes() {
  if (confirm("Please confirm to delete it?")) {
    treeRowsStore.delSelectedNode();
    saveData(true);
  }
}

function addRow(num) {
  treeRowsStore.insertNode({ _id: '' });
}

function copyNode() {
  treeRowsStore.copySelectedNode();
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
  let text = treeRowsStore.exportCSV(config.value);
  dowloadText(text, "exportcsv.csv");

}
function csvToMarkdown() {
  // Split the CSV string into lines

  let csvString = treeRowsStore.exportCSV(config.value, true);
  const lines = csvString.trim().split('\n');

  // Split each line into columns
  const table = lines.map(line => line.split(',').map(item => item.trim()));

  // Create the Markdown table
  let markdown = [];

  // Header row
  const header = table[0];
  markdown.push('| ' + header.join(' | ') + ' |');

  // Separator row
  markdown.push('|-' + '-|-'.repeat(header.length - 1) + '-|');

  // Data rows
  for (let i = 1; i < table.length; i++) {
    markdown.push('| ' + table[i].join(' | ') + ' |');
  }
  let md = markdown.join('\n');
  console.log(md)

  navigator.clipboard.writeText(md).then(function () {
    console.log('Text copied to clipboard!');
  }).catch(function (err) {
    console.error('Could not copy text: ', err);
  });

  return markdown.join('\n');
}


function copyClipboard() {
  let text = treeRowsStore.exportCSV(config.value, false, '\t');

  navigator.clipboard.writeText(text).then(function () {
    console.log('Text copied to clipboard!');
  }).catch(function (err) {
    console.error('Could not copy text: ', err);
  });
}

// Watch for changes in dataRows
watch(
  () => treeRowsStore.dataRows,
  () => {
    saveData();
  },
  { deep: true }
);
</script>
