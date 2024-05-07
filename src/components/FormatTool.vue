<template>
  <div style="position: relative;width:100%">
    <div ref="container" @mouseup="checkSelection">
      <slot></slot>
    </div>

    <div id="formatTool" v-if="isFormatToolVisible && editable" :style="{ left: formatToolLeft, top: formatToolTop }">
      <button @click="applyBold">Bold</button>
      
      <div>
      <button class="indicative-element" ref="indicativeElement" @click.prevent.stop="toggleColorSelect" style="color:">
      Color
      </button>
      <ColorSelector v-model="fontColor" @select="applyFontColor($event,fontColor)" style="user-select: none;" v-if="showColorSelect" :position="colorSelectPosition"></ColorSelector>
      <button @click="removeFontColor">remove color</button>
      </div>
      
    </div>
  </div>
</template>

<script>
import ColorSelector from "./ColorSelector.vue";

export default {
  components: {
    ColorSelector
  },
  props: {
    editable: {
      type: Boolean,
      required: false,
    }
  },
  data() {
    return {
      isFormatToolVisible: false,
      formatToolLeft: 0,
      formatToolTop: 0,
      fontColor: "#FF0000",
      showColorSelect: false,
      colorSelectPosition: {
        top: 0,
        left: 0
      }
    };
  },
  methods: {
    toggleColorSelect() {
      this.showColorSelect = !this.showColorSelect;
      if (this.showColorSelect) {
        this.calculateColorSelectPosition();
      }
    },
    calculateColorSelectPosition() {
      const indicativeElementRect = this.$refs.indicativeElement.getBoundingClientRect();
      this.colorSelectPosition = {
        top: indicativeElementRect.bottom + 'px',
        left: indicativeElementRect.left + 'px'
      };
    },
    applyFontColor(event,color) {
      console.log(color)
      
      if(color)this.fontColor=color;
      document.execCommand("foreColor", false, this.fontColor);
    },
    removeFontColor() {
      document.execCommand("removeFormat", false, "foreColor");
      this.refocusEditor();
    },
    applyFontColor2() {
      // Get the selected text
      const selection = window.getSelection();

      // Check if the selected text is within a <span> element with the desired color
      const parentSpan = selection.anchorNode.parentElement;
      if (parentSpan.tagName === 'SPAN') {
        parentSpan.style.color = this.fontColor;
      } else {
        // Create a new range based on the selected text
        const range = selection.getRangeAt(0);

        // Create a <span> element to wrap the selected text
        const span = document.createElement('span');
        span.style.color = this.fontColor;

        // Surround the selected text with the <span> element
        range.surroundContents(span);
      }
      console.log('apply color')
    },
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
    }, applyBold(event) {
      const isBold = document.queryCommandState("bold");
      event.preventDefault();

      if (isBold) {
        document.execCommand("bold");
      } else {
        document.execCommand("bold", false, null);
      }
    },
  },
  computed: {
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