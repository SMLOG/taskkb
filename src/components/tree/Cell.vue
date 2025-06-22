<template>
    <div class="col td flex" :class="{ sticky: col.sticky }" :style="colStyle(col,cellIndex)">
        <div class="cell flex flex-1  px-1">
            <component :is="resolveComponent(col.cp)" :value="cellValue" :row="row" :col="col" :level="level" :index="index">
            </component>
        </div>
    </div>
</template>

<script setup>
import { defineProps, watch,ref } from 'vue';
import { resolveComponent } from '@/components/cpList';

const props = defineProps({
    row: {
        type: Object,
        required: true,
    },
    col: {
        type: Object,
        required: true,
    },
    cellIndex: {
        type: Number,
        required: true
    },
    depth: {
        type: String,
        required: true,
    },

    level: {
        type: Number,
        required: true
    },
    id: {
        type: String,
        default: ''
    },index:{}

});

const colStyle = (col, index) => {
    let style = {};
    if (col.sticky) {
        style.left = `var(--sticky-left-${index})`;
    } else {
        style.left = 'auto';
    }
    return style;
};

const cellValue = ref(props.row['c' + props.col.fn]);

</script>

