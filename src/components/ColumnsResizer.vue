<template>
  <div class="vue-columns-resizable" style="position: absolute; top: 0; right: 0; left: 0;">
    <div ref="justDiv" class="vsp" style="height: 1px; width: 0px;"></div>
    <template v-for="(col, key) in cols" :key="key">
      <div
        class="columns-resize-bar"
        ref="rbar"
        @mousedown="startResize(col, key, $event); handleMouseDown(col, key, $event);"
        @touchstart.passive="handleTouchStart(col, key, $event)"
      ></div>
    </template>
    <div
      class="overlay"
      v-if="state.resizeColumn"
      @mousemove.prevent="handleMousemove"
      @mouseup.prevent="resizeBarMouseUp"
      @touchmove.prevent="handleTouchMove"
      @touchend.prevent="resizeBarTouchEnd"
      @touchcancel.prevent="resizeBarTouchEnd"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, reactive, watch } from 'vue';
import { useAppStore } from '@/stores/appStore';
import { storeToRefs } from 'pinia';

const appStore = useAppStore();
const { activeTabRef } = storeToRefs(appStore);

// Props
const props = defineProps(['table',  'cols']);

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
const mainContent = ref(null);
const mainContentScrollHandler = ref(null);
const resizeObserver = ref(null);

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
    const mainContentEl = document.querySelector('#mainContent');
    const scrollLeft = mainContentEl ? mainContentEl.scrollLeft : 0;

    for (let i = 0; i < rbar.value.length; i++) {
      const bar = rbar.value[i];
      const left = getOffsetLeft(i) + getOffsetWith(i)- bar.offsetWidth / 2;
      bar.style.left = `${left}px`;

      if (props.cols[i].sticky) {
        document.documentElement.style.setProperty(
          `--sticky-left-${i}`,
          `${nextStickyLeft}px`
        );

       
        nextStickyLeft += getOffsetWith(i);

       // if(nextStickyLeft<left){
          bar.style.left = `${Math.max(nextStickyLeft+scrollLeft,left)}px`;

       // }
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
  () => [activeTabRef?.value, props.cols],
  () => {
    winResize();
  },
  { immediate: true }
);

function getOffsetLeft(i){
 return  props.cols.filter((c,index)=>index<i).reduce((total,c)=>total+c.width,0)
}
function getOffsetWith(i){
 return  props.cols[i].width;
}
const handleMousemove = (event) => {
  if (state.resizeColumn) {
    const i = state.resizeColumnIndex;
    const width = state.resizeColumnWidth + event.clientX - state.resizeX;
    state.resizeColumn.width = width;
    const offsetLeft = getOffsetLeft(i)
    const mainContentEl = document.querySelector('#mainContent');
    const scrollLeft = mainContentEl ? mainContentEl.scrollLeft : 0;

    if (props.cols[i].sticky) {
      const left = parseFloat(document.documentElement.style.getPropertyValue(`--sticky-left-${i}`));
      const stickyBarLeft = left+getOffsetWith(i);
      rbar.value[i].style.left = `${Math.max(offsetLeft + scrollLeft ,stickyBarLeft+scrollLeft ) - rbar.value[i].offsetWidth / 2 }px`;
      return;

   
    }
      rbar.value[i].style.left = `${offsetLeft  + width - rbar.value[i].offsetWidth / 2}px`;
  


  }
};

const startResize = (col, colIndex, event) => {
  state.resizeColumn = col;
  state.resizeColumnIndex = colIndex;
  state.resizeX = event.clientX;
  state.resizeColumnWidth = getOffsetWith(colIndex);
  state.resizeLastColumnWidth = getOffsetWith(props.cols.length - 1); 
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

// Touch event handlers
const handleTouchStart = (col, colIndex, event) => {
  event.preventDefault();
  const touch = event.touches[0];
  const mouseEvent = {
    clientX: touch.clientX,
    clientY: touch.clientY,
    preventDefault: () => {}
  };
  
  // Add touch-active class
  const bar = rbar.value[colIndex];
  bar.classList.add('touch-active');
  
  startResize(col, colIndex, mouseEvent);
  handleMouseDown(col, colIndex, mouseEvent);
};

const handleTouchMove = (event) => {
  if (state.resizeColumn) {
    const touch = event.touches[0];
    const mouseEvent = {
      clientX: touch.clientX,
      clientY: touch.clientY,
      preventDefault: () => {}
    };
    handleMousemove(mouseEvent);
  }
};

const resizeBarTouchEnd = () => {
  // Remove touch-active class from all bars with slight delay
  setTimeout(() => {
    rbar.value.forEach(bar => {
      if (bar) bar.classList.remove('touch-active');
    });
  }, 200);
  resizeBarMouseUp();
};

// Double click/tap handling
const mousedownCount = ref(0);
let mousedownTimer = null;

const handleMouseDown = (col, colIndex, event) => {
  mousedownCount.value++;
  
  if (mousedownCount.value === 1) {
    mousedownTimer = setTimeout(() => {
      mousedownCount.value = 0;
    }, 300);
  } else if (mousedownCount.value === 2) {
    clearTimeout(mousedownTimer);
    mousedownCount.value = 0;
    calColWidthAndResize(col, colIndex);
  }
};

const calColWidthAndResize = (col, colIndex) => {
  const maxWidth = getMaxWidth(`.row .col:nth-child(${colIndex+1})`);
  col.width = maxWidth+8;
  reAdjustBars();
};

function getMaxWidth(selector) {
  const originals = document.querySelectorAll(selector);
  if (!originals.length) return null;

    const wrapper = document.createElement('div');
    wrapper.style.position = 'fixed';
    wrapper.style.top = '-9999px';
    wrapper.style.left = '-9999px';
    wrapper.style.visibility = 'hidden';
    wrapper.style.display = 'block';
    document.body.appendChild(wrapper);

    originals.forEach((original, index) => {

  let newDiv = document.createElement('div');
    const clone = original.cloneNode(true);
    newDiv.appendChild(clone);
    wrapper.appendChild(newDiv);


  });
   const width = wrapper.getBoundingClientRect().width;

   document.body.removeChild(wrapper);

  return width;
}

watch(()=>props.table,()=>{
  const table = props.table;
  resizeObserver.value = new ResizeObserver((entries) => {
    for (const entry of entries) {
      document.documentElement.style.setProperty(
        '--table-height',
        `${table.offsetHeight}px`
      );
    }
  });
  resizeObserver.value.observe(table);
});
// Lifecycle hooks
onMounted(() => {


  window.addEventListener('resize', winResize);
  winResize();

  window.addEventListener('scroll', scrollEventHandler);
  mainContent.value = document.querySelector('#mainContent');
  mainContentScrollHandler.value = () => {
    document.documentElement.style.setProperty(
      '--scroll-left',
      `${mainContent.value.scrollLeft}px`
    );
    scrollEventHandler();
  };
  
  if (mainContent.value) {
    mainContent.value.addEventListener('scroll', mainContentScrollHandler.value);
  }
});

onUnmounted(() => {
  if (mainContent.value) {
    mainContent.value.removeEventListener('scroll', mainContentScrollHandler.value);
  }
  if (resizeObserver.value) {
    resizeObserver.value.unobserve(props.table);
  }
  window.removeEventListener('resize', winResize);
  window.removeEventListener('scroll', scrollEventHandler);
});
</script>

<style scoped>
.vue-columns-resizable {
  touch-action: none;
}

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
  transition: background-color 0.1s ease;
}

.columns-resize-bar:hover,
.columns-resize-bar:active,
.columns-resize-bar.touch-active {
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