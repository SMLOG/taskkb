<template>
  <transition name="dialog-fade" v-if="curShow>-1" >
    <div 
       :class="`fixed  top-5 left-1/2 z-999 transform -translate-x-1/2 p-4 transition-opacity duration-300 `"
       @click="hide">
       <div :class="`${params[curShow].type === 'success' ? 'bg-green-500' : 'bg-red-500'}`">
          <span class="text-white">{{ params[curShow].message }}</span>
       </div>
    
  </div>
  </transition>
</template>

<script setup>
import { ref, computed } from 'vue';

// State
const curShow = ref(-1);
const returnResolveList = ref([]);
const returnRejectList = ref([]);
const params = ref([]);
const size = ref('lg'); // 'sm', 'md', 'lg', 'xl'

// Computed
const dialogWidth = computed(() => {
  return {
    'sm': 'max-w-xs',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    'full': 'max-w-[90vw]',
    '2md': 'max-w-2md'
  }[size.value];
});

// Methods
const handleCancel = (ret) => {
  if (returnRejectList.value[curShow.value]) {
    returnRejectList.value[curShow.value](ret ?? 'canceled');
  }
  cleanup();
};

const handleConfirm = (ret) => {
  if (returnResolveList.value[curShow.value]) {
    returnResolveList.value[curShow.value](ret);
  }
  cleanup();
};

const handleBackdropClick = () => {
  // Only close if clicking on backdrop (not children)
  handleCancel('backdrop-click');
};

const cleanup = () => {
  if (curShow.value === 0) {
    // Reset all if this was the last dialog
    returnResolveList.value = [];
    returnRejectList.value = [];
    params.value = [];
  } else {
    // Otherwise just trim the arrays
    returnResolveList.value.length = curShow.value;
    returnRejectList.value.length = curShow.value;
    params.value.length = curShow.value;
  }

  curShow.value--;
};

// Exposed API
defineExpose({
  async open(param, options = {}) {
    return new Promise((resolve, reject) => {
      returnResolveList.value.push(resolve);
      returnRejectList.value.push(reject);
      params.value.push(param);
      size.value = options.size || 'md';
      curShow.value = returnRejectList.value.length - 1;
      setTimeout(()=>{
        handleConfirm();
      },2000)
    });
  },

  closeAll() {
    while (curShow.value > -1) {
      handleCancel('force-closed');
    }
  },

  getCount() {
    return curShow.value + 1;
  }
});
</script>

<style scoped>
/* Fade transition for backdrop */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

/* Scale transition for dialog */
.dialog-scale-enter-active {
  transition: all 0.3s ease 0.1s;
}

.dialog-scale-leave-active {
  transition: all 0.2s ease;
}

.dialog-scale-enter-from,
.dialog-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Scrollbar styling for dialog content */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.dark ::-webkit-scrollbar-track {
  background: #374151;
}

.dark ::-webkit-scrollbar-thumb {
  background: #6b7280;
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>