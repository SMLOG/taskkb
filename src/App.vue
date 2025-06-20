<script setup>

import TreeOperation from '@/components/tree/TreeOperation.vue'

import FormatTool from "@/components/tools/FormatTool.vue";
import NotificationProvider from '@/components/NotificationProvider.vue';
import TabsContainer from './components/TabsContainer.vue';
import { useAppStore } from '@/stores/appStore';
import StorageOptions from './components/storage/StorageOptions.vue';

import { storeToRefs } from 'pinia'
import { ref } from 'vue'
const appStore = useAppStore();

const {activeTabRef,showStorageOption} = storeToRefs(appStore);


const loadedRef = ref(false);

(async () => {
  
  await appStore.initLoadTabsData();
  loadedRef.value = true;
}
)();

</script>

<template>

  <main class="flex-grow relative">
    <div v-if="!loadedRef">Loading</div>
    <NotificationProvider class="h-full" v-if="loadedRef">
      <div class="flex flex-col h-full">
        <div> <TabsContainer /></div>
        <div class="flex-1  flex ">

        <div class="flex-1 relative flex">
          <div id="mainContent" class="absolute inset-0 overflow-auto min-h-full mx-1">
            <FormatTool>
              <router-view>
              </router-view>
            </FormatTool>
            <TreeOperation v-if="activeTabRef!=-1" />
          </div>
        </div>
        </div>
      </div>
    </NotificationProvider>
  </main>
  <StorageOptions v-if="showStorageOption"/>

</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }


  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
