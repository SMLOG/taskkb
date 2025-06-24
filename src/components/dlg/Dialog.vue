<template>
  <div v-if="curShow>-1"
    class="fixed inset-0 z-999 flex items-center justify-center bg-black/40 dark:bg-black/60  transition-all duration-300">
    <div
      class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center relative border border-gray-200 dark:border-gray-700">
      <button @click="handleCancel"
        class="absolute top-2 right-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl font-bold transition-colors"
        aria-label="Close">
        ×
      </button>
      <div v-for="(c,index) in componentNameList" v-show="index==curShow" :key="index"  >
        <component :is="c"  @confirm="handleConfirm" @cancel="handleCancel" :params="params[index]"/> 
      </div>
     
    </div>
  </div>
</template>

<script setup>
import { nextTick, ref ,markRaw} from 'vue';

const curShow = ref(-1);

const handleCancel = (ret) => {
  console.log('handleCancel')

  returnRejectList.value[curShow.value](ret);
  if(curShow.value==0){
    returnResolveList.value.length=0;
    returnRejectList.value.length=0;
    componentNameList.value.length=0;
  }
  curShow.value--;
  returnResolveList.value.length = curShow.value+1;
  returnRejectList.value.length = curShow.value+1;
  componentNameList.value.length = curShow.value+1;
  params.value.length = curShow.value+1;

};
const handleConfirm = (ret)=>{
  returnResolveList.value[curShow.value](ret);
  if(curShow.value==0){
    returnResolveList.value.length=0;
    returnRejectList.value.length=0;
    componentNameList.value.length=0;
  }
  curShow.value--;
  returnResolveList.value.length = curShow.value+1;
  returnRejectList.value.length = curShow.value+1;
  componentNameList.value.length = curShow.value+1;
  params.value.length = curShow.value+1;

}




const returnResolveList = ref([]);
const returnRejectList = ref([]);
const componentNameList = ref([]);
const params = ref([]);


defineExpose({
  async open(name,param) {
    return new Promise((resolve, reject) => {
   
      const component = markRaw(name);
      returnResolveList.value.push(resolve);
      returnRejectList.value.push(reject);
      componentNameList.value.push(component);
      params.value.push(param)
      curShow.value = returnRejectList.value.length - 1;

     
    })
  }
});

</script>

<style scoped>
</style>