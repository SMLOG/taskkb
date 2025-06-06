<template>
  <div v-if="visible" 
       :class="`fixed z-50 top-5 left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-lg transition-opacity duration-300 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`"
       @click="hide">
    <span class="text-white">{{ message }}</span>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  props: {
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: 'success',
    },
  },
  setup(props) {
    const visible = ref(true);

    const hide = () => {
      visible.value = false;
    };

    onMounted(() => {
      setTimeout(hide, 3000);
    });

    return {
      visible,
      hide,
    };
  },
};
</script>

<style scoped>
/* Additional styles can be added here if needed */
</style>