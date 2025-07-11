<template>
  <div class="relative min-w-full">
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4"
    >
      <TreeCard
        :row="treeRef"
        :depth="''"
        :level="0"
        :cols="cols"
        v-if="treeRef"
      ></TreeCard>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, onMounted } from 'vue';
import { useAppStore } from '@/stores/appStore';
import { storeToRefs } from 'pinia';
import TreeCard from './TreeCard.vue';


const appStore = useAppStore();


const { configRef, treeRef,schReadyRef } = storeToRefs(appStore);




onMounted(() => {
  appStore.loadActiveTab();
});

const cols = computed(() => configRef.value?.cols?.filter((col) => col.show) ?? []);

const gridColumns = computed(() =>
  cols.value.length > 0 ? cols.value.map((col) => `${col.width}px`).join(' ') + ' 1fr' : '1fr'
);

</script>

<style>

</style>