<template>
  <Tabs @removeTab="(i)=>showRmoveConfirmRef=i">
    <button @click="addTab"
      class="plus-button flex-shrink-0  text-gray-500 hover:text-blue-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-gray-700 rounded-full transition-all duration-200"
      title="Add New Tab">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
      </svg>
    </button>
  </Tabs>
  <ConfirmPopUp v-if="showRmoveConfirmRef > -1" @cancel="showRmoveConfirmRef = -1" @confirm="confirmRemoveTab()" />
</template>

<script setup>
import { nextTick, ref } from 'vue';
import { useAppStore } from "@/stores/appStore";
import Tabs from '@/components/Tabs.vue';
import ConfirmPopUp from '@/components/ConfirmPopUp.vue';
import { onMounted } from 'vue';
import NewTab from './dlg/NewTab.vue';
import Save from './dlg/Save.vue';
import {showDialog} from '@/composables/useSystem';

const appStore = useAppStore();


const addTab = async () => {


  const isNew = !appStore.path;
  if(isNew){
    appStore.newFile( );
  }

  await showDialog(NewTab);

  if(isNew){
    console.log(appStore.path)
    
    const newPath  = await  showDialog(Save);
    appStore.updatePath( {...newPath,tabId:appStore.getCurrentTab().id});
  }

  await appStore.saveData();


};

const showRmoveConfirmRef = ref(-1);
const confirmRemoveTab = () => {
  appStore.removeTab(showRmoveConfirmRef.value);
  showRmoveConfirmRef.value = -1;
  if(appStore.tabs.length==0){
    addTab();
  }

}

onMounted(async() => {
  await new Promise((resolve)=>setTimeout(resolve,1000));
  if (!appStore.path) {
    addTab();
  }
});
</script>

<style scoped>
.plus-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-left: 8px;
  color: white;
}
</style>