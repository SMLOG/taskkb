
import { defineStore } from 'pinia'
import { ref } from 'vue'


export const useConfigStore = defineStore('config', () => {
  let configData =localStorage.getItem('config') ? JSON.parse(localStorage.getItem('config')) : {};
  const config = ref(configData)

  return { config }
})