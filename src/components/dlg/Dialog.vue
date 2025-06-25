<template>
  <transition name="dialog-fade">
    <div v-if="curShow > -1"
      class="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 dark:bg-black/60 transition-all duration-300"
      @click.self="handleBackdropClick">
      <transition name="dialog-scale" appear>
        <div
          :class="dialogWidth" role="dialog" aria-modal="true" aria-labelledby="dialog-title"
          class="flex bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl text-center relative border border-gray-200 dark:border-gray-700 max-w-[95vw] w-full max-h-[90vh] relative"
          >
          <button @click="handleCancel"
            class="absolute top-2 right-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full p-1"
            aria-label="Close">
            &times;
          </button>
          <div class="overflow-y-auto flex-1">
            <div v-for="(c, index) in componentNameList" v-show="index === curShow" :key="index">
            <component v-if="params[index]" :is="c" @confirm="handleConfirm" @cancel="handleCancel" :params="params[index]" />
            <component v-else :is="c" @confirm="handleConfirm" @cancel="handleCancel"  />
          </div>
          </div>


        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup>
import { ref, markRaw, computed } from 'vue';

// State
const curShow = ref(-1);
const returnResolveList = ref([]);
const returnRejectList = ref([]);
const componentNameList = ref([]);
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
    componentNameList.value = [];
    params.value = [];
  } else {
    // Otherwise just trim the arrays
    returnResolveList.value.length = curShow.value;
    returnRejectList.value.length = curShow.value;
    componentNameList.value.length = curShow.value;
    params.value.length = curShow.value;
  }

  curShow.value--;
};

// Exposed API
defineExpose({
  async open(name, param, options = {}) {
    return new Promise((resolve, reject) => {
      const component = markRaw(name);
      returnResolveList.value.push(resolve);
      returnRejectList.value.push(reject);
      componentNameList.value.push(component);
      params.value.push(param);
      size.value = options.size || 'md';
      curShow.value = returnRejectList.value.length - 1;
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