<template>
  <div class="relative mobile-tabs-toggle md:hidden" ref="dropdownContainer">
    <div @click.stop="toggleMobileDropdown" class="flex items-center text-center px-4 py-2.5">
      <div class="text-sm font-medium truncate max-w-[180px] text-white">
        {{ activeTabTitle }}
      </div>
      <svg class="w-4 h-4 ml-2 transition-transform duration-200 text-gray-900 dark:text-white" 
           :class="{ 'rotate-180': showMobileDropdown }"
           fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
    <transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div class="absolute flex flex-col z-999 bg-white dark:bg-gray-800 shadow-lg rounded-md mt-1 py-1" 
           v-if="showMobileDropdown">
        <MTab v-for="(tab, index) in appStore.tabs" :key="tab.id || index" :tab="tab"
              :isActive="appStore.activeTabRef === index" @removeTab="$emit('removeTab', index)"
              @click="appStore.setActiveTab(index)" />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { useAppStore } from "@/stores/appStore";
import MTab from '@/components/MTab.vue';
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const appStore = useAppStore();
const dropdownContainer = ref(null);

const showMobileDropdown = ref(false);

const activeTabTitle = computed(() => {
  return appStore.tabs[appStore.activeTabRef]?.title
});

const toggleMobileDropdown = () => {
  showMobileDropdown.value = !showMobileDropdown.value;
};

const handleClickOutside = (event) => {
  if (dropdownContainer.value && !dropdownContainer.value.contains(event.target)) {
    showMobileDropdown.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>