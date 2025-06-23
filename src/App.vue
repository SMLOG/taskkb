<script setup>

import TreeOperation from '@/components/tree/TreeOperation.vue'

import FormatTool from "@/components/tools/FormatTool.vue";
import NotificationProvider from '@/components/NotificationProvider.vue';
import TabsContainer from './components/TabsContainer.vue';
import { useAppStore } from '@/stores/appStore';
import StorageOptions from './components/storage/StorageOptions.vue';
import NoFound from '@/components/storage/NoFound.vue';
import { storeToRefs } from 'pinia';
import { useAuthDialog } from '@/composables/useAuthDialog';
import {useHashStore} from '@/stores/hashStore';
import { ref } from 'vue';
import AuthorizationDialog from '@/components/storage/AuthorizationDialog.vue'
import About from '@/components/About.vue';

const authDialog = ref(null);
const noFound = ref(null);
useAuthDialog(authDialog,noFound);
useHashStore();

const appStore = useAppStore();

const {activeTabRef} = storeToRefs(appStore);



</script>

<template>

  <main class="flex-grow relative" >
    <About v-if="appStore.loading"/>
    <NotificationProvider class="h-full" v-if="!appStore.loading">
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
  <StorageOptions v-if="appStore.showPopUp===1"/>
  <AuthorizationDialog ref="authDialog" />
  <NoFound ref="noFound"/>

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
