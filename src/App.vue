<script setup>

import TreeOperation from '@/components/tree/TreeOperation.vue'

import FormatTool from "@/components/tools/FormatTool.vue";
import TabsContainer from './components/TabsContainer.vue';
import { useAppStore } from '@/stores/appStore';
import { storeToRefs } from 'pinia';
import { useDialog } from '@/composables/useDialog';
import { useHashStore } from '@/stores/hashStore';
import { ref } from 'vue';
import Dialog from '@/components/dlg/Dialog.vue'
import About from '@/components/About.vue';
import CtrlSave from './components/CtrlSave.vue';
import Notification from '@/components/notify/Notification.vue'

const dlg = ref(null);
const notification = ref(null);
useDialog(dlg, notification);
useHashStore();

const appStore = useAppStore();

const { activeTabRef } = storeToRefs(appStore);



</script>

<template>
  <main class="flex-grow relative">
    <About v-if="appStore.loading" />
    <div class="flex flex-col h-full">
      <div class="flex">
        <div><img class="h-[30px]" src="/logo.svg"/></div>
        <div class="flex-grow"> <TabsContainer /></div>
       
      </div>
      <div class="flex-1  flex ">

        <div class="flex-1 relative flex">
          <div id="mainContent" class="absolute inset-0 overflow-auto min-h-full mx-1">
            <FormatTool>
              <router-view>
              </router-view>
            </FormatTool>
            <TreeOperation v-if="activeTabRef != -1" />
          </div>
        </div>
      </div>
    </div>
  </main>
  <Dialog ref="dlg" />
  <Notification ref="notification" />
  <CtrlSave />

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
