
import { defineStore } from 'pinia'
import { ref } from 'vue'


export const useConfigStore = defineStore('config', () => {
  let configData =localStorage.getItem('config') ? JSON.parse(localStorage.getItem('config')) : {cols:[]};
  const config = ref(configData)
  const share = ref({})

  function save() {
    localStorage.setItem('config', JSON.stringify(config.value));
  }


  return { config,save,share }
})