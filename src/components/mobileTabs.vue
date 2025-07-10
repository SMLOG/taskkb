<template>
  <div class="text-white relative mobile-tabs-toggle md:hidden">
    <div @click="toggleMobileDropdown" class="flex text-center">
      <span>{{ activeTabTitle }}</span>
      <svg class="w-4 h-4 ml-2 transition-transform duration-200" :class="{ 'rotate-180': showMobileDropdown }"
        fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
    <div class="absolute flex flex-col z-999 bg-gray-200" v-if="showMobileDropdown">
      <MTab v-for="(tab, index) in appStore.tabs" :key="tab.id || index" :tab="tab"
        :isActive="appStore.activeTabRef === index" @removeTab="$emit('removeTab', index)"
        @click="appStore.setActiveTab(index)" 
       />
    </div>
  </div>
</template>

<script setup>
import { useAppStore } from "@/stores/appStore";
import MTab from '@/components/MTab.vue';
import { ref, computed } from 'vue';

const appStore = useAppStore();

const showMobileDropdown = ref(false);


const activeTabTitle = computed(() => {
  return appStore.tabs[appStore.activeTabRef]?.title
});

const toggleMobileDropdown = () => {
  showMobileDropdown.value = !showMobileDropdown.value;
};





</script>

<style scoped>



</style>