<template>
  <div class="sticky bottom-0 left-0 z-[4] bg-white select-none">
    <div class="grid grid-cols-[auto_1fr]">
      <div class="flex flex-col sticky left-0 bottom-0">
        <Config v-if="showConfig" :config="config"></Config>
        <div class="flex h-8 gap-2 p-1 bg-gray-50 border-t border-gray-200">
          <a @click="addRow(1)"
            class="px-3 py-1 bg-white border rounded-md shadow-sm hover:bg-gray-100 cursor-pointer text-sm">
            Add Row
          </a>
          <a @click="deleteSelectedNodes()"
            class="px-3 py-1 bg-white border rounded-md shadow-sm hover:bg-gray-100 cursor-pointer text-sm">
            Delete Row
          </a>
          <a @click="saveData(0)"
            class="px-3 py-1 bg-blue-50 border border-blue-200 rounded-md shadow-sm hover:bg-blue-100 cursor-pointer text-sm text-blue-600">
            Save
          </a>
          <a @click="showConfig = !showConfig"
            class="px-3 py-1 bg-white border rounded-md shadow-sm hover:bg-gray-100 cursor-pointer text-sm">
            Configuration
          </a>
          <a @click="showConfig = !showConfig"
            class="px-3 py-1 bg-white border rounded-md shadow-sm hover:bg-gray-100 cursor-pointer text-sm">
            Team
          </a>
          <a @click="download"
            class="px-3 py-1 bg-green-50 border border-green-200 rounded-md shadow-sm hover:bg-green-100 cursor-pointer text-sm text-green-600">
            Export
          </a>
          <a @click="openFile"
            class="px-3 py-1 bg-white border rounded-md shadow-sm hover:bg-gray-100 cursor-pointer text-sm">
            Open
          </a>
          <input type="file" ref="fileInput" @change="loadFile" accept=".json" class="hidden" />
          <a @click="downloadSch"
            class="px-3 py-1 bg-white border rounded-md shadow-sm hover:bg-gray-100 cursor-pointer text-sm">
            Export Sch
          </a>
          <a @click="copyNode"
            class="px-3 py-1 bg-white border rounded-md shadow-sm hover:bg-gray-100 cursor-pointer text-sm">
            Copy
          </a>
          <a @click="exportCSV"
            class="px-3 py-1 bg-white border rounded-md shadow-sm hover:bg-gray-100 cursor-pointer text-sm">
            Export CSV
          </a>
          <a @click="csvToMarkdown"
            class="px-3 py-1 bg-white border rounded-md shadow-sm hover:bg-gray-100 cursor-pointer text-sm">
            MD
          </a>
          <a @click="copyClipboard"
            class="px-3 py-1 bg-purple-50 border border-purple-200 rounded-md shadow-sm hover:bg-purple-100 cursor-pointer text-sm text-purple-600">
            Clipboard
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useConfigStore } from '@/stores/config';
import { useTree } from '@/components/tree/useTree';
import Config from '@/components/Config.vue';

const configStore = useConfigStore();
const treeRowsStore = useTree();

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

<style scoped>
a {
  cursor: pointer;
}
</style>