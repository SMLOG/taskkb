<template>
  <div class="vue-columns-resizable" style="position: absolute;
    top: 0;
    right: 0;
    left: 0;">
    <div ref="justDiv" class="vsp" style="height: 1px;width:0px;"></div>
    <template v-for="(col, key) in cols" :key="key">
      <div class="columns-resize-bar"   ref="rbar" @mousedown="startResize(col, key, $event)"></div>
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
      lastStickyBar:-1,
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
      document.documentElement.style.setProperty('--scroll-left','0px');
      document.querySelector('#mainContent').addEventListener('scroll',()=>{
      document.documentElement.style.setProperty('--scroll-left',  document.querySelector('#mainContent').scrollLeft+'px');
      this.scrollEventHanlder();
    });
  


  },
  methods: {
    scrollEventHanlder(){
        this.reAdjustBars();
    },
     reAdjustBars() {
  let nextStickyLeft = 0;
  let lastSticky=-1;
  for (let i = 0; i < this.$refs.rbar.length; i++) {
    this.$refs.rbar[i].style.left =
      this.th[i].offsetLeft +
      this.th[i].offsetWidth -
      this.$refs.rbar[i].offsetWidth / 2 +
      "px";
    if (this.th[i].classList.contains("sticky")) {
      document.documentElement.style.setProperty('--sticky-left-'+(i),  nextStickyLeft+'px');
      if(this.th[i].getBoundingClientRect().x===nextStickyLeft&&document.querySelector('#mainContent').scrollLeft>0){
        lastSticky=i;
      }

      nextStickyLeft = nextStickyLeft + parseFloat(this.th[i].offsetWidth);
    }
  }
  /*if(lastSticky>-1)  {
    this.$refs.justDiv.style.width= this.$refs.rbar[lastSticky].style.left;

  }else{
    this.$refs.justDiv.style.width='0'
  }*/
},
    winResize() {
      for (let i = 0; i < this.$refs.rbar.length; i++) 
      document.documentElement.style.removeProperty('--sticky-left-'+(i));
      /*this.resize();*/
      this.$nextTick(() => { this.reAdjustBars(); });
    },

    handleResize(event) {
      if (this.resizeColumn) {
        let i = this.resizeColumnIndex;
        let width = this.resizeColumnWidth + event.x - this.resizeX;
        this.resizeColumn.width = width;
        let j = i;
        this.$refs.rbar[i].style.left = this.th[j].offsetLeft + width - this.$refs.rbar[i].offsetWidth / 2 + 'px';
        if(this.th[j].classList.contains('sticky')){
         this.winResize();
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
        this.reAdjustBars();
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
.stickyed{
  border-right: 1px solid red;
  position: sticky!important;;
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

.sticky{
  position: sticky;
}
.vsp::after{
  background-color: gray;
    content: "";
    width: 1px;
    display: block;
    position: absolute;
    right: 0;
}
.vsp{
  position: sticky;
    background: yellow;
    z-index: 1111;
    left: 0;
    top:0;
}
</style>
