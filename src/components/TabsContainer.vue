<template>
  <div >
    <div class="container mx-auto p-0 pb-0 min-w-full">
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