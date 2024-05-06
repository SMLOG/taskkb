<template>
  <div class="editable-dropdown " style="width: 100%;min-width: 1em;" @dblclick="dblclick()">
    <div style="display: flex;    justify-content: space-between;">
      <div ref="contentEditable" :contenteditable="editable" @paste="sanitizePaste($event)" @blur="stopEditing" @keydown.enter.prevent="handleEnter"
        @focus="showDropdown = 1" class="text" v-html="renderToHtml(modelValue)">

      </div>
      <div v-if="isText">
        <span>T</span>
      </div>
    </div>
    <div v-show="showDropdown && !isText && dropdownItems" class="dropdown">
      <ul>
        <li v-for="item in dropdownItems" :key="item" @click="selectItem(item)">
          {{ item }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import {marked} from 'marked';

export default {
  mounted() {
    if (this.editing && this.$refs.contentEditable) {
      this.$refs.contentEditable.focus();
    }
  },
  props: {
    modelValue: {
      type: String,
      required: false,
    },
    isText: {
      type: Boolean,
      required: false,
    },

    dropdownItems: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      editing: false,
      showDropdown: false,
      editable: false,
    };
  },
  methods: {
    sanitizePaste(e) {
            e.preventDefault();
            var text = e.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
        },
    convertMarkdownToHtml(markdown) {
      var tempElement = document.createElement("div");
  tempElement.innerHTML = marked(markdown);
  var links = tempElement.getElementsByTagName('a');
      for (var i = 0; i < links.length; i++) {
        links[i].setAttribute('target', '_blank');
      }
  return tempElement.firstChild?tempElement.firstChild.innerHTML:tempElement.innerHTML;

    },
   isHTMLSegment(string) {
  const parser = new DOMParser();
  const parsedDocument = parser.parseFromString(string, 'text/html');
  
  // Check if the parsed document has any elements
  return parsedDocument.body.children.length > 0;
},
    renderToHtml(modelValue) {
      if (!this.editable ) {
        if(modelValue){
            let replacedText = this.convertMarkdownToHtml(modelValue.replace(/<br>/g,'\n'));
            /*var urlRegex = /(https?:\/\/[^\s]+)/g;
            var replacedText = str.replace(urlRegex, function (url) {
              return '<a target="_blank" href="' + url + '">' + url + '</a>';
            });*/
            return replacedText.replace(/\n/g, '<br>');
       

        }

      }

      return modelValue;
    },
    moveCursorToEnd(element) {
      element.focus(); // Set focus to the contentEditable div

      var range = document.createRange();
      range.selectNodeContents(element);
      range.collapse(false); // Collapse the range to the end

      var selection = window.getSelection();
      selection.removeAllRanges(); // Clear any existing selection
      selection.addRange(range); // Set the new range as the selection
    },
    dblclick() {
      if (!this.editable) {
        this.editable = true;
        setTimeout(() => {
          this.moveCursorToEnd(this.$refs.contentEditable);
          this.$refs.contentEditable.focus();
        }, 100);
      }


    },
    startEditing() {
      this.editing = true;
    },
    getValue() {
      return this.isText ? this.$refs.contentEditable.textContent.trim() : this.$refs.contentEditable.innerHTML

    },
    stopEditing() {

      this.$nextTick(() => {
        this.timer = setTimeout(() => {
          this.showDropdown = false;
          this.editing = false;
          this.editable = false;
          console.log('stop editing')

          this.$emit('update:modelValue', this.getValue());
          if (this.getValue() !== this.modelValue) {
            this.$emit('change', this.getValue());
            console.log('changed', this.getValue());
          }
          console.log('stopEditing');
        }, 200);
      });


    },

    insertNewLine(event) {
      // Prevent the default "Enter" key behavior
      event.preventDefault();

      const selection = window.getSelection();

      // Insert a new line at the current position
      const textNode = document.createElement('br');
      selection.getRangeAt(0).insertNode(textNode);

      // Move the cursor to the next line
      selection.collapseToEnd();
    },
    handleEnter(event) {
      if (event.key === 'Enter' && event.shiftKey) {
        this.insertNewLine(event)
        //this.$refs.contentEditable.innerHTML =  this.$refs.contentEditable.innerHTML+"<br />";
      } else {
        this.$refs.contentEditable.blur();
        this.$emit('enter');
      }

    },
    selectItem(item) {
      console.log('selectItem');
      clearTimeout(this.timer);
      if (this.$refs.contentEditable) {
        console.log(item);
        this.$refs.contentEditable.focus();
        // document.execCommand('insertText', false, item);
        this.$refs.contentEditable.innerHTML = item;
        this.showDropdown = false;
      }
      this.stopEditing();
    },
  },
};
</script>

<style scoped>
.editable-dropdown {
  position: relative;
  display: inline-block;
}

.editable-dropdown .dropdown {
  position: absolute;
  z-index: 4;
  background-color: #f9f9f9;
  border: 1px solid #ccc;
}

.editable-dropdown .dropdown ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.editable-dropdown .dropdown ul li {
  padding: 8px 12px;
  cursor: pointer;
}

.editable-dropdown .dropdown ul li:hover {
  background-color: #e5e5e5;
}

.editable-dropdown input {
  flex: 1;
  margin-right: 10px;
}

.dropdown {
  position: absolute;
  background: #ccc;
  border-left: 2px solid green !important;
  padding: 0 10px;
}

.text {
  min-height: 1em;
  word-break: break-all;
  outline: none;
}

</style>