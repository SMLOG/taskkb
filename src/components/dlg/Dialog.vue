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
import { nextTick, ref ,markRaw} from 'vue';

const isOpen = ref(false);

const closePopup = (ret) => {
  pop();
  if(componentNameList.value.length==0){
     isOpen.value = false;
     reset();
  }
  returnReject.value(ret);
};
const handleConfirm = (ret)=>{

  pop();
  if(returnResolveList.length==0){
    isOpen.value = false;
    reset();

  }
  returnResolve.value(ret);
}

const returnResolveList = ref([]);
const returnRejectList = ref([]);
const componentNameList = ref([]);

const returnResolve = ref(null);
const returnReject = ref(null);
const componentName = ref(null);


const pop = ()=>{
  returnResolve.value = returnResolveList.value.pop();
  returnReject.value = returnRejectList.value.pop();
  componentName.value = componentNameList.value.pop();
}
const reset = ()=>{

  componentName.value = null;
}

defineExpose({
  async open(name) {
    return new Promise((resolve, reject) => {
      if(componentName.value!=null){
        returnResolveList.value.push(returnResolve.value);
        returnRejectList.value.push(returnReject.value);
        componentNameList.value.push(componentName.value);
      }

      const component = markRaw(name);
      returnResolveList.value.push(resolve);
      returnRejectList.value.push(reject);
      componentNameList.value.push(component);
      pop();


      nextTick().then(()=>{
        isOpen.value = true;
      })
     
    })
  }
});

</script>

<style scoped>
</style>