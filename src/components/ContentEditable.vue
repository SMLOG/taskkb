<template>
  <div class="editable-dropdown " style="width: 100%;min-width: 1em;">
    <div
 
      ref="contentEditable"
      :contenteditable="true"
      @blur="stopEditing"
      @keydown.enter.prevent="handleEnter"
      @focus="showDropdown=1"
      v-html="modelValue"
      class="text"
    >
     
    </div>
    <div  v-if="showDropdown&&dropdownItems" class="dropdown">
      <ul>
        <li v-for="item in dropdownItems" :key="item" @click="selectItem(item)">
          {{ item }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
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
    dropdownItems: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      editing: false,
      showDropdown: false,
    };
  },
  methods: {
    startEditing() {
      this.editing = true;
    },
    stopEditing() {
      this.editing = false;
      this.$emit('update:modelValue', this.$refs.contentEditable.innerHTML);
     console.log('stopEditing');
      setTimeout(()=>{ this.showDropdown=false;},200);

    },
    handleInput(event) {
      if (event && event.target) {
        console.log(event.target.innerHTML);
        this.$emit('update:modelValue', event.target.innerHTML);
      }
    },
    handleEnter() {
      this.$refs.contentEditable.blur();
      this.$emit('enter');
    },
    selectItem(item) {
      console.log('selectItem');
      if (this.$refs.contentEditable) {
        console.log(item);
        this.$refs.contentEditable.focus();
       // document.execCommand('insertText', false, item);
        this.$refs.contentEditable.innerHTML = item;
        this.showDropdown = false;
      }
    },
  },
};
</script>

<style>
.editable-dropdown {
  position: relative;
  display: inline-block;
}

.editable-dropdown .dropdown {
  position: absolute;
  z-index: 1;
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
.dropdown{
  position: absolute;
    background: #ccc;
    border-left: 2px solid green!important;
    padding: 0 10px;
}

</style>