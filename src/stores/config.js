
import { defineStore } from 'pinia'
import { ref } from 'vue'


export const useConfigStore = defineStore('config', () => {
  let configData =localStorage.getItem('config') ? JSON.parse(localStorage.getItem('config')) : {};
  const config = ref(configData)

  function save() {
    localStorage.setItem('config', JSON.stringify(config.value));
  }


  return { config,save }
})