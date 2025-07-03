<template>
    <div class="inline-flex bg-gray-200 rounded-lg p-1 relative" role="group">
      <!-- Sliding background -->
      <div
        class="absolute bg-white shadow-md rounded-md transition-all duration-300 ease-in-out"
        :style="sliderStyle"
      ></div>
      <button
        v-for="(option, index) in options"
        :key="option.value"
        @click="selectOption(option.value)"
        :class="[
          'px-6 py-2 rounded-md font-medium text-sm transition-colors duration-300 relative z-10',
          'focus:outline-none ',
          modelValue === option.value 
            ? 'text-blue-600' 
            : 'text-gray-600 hover:text-gray-800',
          index === 0 ? 'rounded-r-none' : '',
          index === options.length - 1 ? 'rounded-l-none' : '',
          index !== 0 && index !== options.length - 1 ? 'rounded-none' : ''
        ]"
        ref="buttons"
      >
        {{ option.label }}
      </button>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
  
  const props = defineProps({
    modelValue: {
      type: [String, Number],
      required: true
    },
    options: {
      type: Array,
      required: true,
      validator: (options) => {
        return options.every(opt => 'value' in opt && 'label' in opt)
      }
    }
  })
  
  const emit = defineEmits(['update:modelValue'])
  const buttons = ref([])
  
  // Compute the index of the selected option
  const selectedIndex = computed(() => {
    return props.options.findIndex(option => option.value === props.modelValue)
  })
  
  // Compute the slider's style (position, width, and height)
  const sliderStyle = computed(() => {
  if (!buttons.value.length || !buttons.value[selectedIndex.value]) {
    return { opacity: 0 }
  }
  
  const button = buttons.value[selectedIndex.value]
  const buttonRect = button.getBoundingClientRect()
  const containerRect = button.offsetParent.getBoundingClientRect()
  
  return {
    width: `${button.offsetWidth}px`,
    height: `${button.offsetHeight}px`,
    transform: `translateX(${buttonRect.left-4 - containerRect.left}px) scale(0.98)`,
    opacity: 1
  }
})
  
  const selectOption = (value) => {
    emit('update:modelValue', value)
  }
  
  // Debounce function for resize handling
  const debounce = (fn, delay) => {
    let timeout
    return (...args) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => fn(...args), delay)
    }
  }
  
  // Handle window resize with debouncing
  const handleResize = debounce(() => {
    emit('update:modelValue', props.modelValue) // Trigger recomputation
  }, 100)
  
  onMounted(() => {
    window.addEventListener('resize', handleResize)
  })
  
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })
  </script>