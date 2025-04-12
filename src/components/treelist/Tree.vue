<template>

    <div class="row grid" v-if="row && row._level > 0" :style="gridStyle" 
        @dragstart="dragstart" @dragover="dragOver" @drop="drop" :draggable="true">
        <template v-for="(col, cellIndex) in cols" :key="cellIndex" >

            <component v-if="col.cp == 'ColSeq'" class="col td" :is="col.cp" :row="row" :col="col" ></component>
            <div v-else class="col td">
                <div class="cell">
                    <component :is="col.cp" :row="row" :col="col"></component>
                </div>
            </div>
        </template>
    </div>
    <template v-if="row && row._childs && row._childs.length && !row._collapsed">
        <tree v-for="(child, index) in row._childs" :key="index" :row="child" :cols="cols" :gridStyle="gridStyle" />
    </template>
</template>
<script setup>

import { useDrapDropComposable } from '@/components/useDrapDropComposable'
const { dragOver,dragstart,drop,
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
        gridStyle:{  type: Object}
    },
    mounted() {
    }
};
</script>
<style src="@/components/grid.css" scoped>
</style>


