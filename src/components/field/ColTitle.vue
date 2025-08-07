<template>
  <div v-if="row" class="h-full flex flex-1">
    <div  class="flex h-full flex-1">
      <div   class="h-full mr-2 z-1 flex">
        <div v-for="p in level-1" :style="{ width:  15 + 'px' }"  class="h-full place"></div>
        <div @click="()=>clickRow(row)" class="h-full" :class="{pt:level>1}" style="width: 15px;text-align: center;">
          <span class="collapse-section"></span>
        </div>
      </div>
      <div class="flex-1">
      <ContentEditable v-model="row['c' + col.fn]"></ContentEditable></div>
    </div>
  </div>
  <div v-else>
    <ContentEditable v-model="col.name"></ContentEditable>
  </div>
</template>

<script setup>
import ContentEditable from './sub/ContentEditable.vue';
const clickRow =(row)=>{
  try{
  row._collapsed = !row._collapsed
  }catch(error){
  }
}
const props = defineProps({
  col: {
    type: Object
  },
  row: {
    type: Object,
    required: false
  },
  level:{
        type: Number,
    required: false
  },value: {
    required: false
  },
});



</script>

<style>
.arrow {
  content: "";
  width: 0;
  height: 0;
  border-left: 0.5em solid transparent;
  border-right: 0.5em solid transparent;
  border-bottom: 0.5em solid #ccc;
  transform: rotate(180deg);
  display: inline-block;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dot {
  content: "";
  width: 0;
  height: 0;
  display: inline-block;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid #ddd;
  border-radius: 2px;
  margin-left: 3px;
}

.place{
  position: relative;
}
.place::after{
  content: '';
    left: 50%;
    position: absolute;
    top: -1px;
    bottom: -1px;
    border-left: 1px solid green;
    z-index: 999;
}


.id {
  min-width: 45px;
  display: inline-block;
  width: 45px;
  overflow: hidden;
}
</style>