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
          <a @click="deleteRow()">Delete Row</a>
          <a @click="saveData(0)">Save</a>
          <a @click="showConfig = !showConfig">Configuration</a>
          <a @click="showConfig = !showConfig">Team</a>
          <a @click="download">Export</a>
          <a @click="overImport">Import</a>
          <input type="file" ref="fileInput" @change="handleFileUpload" accept=".json" style="display: none;" />
          <a @click="downloadSch">Export Sch</a>
          <a v-if="selectRowsIndex && selectRowsIndex.length === 1" @click="copyRow">Copy</a>
          <a v-if="selectRowsIndex && selectRowsIndex.length === 1" @click="exportCSV">Export CSV</a>
          <a v-if="selectRowsIndex && selectRowsIndex.length === 1" @click="copyClipboard">Clipboard</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useConfigStore } from '@/stores/config';
import { useDataRowsStore } from '@/stores/dataRows';
import Config from './Config.vue';
import { useTableComposable } from '@/components/useTableComposable';

// Initialize stores
const configStore = useConfigStore();
const dataRowsStore = useDataRowsStore();

// Reactive state
const showConfig = ref(false);
const config = ref(configStore.config);
const tableData = ref(dataRowsStore.dataRows);
const selectRowsIndex = ref(dataRowsStore.selectRowsIndex);
const fileInput = ref(null);

// Computed properties
const curRow = computed(() => configStore.share.curRow);

// Table composable
const { downloadSch } = useTableComposable();

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
  let data = JSON.parse(JSON.stringify(tableData.value, (key, value) => {
    if (key === "_p") {
      return null;
    }
    return value;
  }));
  downloadJSON({ data, config: config.value, timestamp: new Date().getTime() });
}

function saveData(bool) {
  if (!bool || config.value.autoSave) {
    dataRowsStore.save();
    configStore.save();
  }
}

function deleteRow() {
  if (confirm("Please confirm to delete it?")) {
    dataRowsStore.remove();
    saveData(true);
  }
}

function addRow(num) {
  dataRowsStore.insert({ _id: '' });
}

function copyRow() {
  dataRowsStore.copyRow();
}

function exportCSV() {
  dataRowsStore.exportCSV(config.value);
}

function copyClipboard() {
  dataRowsStore.copyClipboard(config.value);
}

// Watch for changes in dataRows
watch(
  () => dataRowsStore.dataRows,
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