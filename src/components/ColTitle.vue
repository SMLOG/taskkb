<template>
  <div v-if="row">
    <div style="display: flex">
      <div style="margin-right:15px;z-index: 1;"  :style="{ paddingLeft: (level * 15) + 'px' }">
        <span>{{ row._id }}</span>
        <span @click="()=>clickRow(row)"
          :class="{ dot: !row._childs || !row._childs.length, arrow: row._childs && row._childs.length, collapsed: row._childs && row._childs.length && row._collapsed }"></span>
      </div>
      <ContentEditable v-model="row['c' + col.fn]" @change="change"></ContentEditable>
    </div>
  </div>
  <div v-else>
    <ContentEditable v-model="col.name"></ContentEditable>
  </div>
</template>

<script setup>
import ContentEditable from './ContentEditable.vue';
const clickRow =(row)=>{
  try{
  row._collapsed = !row._collapsed
  }catch(error){
    console.log(error)
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
  }
});

const emit = defineEmits(['change']);

const change = (oldVal, newVal) => {
  console.log(oldVal, newVal, '...');
  emit('change', oldVal, newVal);
};
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

.collapsed {
  transform: rotate(90deg);
}

.id {
  min-width: 45px;
  display: inline-block;
  width: 45px;
  overflow: hidden;
}
</style>