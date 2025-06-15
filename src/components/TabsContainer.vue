<template>
  <div >
    <div class="container mx-auto p-0 pb-0 min-w-full select-none">
      <TabsPanel />
    </div>
  </div>
</template>

<script>
import TabsPanel from '@/components/TabsPanel.vue';
import TreeTimeline from '@/components/tree/TreeTimeline.vue';

export default {
  components: {
    TabsPanel,TreeTimeline
  },
};
</script>

<style>
/* Global styles if needed */
</style>