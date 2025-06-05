<template>
    <div>
      <slot></slot>
      <Notification
        v-if="notification"
        :message="notification.message"
        :type="notification.type"
      />
    </div>
  </template>
  
  <script>
  import { provide } from 'vue';
  import useNotification from '../composables/useNotification';
  import Notification from './Notification.vue';
  
  export default {
    components: {
      Notification,
    },
    setup() {
      const { notification, showNotification } = useNotification();
      provide('showNotification', showNotification);
      return { notification };
    },
  };
  </script>
  
  <style scoped>
  /* Add additional styles here */
  </style>