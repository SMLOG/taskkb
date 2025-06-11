<template>
  <div id="schconfig">
    <slot></slot>
    <SchConfig
      v-if="configRef?.showSch"
      :message="SchConfig.message"
      :config="configRef"
    />
  </div>
</template>

<script setup>
import { provide } from 'vue';
import SchConfig from '@/components/tree/SchConfig.vue';
import useSchConfig from '@/composables/useSchConfig';

const { configRef, showSchConfig } = useSchConfig();
provide('showSchConfig', showSchConfig);
</script>