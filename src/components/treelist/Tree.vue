<template>

    <div class="row grid" :class="{'bg-green-300':selectDepths.indexOf(depth)>-1}" :data-depth="depth" v-if="depth!=''" :draggable="isDrag" :style="gridStyle" 
        @dragstart="dragstart" @dragover="dragOver" @drop="drop" >
        <template v-for="(col, cellIndex) in cols" :key="cellIndex" >
            <component v-if="col.cp == 'ColSeq'" class="col td" :is="col.cp" :row="row" :col="col"  ></component>
            <div v-else class="col td">
                <div class="cell">
                    <component :is="col.cp" :row="row" :col="col" ></component>
                </div>
            </div>
        </template>
    </div>
    <template v-if="row && row._childs && row._childs.length && !row._collapsed">
        <tree v-for="(child, index)  in row._childs" :depth="depth+'.'+index" :key="index" :row="child" :cols="cols" :gridStyle="gridStyle" />
    </template>
</template>
<script setup>

import { useDrapDropComposable } from '@/components/useTreeDrapDropComposable'
const { dragOver,dragstart,drop,isDrag,selectDepths
  } = useDrapDropComposable();
</script>
<script>
import ColTitle from '@/components/ColTitle.vue';
import ColDropText from '@/components/ColDropText.vue';
import ColDate from '@/components/ColDate.vue';
import ColSeq from '@/components/ColSeq.vue';

export default {
    components: { ColTitle, ColDropText, ColDate, ColSeq },
    props: {
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
        
        gridStyle:{  type: Object}
    },
    mounted() {
    }
};
</script>
<style src="@/components/grid.css" scoped>
</style>


@/components/useDrapTreeDropComposable@/components/useTreeDrapDropComposable