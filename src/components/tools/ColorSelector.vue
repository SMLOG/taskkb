<template>
  <div class="color-selector-container bg-white dark:bg-gray-800 p-2 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
    <div class="color-grid">
      <button
        v-for="(color, index) in visibleColors"
        :key="index"
        class="color-option transition-all duration-150 ease-in-out"
        :class="{
          'selected': color === selectedColor,
          'ring-2 ring-offset-2 ring-blue-500': color === selectedColor
        }"
        :style="{ backgroundColor: color }"
        :aria-label="`Select color ${color}`"
        @click.prevent.stop="selectColor(color)"
      ></button>
    </div>

    <div class="color-selector-actions mt-2 flex items-center justify-between">
      <button
        v-if="showMoreButton"
        class="more-button text-xs px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
        @click.prevent.stop="toggleMoreColors"
      >
        {{ showMoreColors ? '▲ Less' : '▼ More' }}
      </button>

      <div class="custom-color-wrapper flex items-center ml-2">
        <label class="text-xs mr-2 text-gray-600 dark:text-gray-400">Custom:</label>
        <input
          type="color"
          class="custom-color-input w-6 h-6 cursor-pointer bg-transparent border-none"
          :value="selectedColor"
          @input="handleCustomColorInput"
          aria-label="Choose custom color"
        >
        <span class="text-xs ml-2 text-gray-700 dark:text-gray-300">{{ selectedColor }}</span>
      </div>
    </div>
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
      baseColors: [
        '#FF0000', // Red
        '#FF7F00', // Orange
        '#FFFF00', // Yellow
        '#00FF00', // Green
        '#0000FF', // Blue
        '#4B0082', // Indigo
        '#9400D3', // Violet
        '#000000', // Black
        '#808080', // Gray
        '#FFFFFF'  // White
      ],
      extendedColors: [
        '#FF69B4', // Hot Pink
        '#FF4500', // Orange Red
        '#FFD700', // Gold
        '#00FFFF', // Cyan
        '#800080', // Purple
        '#A52A2A', // Brown
        '#008080', // Teal
        '#FF6347'  // Tomato
      ],
      selectedColor: this.modelValue,
      showMoreColors: false
    };
  },
  computed: {
    visibleColors() {
      return this.showMoreColors 
        ? [...this.baseColors, ...this.extendedColors]
        : this.baseColors;
    },
    showMoreButton() {
      return this.extendedColors.length > 0;
    }
  },
  watch: {
    modelValue(newValue) {
      this.selectedColor = newValue;
    }
  },
  methods: {
    selectColor(color) {
      this.selectedColor = color;
      this.$emit('update:modelValue', color);
      this.$emit('select', color);
    },
    toggleMoreColors() {
      this.showMoreColors = !this.showMoreColors;
    },
    handleCustomColorInput(event) {
      const color = event.target.value.toUpperCase();
      this.selectColor(color);
    }
  }
};
</script>

<style scoped>
.color-selector-container {
  width: 180px;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
}

.color-option {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.1s ease;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.selected {
  transform: scale(1.15);
}

.custom-color-input {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border-radius: 4px;
}

.custom-color-input::-webkit-color-swatch {
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.custom-color-input::-moz-color-swatch {
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.more-button {
  transition: all 0.2s ease;
}

.more-button:hover {
  transform: translateY(-1px);
}
</style>