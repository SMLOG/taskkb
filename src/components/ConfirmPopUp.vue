<template>
  <div
    class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-all duration-300"
  >
    <div
      class="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-sm w-full mx-4 shadow-lg dark:shadow-gray-950/50 transform transition-all duration-300 scale-100 hover:scale-[1.02]"
    >
      <h3
        id="modal-title"
        class="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4 tracking-tight"
      >
        {{ title || "Confirmation Deletion" }}
      </h3>
      <p
        id="modal-description"
        class="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed"
      >
        <slot>Are you sure you want to do this? <span class="font-semibold text-red-500 dark:text-red-400">This action cannot be undo once confirmed.</span></slot>
      </p>
      <div class="flex justify-end gap-3">
        <button
          class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-gray-500"
          @click="$emit('cancel')"
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
          @click="$emit('confirm')"
        >
          Confirm Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string; // Made optional to align with default fallback
}>();

defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();
</script>

<style scoped>
@use '@/assets/main.css';

.fixed {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>