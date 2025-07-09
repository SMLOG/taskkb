<template>
    <div 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-all duration-300">
      <div
        class="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-sm w-full mx-4 shadow-lg dark:shadow-gray-950/50 transform transition-all duration-300 scale-100 hover:scale-[1.02]">
        <h3 id="modal-title" class="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4 tracking-tight">
          Confirm Delete
        </h3>
        <p id="modal-description" class="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed">
          Are you sure you want to delete the column "<b>{{  params.col.name }}</b>"?
          <span class="font-semibold text-red-500 dark:text-red-400">This action cannot be undone.</span>
        </p>
        <div class="flex justify-end gap-3">
          <button
            class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-gray-500"
            @click="cancelDelete">
            Cancel
          </button>
          <button
            class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
            @click="confirmDelete">
            Delete
          </button>
        </div>
      </div>
    </div>
</template>

<script setup>


const emits= defineEmits(["confirm","cancel"]);

const props = defineProps({
  params: {
  }
});


const cancelDelete = () => {
  emits("cancel")
};


const confirmDelete = async () => {
  emits("confirm");

};


</script>