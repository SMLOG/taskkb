
import { defineStore } from 'pinia'
import { ref } from 'vue'

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


export const useDataRowsStore = defineStore('dataRows', () => {
  let temp =localStorage.getItem('data') ? JSON.parse(localStorage.getItem('data')) : [];
  const dataRows = ref(temp)
  function save() {
    localStorage.setItem('data', JSON.stringify(dataRows.value, function (key, value) {
        if (key === "_p") {
          return null;
        } else return value;
      }));
  }
  function download(){
    downloadJSON(JSON.parse(JSON.stringify(dataRows.value, function (key, value) {
        if (key === "_p") {
          return null;
        } else return value;
      })));
  }
  return { dataRows,save,download }
})