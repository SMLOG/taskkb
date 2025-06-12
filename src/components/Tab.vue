<template>
  <div 
    class="tab flex flex-1 items-center justify-between px-4 py-1 cursor-pointer text-sm font-medium relative" 
    :class="{ 'active': isActive }" 
    @click="$emit('click')"
    @dblclick="startEditing"
  >
    <span 
      v-if="!isEditing" 
      class="truncate max-w-[130px]"
    >
      {{ tab.title }}
    </span>
    <input 
      v-else
      v-model="editedTitle"
      @blur="saveTitle"
      @keyup.enter="saveTitle"
      @keyup.esc="cancelEditing"
      @input="updateInputWidth"
      ref="titleInput"
      class="px-1 py-0 text-sm font-medium border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-full"
      :style="{ width: inputWidth + 'px' }"
      type="text"
    >
    <button 
    class="close-btn absolute top-1 right-1 w-2 h-2 flex items-center justify-center text-gray-600 hover:text-red-600 bg-gray-100 hover:bg-red-100 dark:bg-gray-700 dark:hover:bg-red-900 dark:text-gray-300 dark:hover:text-red-400 rounded-full m-0 transition-all duration-200 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-0"      style="padding: 0;"
      @click.stop="$emit('removeTab')"
      aria-label="Close tab"
    >
      <svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
    <div v-if="!tab.saved" class="absolute top-4 right-2 w-1 h-1 flex items-center justify-center text-gray-600 hover:text-red-600 bg-blue-300 hover:bg-red-100 dark:bg-gray-700 dark:hover:bg-red-900 dark:text-gray-300 dark:hover:text-red-400 rounded-full m-0 transition-all duration-200 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-0"></div>
  </div>
</template>

<script>
export default {
  props: {
    tab: {
      type: Object,
      required: true,
    },
    isActive: Boolean,
  },
  data() {
    return {
      isEditing: false,
      editedTitle: '',
      inputWidth: 100,
    };
  },
  methods: {
    startEditing() {
      this.isEditing = true;
      this.editedTitle = this.tab.title;
      this.$nextTick(() => {
        this.$refs.titleInput.focus();
        this.updateInputWidth();
      });
    },
    saveTitle() {
      if (this.editedTitle.trim()) {
        this.$emit('update:tab', { ...this.tab, title: this.editedTitle.trim() });
        this.tab.title = this.editedTitle.trim();
      }
      this.isEditing = false;
    },
    cancelEditing() {
      this.isEditing = false;
      this.editedTitle = this.tab.title;
    },
    updateInputWidth() {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      context.font = '14px sans-serif';
      const textWidth = context.measureText(this.editedTitle || ' ').width;

      const padding = 16;
      let newWidth = textWidth + padding;

      const minWidth = 50;
      const maxWidth = 130;
      newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));

      this.inputWidth = newWidth;
    },
  },
};
</script>

<style scoped>
.tab {
  max-width: 200px;
}

input {
  box-sizing: border-box;
}
</style>