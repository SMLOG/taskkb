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
          <a @click="download" >Export</a>
          <a @click="downloadSch" >Export Sch</a>
          <a v-if="selectRowsIndex&&selectRowsIndex.length==1" @click="copyRow">Copy</a>
        </div>
      </div>
    </div>
  </div>

</template>
<script setup>
import { useConfigStore } from '@/stores/config'
import { useDataRowsStore } from '@/stores/dataRows'
import Config from './Config.vue';
import { useTableComposable } from '@/components/useTableComposable'
const { downloadSch
  } = useTableComposable();
</script>
<script>

function downloadJSON(jsonData, filename = 'data.json') {
    // Convert the JSON data to a string
    const jsonString = JSON.stringify(jsonData);
  
    // Encode the JSON string
    const encodedJsonString = encodeURIComponent(jsonString);
  
    // Create a download link
    const downloadLink = document.createElement("a");
    downloadLink.setAttribute("href", "data:application/json;charset=utf-8," + encodedJsonString);
    downloadLink.setAttribute("download", filename);
  
    // Append the download link to the document
    document.body.appendChild(downloadLink);
  
    // Trigger the download
    downloadLink.click();
  
    // Remove the download link from the document
    document.body.removeChild(downloadLink);
  }

export default {
  data() {
    return {
      showConfig: 0,
      config: null,
      selectRowsIndex:null

    };
  },
  mounted() {
    const configStore = useConfigStore();
    this.config = configStore.config;

    const dataRowsStore = useDataRowsStore();
    this.tableData = dataRowsStore.dataRows;
    this.selectRowsIndex = dataRowsStore.selectRowsIndex;


    this.$watch(
      () => dataRowsStore.dataRows,
      () => {
        this.saveData();
      }, { deep: true }
    );


  },

  watch: {

  },
  computed: {
    curRow() {
      const configStore = useConfigStore();
      return configStore.share.curRow;
    },
  },
  methods: {
    download() {
      let data = JSON.parse(JSON.stringify(this.tableData, function (key, value) {
        if (key === "_p") {
          return null;
        } else return value;
      }));
      downloadJSON({data:data,config:this.config,timestamp:new Date().getTime()});

    },

    saveData(bool) {
      console.log(bool)
      if (!bool || this.config.autoSave) {
        const dataRowsStore = useDataRowsStore();
        dataRowsStore.save();
        useConfigStore().save();
      }
    },
    deleteRow() {
      let row = this.curRow;
      if (confirm("Please confirm to delete it?")) {
        useDataRowsStore().remove();
        this.saveData(true);
      }

    },
    addRow(num) {
      console.log(num)
      useDataRowsStore().insert({ _id: '' });


    },
    copyRow(){
      useDataRowsStore().copyRow();
    }
  }
};
</script>
<style scoped>
a{
  cursor: pointer;
}
</style>
