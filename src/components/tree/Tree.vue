<template>
    <div class="row grid" 
         :class="{selected: selectDepths.indexOf(depth) > -1}" 
         :data-depth="depth" 
         v-if="depth !== ''" 
         :draggable="isDrag" 
         :style="gridStyle" 
         @dragstart="dragstart" 
         @dragover="dragOver" 
         @drop="drop">
        <template v-for="(col, cellIndex) in cols" :key="cellIndex">
            <component v-if="col.cp === 'ColSeq'" 
                      class="col td" 
                      :is="resolveComponent(col.cp)"
                      :row="row"
                      :col="col" 
                      :class="{sticky: col.sticky}" 
                      :style="colStyle(col, 1, cellIndex)"
                      :index="id"
                      >


            </component>
            <div v-else 
                 class="col td" 
                 :class="{sticky: col.sticky}" 
                 :style="colStyle(col, 1, cellIndex)">
                <div class="cell">
                    <component :is="resolveComponent(col.cp)"
                              :row="row" 
                              :col="col"
                              :level="level"
                              >
                    </component>
                </div>
            </div>
        </template>
    </div>
    <template v-if="row && row._childs && row._childs.length && !row._collapsed">
        <tree v-for="(child, index) in row._childs" 
              :depth="depth + '.' + index" 
              :key="index" 
              :row="child" 
              :cols="cols" 
              :level="level+1"
              :id="(id?id+'.':'')+(index+1)"
              :gridStyle="gridStyle" />
    </template>
</template>

<script setup>
import { useTree } from '@/components/tree/useTree';
import ColTitle from '@/components/ColTitle.vue';
import ColDropText from '@/components/ColDropText.vue';
import ColDate from '@/components/ColDate.vue';
import ColSeq from '@/components/ColSeq.vue';
import { defineProps } from 'vue';

// Define props
const props = defineProps({
    row: {
        type: Object,
        required: true,
    },
    cols: {
        type: Array,
        required: true,
    },
    depth: {
        type: String,
        required: true,
    },
    gridStyle: {
        type: Object
    },
    level:{
        type:Number,
        required:true
    },id:{

    }
});

// Drag and drop composable
const { dragOver, dragstart, drop, isDrag, selectDepths } = useTree();

// Column style function
const colStyle = (col, isH, index) => {
    let style = {};
    if (col.sticky) {
        style.left = `var(--sticky-left-${index})`;
    } else {
        style.left = 'auto';
    }
    return style;
};

const componentMap = {
  ColTitle,
  ColDropText,
  ColDate,
  ColSeq,
};
// Resolve component dynamically
const resolveComponent = (cp) => {
  return componentMap[cp] || null; // Fallback to null if component not found
};

</script>

<style src="@/components/tree.css" scoped>
</style>@/components/tree/useTree