<script setup>
import Operation from '@/components/Operation.vue'
import TreeOperation from '@/components/tree/TreeOperation.vue'

import FormatTool from "@/components/FormatTool.vue";
import { useRoute } from 'vue-router';

const route = useRoute();

const isTree = route.path === '/';
console.log(isTree)
</script>

<template>
  <header>

    <div class="wrapper">
      <div>
        <router-link to="./">App</router-link>
      </div>
    </div>
  </header>
  <main class="flex-grow" style="position: relative;
    ">
    <div 
    id="mainContent"
    style="
      position: absolute;
      top: 0;
      bottom: 0;
      overflow: auto;
      right: 0;
      left: 0;
      display: grid;
      grid-template-columns: 1fr;
      grid-template-rows: auto 1fr;
    ">
    <FormatTool>
      <router-view>
      </router-view>
    </FormatTool>
      <TreeOperation v-if="isTree"/>
      <Operation v-else />
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
