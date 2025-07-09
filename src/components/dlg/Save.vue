<template>
  <div class="text-left">
      <div class="mb-4">
        <label for="saveAs" class="block mb-2 font-medium">Save as:</label>
        <input v-model="fileName" id="saveAs" type="text"
          class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-colors duration-200">
      </div>

      <div class="mb-4">
        <label for="where" class="block mb-2 font-medium">Where:</label>
        <select v-model="selectIndexRef" id="where"
          class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-colors duration-200"
          @change="changeMode">

          <option v-for="(option, i) in cacheFolders" :value="i"> {{ (nameMap[option.mode] ? nameMap[option.mode] + " - " : "")+(option?.parent?.name||option.name)+`(${option.email})` }}</option>
          <option v-if="cacheFolders.length" disabled>-----------------</option>
          <option v-for="(option, i) in modesRef" :value="cacheFolders.length + i">{{
            (nameMap[option.mode] ? nameMap[option.mode] + " - " : "") + option.name }}</option>
        </select>
      </div>

      <div class="flex justify-between">
        <button @click="cancel"
          class="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
          Cancel
        </button>
        <button @click="save"
          class="px-4 py-2 bg-green-500 dark:bg-green-600 text-white rounded hover:bg-green-600 dark:hover:bg-green-700 transition-colors duration-200">
          Save
        </button>
      </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { getStorageBridgeByName } from '@/api/bridge';

import { storeToRefs } from 'pinia';
import { useUserStore } from '@/stores/userStore';
import Auth  from './Auth.vue';
import {showDialog} from '@/composables/useSystem';

const emits= defineEmits(["confirm","cancel"]);

const fileName = ref("Untitled.treegridio");
const {cacheFolders} = storeToRefs(useUserStore());


const nameMap = {
  "G": "Google Drive"
}
const modesRef = ref([
  { mode: 'G', name: "My Drive" }
  , { mode: 'G', name: "Pick a folder...", folder: true }
  , { mode: 'L', name: "Browser" }
  , { mode: 'D', name: "Device" }
].concat(location.href.indexOf('atlassian')>-1?[{mode:'J',name:"JIRA Attachment"}]:[]));

const getSelected = () => {
  const allOptions = [...cacheFolders.value, ...modesRef.value]
  const selectOption = allOptions[selectIndexRef.value];
  return selectOption;
}

const addOrUpdateAuthCacheList = (auth)=>{
  console.log(auth)

  useUserStore().addOrUpdateUser(auth);
  
  if(auth.mode && cacheFolders.value.filter(e=>e.mode==auth.mode).length==0){
    let copy =  [...modesRef.value.filter(e=>e.mode==auth.mode)];
    copy.map(e=>{e.accessToken = auth.accessToken;e.email=auth.email})
    cacheFolders.value.unshift(...copy);
  }
  let exits = cacheFolders.value.filter(f => f.mode==auth.mode&&auth.accessToken&&(auth.parent == null && f.parent == null  || auth?.parent?.id==f?.parent?.id));
          if (exits.length > 0) {
            let i = cacheFolders.value.indexOf(exits[0]);
            selectIndexRef.value = i;
            cacheFolders.value[i] = auth;
          } else {
            cacheFolders.value.unshift(auth)
            console.log('folder', auth)
            selectIndexRef.value = 0;
          }


}
const changeMode = () => {
  const selectOption = getSelected();
  if (selectOption.folder) {
    (async () => {
      const { pickFolder } = await getStorageBridgeByName(selectOption.mode);
      if (pickFolder) {
        try {
          const folder = await pickFolder(selectOption);
          addOrUpdateAuthCacheList({...selectOption,...folder,folder:false});

        } catch (error) {

          const df = modesRef.value.filter(e => e.mode === selectOption.mode)[0];
          const allOptions = [...cacheFolders.value, ...modesRef.value]
          selectIndexRef.value = allOptions.indexOf(df);
        }

      }

      console.log(selectOption)

    })();
  }
}
const selectIndexRef = ref(0);
const isOpen = ref(false);

const cancel = () => {
  isOpen.value = false;
  emits("cancel")
};


const save = async () => {
  try{
    const selected = getSelected();
    let rauth = selected;

    const {isAuth} =  await getStorageBridgeByName(selected.mode);
    if(isAuth){

        if(selected.accessToken){

        }else{

          const auth = await showDialog(Auth,{auth:selected, name:nameMap[selected.mode]});

          rauth = {...selected,...auth};
          addOrUpdateAuthCacheList(rauth);
        }
  }

  isOpen.value = false;
  console.error('resolve')
  emits("confirm",{...rauth,fileName:fileName.value});

  }catch(error){
    emits('cancel',error);
  }


};


</script>