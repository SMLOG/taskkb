import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useConfigStore = defineStore('config', () => {
  const config = ref({ cols: [] })

  async function init() {
    try {
      const storedConfig = localStorage.getItem('config')
      if(storedConfig)config.value =  JSON.parse(storedConfig) 
    } catch (error) {
      console.error('Failed to initialize config:', error)
    }
  }

  async function save() {
    try {
      localStorage.setItem('config', JSON.stringify(config.value))
    } catch (error) {
      console.error('Failed to save config:', error)
    }
  }

  // Call init asynchronously and handle potential errors
  init().catch(error => console.error('Init failed:', error))

  return { config, init, save }
})