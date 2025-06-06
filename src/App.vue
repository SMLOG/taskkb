<script setup>

import TreeOperation from '@/components/tree/TreeOperation.vue'

import FormatTool from "@/components/tools/FormatTool.vue";
import { useRoute } from 'vue-router';
import NotificationProvider from '@/components/NotificationProvider.vue';

const route = useRoute();

const isTree = route.path === '/';
console.log(isTree)
</script>

<template>
  <main class="flex-grow " style="position: relative;
    ">
    <div 
    id="mainContent"
    style="    
      display: grid;
      grid-template-columns: 1fr;
      grid-template-rows: auto 1fr;
    "
    class="absolute inset-0 overflow-auto" 
    >
     <NotificationProvider>
    <FormatTool>
      <router-view>
      </router-view>
    </FormatTool>
    <TreeOperation />
  </NotificationProvider>
    </div>
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
