<template>
  <div >
    <div class="container mx-auto p-0 pb-0 min-w-full select-none flex just-between">
      <div class="flex-1 flex"><TabsPanel /></div>
      <div><RightTop/></div>
      
      
    </div>
  </div>
</template>

<script setup>
import TabsPanel from '@/components/TabsPanel.vue';
import RightTop from '@/components/storage/RightTop.vue';
</script>
