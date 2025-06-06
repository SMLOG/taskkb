<script setup>
import { computed, ref, watch } from 'vue';
import { useTabsStore } from '@/stores/tabs';
import TreeTimeline from '@/components/tree/TreeTimeline.vue';
import TreeOperation from '@/components/tree/TreeOperation.vue'

// Destructure props to get tabId
const props = defineProps(['tabId','tabIndex']);
const tabsStore = useTabsStore();

// Reactive tab data with fallback
const tabData = computed(() => {
  return tabsStore.getTabData(props.tabId) || { content: '' };
});

// Create a local ref for the content
const content = ref(tabData.value.content);

// Watch for changes in tabData and update local content
watch(tabData, (newValue) => {
  content.value = newValue.content;
});

// Update tab data
const updateContent = (event) => {
  if (props.tabId) {
    content.value = event.target.value; // Update local content
    tabsStore.setTabData(props.tabId, { content: content.value }); // Update store
  }
};
</script>

<template>
  <div class="p-4 border border-gray-200 rounded-md">
    <TreeTimeline/>
    <TreeOperation :tabId="tabId" :tabIndex="tabIndex" />
  </div>
</template>