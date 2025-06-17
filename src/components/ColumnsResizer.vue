<template>
  <div class="vue-columns-resizable" style="position: absolute; top: 0; right: 0; left: 0;">
    <div ref="justDiv" class="vsp" style="height: 1px; width: 0px;"></div>
    <template v-for="(col, key) in cols" :key="key">
      <div
        class="columns-resize-bar"
        ref="rbar"
        @mousedown="startResize(col, key, $event)"
      ></div>
    </template>
    <div
      class="overlay"
      v-if="state.resizeColumn"
      @mousemove.prevent="handleResize"
      @mouseup.prevent="resizeBarMouseUp"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, reactive,watch } from 'vue';
import { useAppStore } from '@/stores/appStore';
import { storeToRefs } from 'pinia'
const appStore = useAppStore();

const {activeTabRef} = storeToRefs(appStore);

// Props
const props = defineProps(['table', 'th', 'cols']);

// Reactive state
const state = reactive({
  resizeColumn: null,
  resizeColumnIndex: null,
  resizeX: null,
  resizeColumnWidth: null,
  resizeLastColumnWidth: null,
  lastStickyBar: -1,
});

// Refs
const justDiv = ref(null);
const rbar = ref([]);

// Debounce utility
const debounce = (fn, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
};

// Methods
const reAdjustBars = () => {
  requestAnimationFrame(() => {
    let nextStickyLeft = 0;
    let lastSticky = -1;
    const mainContent = document.querySelector('#mainContent');
    const scrollLeft = mainContent ? mainContent.scrollLeft : 0;

    for (let i = 0; i < rbar.value.length; i++) {
      const th = props.th[i];
      const bar = rbar.value[i];
      const left = th.offsetLeft + th.offsetWidth - bar.offsetWidth / 2;
      bar.style.left = `${left}px`;

      if (th.classList.contains('sticky')) {
        document.documentElement.style.setProperty(
          `--sticky-left-${i}`,
          `${nextStickyLeft}px`
        );
        if (th.getBoundingClientRect().x === nextStickyLeft && scrollLeft > 0) {
          lastSticky = i;
        }
        nextStickyLeft += th.offsetWidth;
      }
    }
  });
};

const winResize = debounce(() => {
  for (let i = 0; i < rbar.value.length; i++) {
    document.documentElement.style.removeProperty(`--sticky-left-${i}`);
  }
  nextTick(() => reAdjustBars());
}, 100);

watch(
  () => [activeTabRef?.value,props.cols],
  () => {
    winResize();
  },
  { immediate: true }
);

const handleResize = (event) => {
  if (state.resizeColumn) {
    const i = state.resizeColumnIndex;
    const width = state.resizeColumnWidth + event.x - state.resizeX;
    state.resizeColumn.width = width;
    const th = props.th[i];
    rbar.value[i].style.left = `${th.offsetLeft + width - rbar.value[i].offsetWidth / 2}px`;
    if (th.classList.contains('sticky')) {
      winResize();
    }
  }
};

const startResize = (col, colIndex, event) => {
  state.resizeColumn = col;
  state.resizeColumnIndex = colIndex;
  state.resizeX = event.x;
  state.resizeColumnWidth = props.th[colIndex].offsetWidth;
  state.resizeLastColumnWidth = props.th[props.th.length - 1].offsetWidth;
};

const resizeBarMouseUp = () => {
  if (state.resizeColumn) {
    reAdjustBars();
  }
  state.resizeColumn = null;
};

const scrollEventHandler = debounce(() => {
  reAdjustBars();
}, 50);

// Lifecycle hooks
onMounted(() => {
  const table = props.table;
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      document.documentElement.style.setProperty(
        '--table-height',
        `${table.offsetHeight}px`
      );
    }
  });
  resizeObserver.observe(table);

  window.addEventListener('resize', winResize);
  winResize();

  window.addEventListener('scroll', scrollEventHandler);
  const mainContent = document.querySelector('#mainContent');
  const mainContentScrollHandler = () => {
    document.documentElement.style.setProperty(
      '--scroll-left',
      `${mainContent.scrollLeft}px`
    );
    scrollEventHandler();
  };
  if (mainContent) {
    mainContent.addEventListener('scroll', mainContentScrollHandler);
  }

  // Store mainContentScrollHandler for cleanup
  const cleanup = () => {
    if (mainContent) {
      mainContent.removeEventListener('scroll', mainContentScrollHandler);
    }
  };
  onUnmounted(cleanup);
});

onUnmounted(() => {
  window.removeEventListener('resize', winResize);
  window.removeEventListener('scroll', scrollEventHandler);
});
</script>

<style scoped>
.resizable {
  position: relative;
  overflow: hidden;
}

.resize-handle {
  position: absolute;
  top: 0;
  right: -11px;
  bottom: 0;
  width: 3px;
  background-color: #eee;
  cursor: col-resize;
}

.stickyed {
  border-right: 1px solid red;
  position: sticky !important;
}

.overlay {
  position: fixed;
  inset: 0;
  z-index: var(--vt-index-overlay);
  user-select: none;
}

.columns-resize-bar {
  z-index: var(--vt-index-overlay);
  position: absolute;
  top: 0px;
  width: 2px;
  cursor: col-resize;
  height: var(--table-height);
}

.columns-resize-bar:hover {
  background-color: gray;
}

.sticky {
  position: sticky;
}

.vsp::after {
  background-color: gray;
  content: '';
  width: 1px;
  display: block;
  position: absolute;
  right: 0;
}

.vsp {
  position: sticky;
  background: yellow;
  z-index: 1111;
  left: 0;
  top: 0;
}
</style>