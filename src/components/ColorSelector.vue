<template>
    <div class="color-select">
      <div
        v-for="(color, index) in visibleColors"
        :key="index"
        :class="['color-option', { 'selected': color === selectedColor }]"
        :style="{ backgroundColor: color }"
        @click="selectColor(color)"
      ></div>
      <button v-if="showMoreButton" class="more-button" @click="toggleMoreColors">
        {{ showMoreColors ? 'Less' : 'More' }}
      </button>
      <button class="custom-button" @click="selectCustomColor">Custom</button>
      <input
        v-if="showCustomColor"
        type="color"
        class="custom-color-input"
        @input="handleCustomColorInput"
      />
    </div>
  </template>
  
  <script>
  export default {
    props: {
        modelValue: {
    type: String,
    required: true
  }
    },
    data() {
      return {
        colors: [
          '#FF0000', // Red
          '#FFA500', // Orange
          '#FFFF00', // Yellow
          '#008000', // Green
          '#0000FF', // Blue
          '#4B0082', // Indigo
          '#EE82EE', // Violet
          '#000000', // Black
          '#808080', // Gray
          '#FFFFFF'  // White
        ],
        selectedColor: this.modelValue,
        showMoreColors: false,
        moreColors: [
          '#FFC0CB', // Pink
          '#FFD700', // Gold
          '#00FFFF', // Cyan
          '#800080', // Purple
          '#FF4500'  // Orange Red
        ],
        showCustomColor: false,
        customColor: ''
      };
    },
    computed: {
      visibleColors() {
        if (this.showMoreColors) {
          return this.colors.concat(this.moreColors);
        } else {
          return this.colors;
        }
      },
      showMoreButton() {
        return this.moreColors.length > 0;
      }
    },
    watch: {
        modelValue(newValue) {
        this.selectedColor = newValue;
      },
      selectedColor(newColor) {
        this.$emit('input', newColor);
      }
    },
    methods: {
      selectColor(color) {
        this.selectedColor = color;
        this.$emit('select',color)
      },
      toggleMoreColors() {
        this.showMoreColors = !this.showMoreColors;
      },
      selectCustomColor() {
        this.showCustomColor = true;
      },
      handleCustomColorInput(event) {
        this.selectedColor = event.target.value;
      }
    }
  };
  </script>
  
  <style scoped>
  .color-select {
    display: flex;
    flex-wrap: wrap;
  }
  
  .color-option {
    width: 50px;
    height: 50px;
    margin-right: 10px;
    margin-bottom: 10px;
    cursor: pointer;
  }
  
  .selected {
    border: 2px solid black;
  }
  
  .more-button {
    margin-top: 10px;
  }
  
  .custom-button {
    margin-top: 10px;
  }
  
  .custom-color-input {
    margin-top: 10px;
    width: 50px;
    height: 50px;
    padding: 0;
    border: none;
    outline: none;
    cursor: pointer;
  }
  </style>