<template>
  <div class="vue-columns-resizable" style="position: absolute;
    top: 0;
    right: 0;
    left: 0;">
    <template v-for="(col, key) in cols" :key="key">
      <div class="columns-resize-bar" :class="{sticky:col.sticky}" ref="rbar" @mousedown="startResize(col, key, $event)"></div>
    </template>
    <div class="overlay" v-if="resizeColumn" @mousemove.prevent="handleResize" @mouseup.prevent="resizeBarMouseUp">
    </div>
  </div>
</template>
<script>
export default {
  props: ["table", "th", "cols"],
  data() {
    return {
      resizeColumn: null,
    };
  },
unmounted(){
  window.removeEventListener('scroll', this.scrollEventHanlder);

},
  mounted() {

    const table = this.table;
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        document.documentElement.style.setProperty('--table-height', table.offsetHeight + 'px');
      }
    });
    resizeObserver.observe(table);

    window.addEventListener('resize', () => {
      this.winResize();
    });
    this.winResize();

    window.addEventListener('scroll', this.scrollEventHanlder);

  },
  methods: {
    scrollEventHanlder(){
        this.resize();
    },
    winResize() {
      this.$nextTick(() => { this.resize(); });
    },
    resize() {

      for (let i = 0; i < this.$refs.rbar.length; i++) {
        let width = this.th[i].offsetWidth;
        this.$refs.rbar[i].style.left = this.th[i].offsetLeft + this.th[i].offsetWidth - this.$refs.rbar[i].offsetWidth / 2 + 'px';
        if(this.th[i].classList.contains('sticky')){
          this.$refs.rbar[i].style.left = parseFloat(this.th[i].style.left) + width - this.$refs.rbar[i].offsetWidth / 2 + 'px';
        }
      }
    },
    winResize() {
      this.$nextTick(() => { this.resize(); });
    },

    handleResize(event) {
      if (this.resizeColumn) {
        let i = this.resizeColumnIndex;
        let width = this.resizeColumnWidth + event.x - this.resizeX;
        this.resizeColumn.width = width;
        let j = i;
        this.$refs.rbar[i].style.left = this.th[j].offsetLeft + width - this.$refs.rbar[i].offsetWidth / 2 + 'px';
        if(this.th[j].classList.contains('sticky')){
          this.$refs.rbar[i].style.left = parseFloat(this.th[j].style.left) + width - this.$refs.rbar[i].offsetWidth / 2 + 'px';
        }
      }

    },
    startResize(col, colIndex, event) {
      this.resizeColumn = col;
      this.resizeColumnIndex = colIndex;
      this.resizeX = event.x;
      this.resizeColumnWidth = this.th[colIndex].offsetWidth;
      this.resizeLastColumnWidth = this.th[this.th.length - 1].offsetWidth;

    },
    resizeBarMouseUp() {
      if (this.resizeColumn) {
        this.resize();
      }
      this.resizeColumn = 0;
    },
  },
};
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
  width: 4px;
  cursor: col-resize;
  height: var(--table-height);
}

.columns-resize-bar:hover {
  background-color: gray;
}

.sticky{
  position: sticky;
}
</style>
