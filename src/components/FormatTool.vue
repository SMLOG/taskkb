<template>
    <div style="position: relative;width:100%" >
      <div  ref="container" @mouseup="checkSelection">
        <slot></slot>
      </div>
  
      <div id="formatTool" v-if="isFormatToolVisible&&editable" :style="{ left: formatToolLeft, top: formatToolTop }">
        <button @click="applyBold">Bold</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
    editable: {
      type: Boolean,
      required: false,
    }},
    data() {
      return {
        isFormatToolVisible: false,
        formatToolLeft: 0,
        formatToolTop: 0
      };
    },
    methods: {
      checkSelection() {
        const selectedText = window.getSelection().toString();
       // const container = this.$refs.container;
  
        if (selectedText.length > 0) {
          this.isFormatToolVisible = true;
          const selection = window.getSelection().getRangeAt(0);
          const boundingRect = selection.getBoundingClientRect();
          this.formatToolLeft = boundingRect.right + "px";
          this.formatToolTop = boundingRect.bottom + "px";
        } else {
          this.isFormatToolVisible = false;
        }
      }  , applyBold() {
        document.execCommand(this.isBold ? "removeFormat" : "bold");    },
    },
    computed:{
        isBold() {
    const selectedText = window.getSelection().toString();

    if (selectedText.length > 0) {
      const range = window.getSelection().getRangeAt(0);
      const parentElement = range.commonAncestorContainer.parentElement;
      const computedStyle = window.getComputedStyle(parentElement);
      return computedStyle.fontWeight === "bold" || parseInt(computedStyle.fontWeight) >= 700;
    }

    return false;
  }
    }
  };
  </script>
  
  <style scoped>
  /* Add your custom styles here */
  #formatTool {
  position: fixed;
  background-color: white;
  z-index: 1;
  /* Define the position and style of the format tool */
}
  </style>