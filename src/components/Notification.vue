<template>
    <div v-if="visible" 
         :class="`fixed z-9999 top-5 right-5 p-4 rounded-lg shadow-lg transition-opacity duration-300 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`"
         @click="hide">
      <span class="text-white">{{ message }}</span>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      message: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        default: 'success', // or 'error'
      },
    },
    data() {
      return {
        visible: true,
      };
    },
    mounted() {
      setTimeout(this.hide, 3000); // Change duration as needed
    },
    methods: {
      hide() {
        this.visible = false;
      },
    },
  };
  </script>
  
  <style scoped>
  /* You can add additional styles here if needed */
  </style>