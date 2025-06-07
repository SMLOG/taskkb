<template>
  <div  class="bg-gray-100">
    <div class="container mx-auto p-4 max-w-4xl">
      <Tabs />
    </div>
  </div>
</template>

<script>
import Tabs from '@/components/Tabs.vue';
import TreeTimeline from '@/components/tree/TreeTimeline.vue';

export default {
  components: {
    Tabs,TreeTimeline
  },
};
</script>

<style>
/* Global styles if needed */
</style>