<template>
  <button
    type="button"
    class="w-4 h-4 flex items-center justify-center border rounded-sm cursor-pointer transition-colors duration-100 focus:outline-none"
    :class="stateClasses"
    @click="toggleState"
    :title="stateTitle"
    aria-label="Toggle checkbox state"
  >
    <span v-if="state === 1" class="text-[10px] text-green-600 font-bold leading-none">✓</span>
    <span v-else-if="state === 2" class="text-[10px] text-red-600 font-bold leading-none">✗</span>
  </button>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0 // 0 = empty, 1 = checked, 2 = fail
  }
})

const emit = defineEmits(['update:modelValue'])

const state = ref(props.modelValue)

const stateClasses = computed(() => ({
  'border-gray-400 hover:border-gray-500': state.value === 0,
  'border-green-500 bg-green-100': state.value === 1,
  'border-red-500 bg-red-100': state.value === 2
}))

const stateTitle = computed(() => {
  switch (state.value) {
    case 1: return 'Checked'
    case 2: return 'Failed'
    default: return 'Unchecked'
  }
})

const toggleState = () => {
  state.value = (state.value + 1) % 3
  emit('update:modelValue', state.value)
}
</script>