<template>
  <div v-if="isOpen"
    class="fixed inset-0 z-999 flex items-center justify-center bg-black/40 dark:bg-black/60  transition-all duration-300">
    <div
      class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center relative border border-gray-200 dark:border-gray-700">
      <button @click="closePopup"
        class="absolute top-2 right-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl font-bold transition-colors"
        aria-label="Close">
        ×
      </button>
      <component :is="componentName" v-if="componentName" @confirm="handleConfirm" @cancel="closePopup"/>
    </div>
  </div>
</template>

<script setup>
import { nextTick, ref } from 'vue';

const isOpen = ref(false);
const componentName = ref(null)

const closePopup = () => {
  isOpen.value = false;
  returnReject.value();
};
const handleConfirm = (ret)=>{
  returnResolve.value(ret);
}

const returnResolve = ref(null);
const returnReject = ref(null);
defineExpose({
  async open(name) {
    return new Promise((resolve, reject) => {
      returnResolve.value = resolve;
      returnReject.value = reject;
      componentName.value = name;
      nextTick().then(()=>{
        isOpen.value = true;
      })
     
    })
  }
});

</script>

<style scoped>
</style>