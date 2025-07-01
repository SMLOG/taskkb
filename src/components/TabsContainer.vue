<template>
  <div>
    <div class="container mx-auto p-0 pb-0 min-w-full select-none flex just-between">
      <div id="tabsanelContainer" class="tab-container flex-1 flex items-center min-w-0">
        <TabsPanel />
      </div>
      <div id="rightButtons" class="right-buttons flex items-center space-x-2">
        <RightTop />
      </div>


    </div>
  </div>
</template>

<script setup>
import TabsPanel from '@/components/TabsPanel.vue';
import RightTop from '@/components/storage/RightTop.vue';
</script>
<style>
.add-tab-btn {
  flex-shrink: 0;
  /* Never shrinks */
  margin-left: 0.25rem;
  /* Consistent spacing */
}

.tab {
  flex: 1 1 0%;
  /* Allows tabs to shrink/grow */
  min-width: 1px;
  /* Minimum before truncation */
  width: 1px;
  /* Minimum before truncation */
  max-width: 200px;
  /* Maximum expansion */
}

.tab-container {
  overflow: hidden;
}

@container (width < 50px) {
  .tab .close-btn {
    display: none !important;
  }
  .tab.active .close-btn {
    display: block !important;
  }
  .tab > * {padding-left: 0px!important;}
  .tab >* {padding-right: 0px!important;}
  
}

/* Always show close button when tab is wide enough */
@container (width >= 51px) {
  .tab .close-btn {
    opacity: 1 !important;
    display: block !important;
  }
}
</style>
