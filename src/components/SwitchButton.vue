<template>
    <div class="inline-flex bg-gray-200 rounded-lg p-1" role="group">
      <button
        v-for="(option, index) in options"
        :key="option.value"
        @click="selectOption(option.value)"
        :class="[
          'px-6 py-2 rounded-md font-medium text-sm transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500',
          modelValue === option.value 
            ? 'bg-white shadow text-blue-600' 
            : 'text-gray-600 hover:text-gray-800',
          index === 0 ? 'rounded-r-none' : '',
          index === options.length - 1 ? 'rounded-l-none' : '',
          index !== 0 && index !== options.length - 1 ? 'rounded-none' : ''
        ]"
      >
        {{ option.label }}
      </button>
    </div>
  </template>
  
  <script setup>
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
  
  const selectOption = (value) => {
    emit('update:modelValue', value)
  }
  </script>