<script setup>

import TreeOperation from '@/components/tree/TreeOperation.vue'

import FormatTool from "@/components/tools/FormatTool.vue";
import { useRoute } from 'vue-router';
import NotificationProvider from '@/components/NotificationProvider.vue';
import TabsContainer from './components/TabsContainer.vue';

const route = useRoute();

const isTree = route.path === '/';
console.log(isTree)
</script>

<template>

  <main class="flex-grow relative">
    <NotificationProvider>
      <div >
<TabsContainer/>
<div>
    <div 
    id="mainContent"
    class="absolute inset-0 overflow-auto flex flex-col min-h-full" 
    >
    <FormatTool>
      <router-view>
      </router-view>
    </FormatTool>
  <TreeOperation />
  </div>
</div>
</div>
</NotificationProvider>

  </main>
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
