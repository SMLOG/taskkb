<template>
  <div 
    class="tab flex items-center justify-between px-4 py-2 cursor-pointer text-sm font-medium relative" 
    :class="{ 'active': isActive }" 
    @click="$emit('click')"
  >
    <span class="truncate max-w-[130px]">{{ tab.title }}</span>
    <button 
  class="close-btn absolute top-1 right-1 w-2 h-2 flex items-center justify-center text-gray-600 hover:text-red-600 bg-gray-100 hover:bg-red-100 rounded-full m-0 transition-all duration-200 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-0" 
  style="padding: 0;"
  @click.stop="$emit('removeTab')"
  aria-label="Close tab"
>
  <svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
  </svg>
</button>
  </div>
</template>

<script>
export default {
  props: {
    tab: Object,
    isActive: Boolean,
  },
};
</script>

<style scoped>
/* Styles for the Tab component remain scoped */
</style>