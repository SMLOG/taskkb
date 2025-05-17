<template>
  <div style="
        bottom: 0;
        left: 0;
        z-index: 4;
        background: white;
        user-select: none;
        position: sticky;
      ">
    <div style="display: grid;grid-template-columns: auto 1fr;">
      <div style="display: flex;flex-direction: column; position: sticky;left: 0;bottom:0;">
        <Config v-if="showConfig" :config="config"></Config>
        <div style="display: flex;height: 30px;">
          <a @click="addRow(1)">Add Row</a>
          <a @click="deleteSelectedNodes()">Delete Row</a>
          <a @click="saveData(0)">Save</a>
          <a @click="showConfig = !showConfig">Configuration</a>
          <a @click="showConfig = !showConfig">Team</a>
          <a @click="download">Export</a>
          <a @click="overImport">Import</a>
          <input type="file" ref="fileInput" @change="handleFileUpload" accept=".json" style="display: none;" />
          <a @click="downloadSch">Export Sch</a>
          <a  @click="copyRow">Copy</a>
          <a  @click="exportCSV">Export CSV</a>
          <a  @click="csvToMarkdown">MD</a>
          
          <a  @click="copyClipboard">Clipboard</a>
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

// Initialize stores
const configStore = useConfigStore();
const treeRowsStore = useTree();

// Reactive state
const showConfig = ref(false);
const config = ref(configStore.config);
const treeRoot = ref(treeRowsStore.rootObj);
const fileInput = ref(null);



// Utility function to download JSON
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

// Methods
function overImport() {
  fileInput.value.click();
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file && file.type === "application/json") {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let data = JSON.parse(e.target.result);
        if (data && data.data && data.config) {
          localStorage.setItem('data', JSON.stringify(data.data));
          localStorage.setItem('config', JSON.stringify(data.config));
          location.reload();
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

function download() {
  let data = JSON.parse(JSON.stringify(treeRoot.value, (key, value) => {
    if (key === "_p") {
      return null;
    }
    return value;
  }));
  downloadJSON({ data, config: config.value, timestamp: new Date().getTime() });
}

function saveData(bool) {
  if (!bool || config.value.autoSave) {
    treeRowsStore.save();
    configStore.save();
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

function copyRow() {
  treeRowsStore.copyRow();
}

function exportCSV() {
  treeRowsStore.exportCSV(config.value);
}
function csvToMarkdown() {
    // Split the CSV string into lines

    let csvString = treeRowsStore.exportCSV(config.value,true);
    const lines = csvString.trim().split('\n');
    
    // Split each line into columns
    const table = lines.map(line => line.split(',').map(item => item.trim()));
    
    // Create the Markdown table
    let markdown = [];
    
    // Header row
    const header = table[0];
    markdown.push('| ' + header.join(' | ') + ' |');
    
    // Separator row
    markdown.push('|-' + '-|-' .repeat(header.length - 1) + '-|');
    
    // Data rows
    for (let i = 1; i < table.length; i++) {
        markdown.push('| ' + table[i].join(' | ') + ' |');
    }
    let md = markdown.join('\n');
    console.log(md)

    navigator.clipboard.writeText(md).then(function() {
      console.log('Text copied to clipboard!');
  }).catch(function(err) {
      console.error('Could not copy text: ', err);
  });

    return markdown.join('\n');
}


function copyClipboard() {
  treeRowsStore.copyClipboard(config.value);
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