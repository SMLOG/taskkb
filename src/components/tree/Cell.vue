<template>
    <div class="col td flex" :class="{ sticky: col.sticky }" >
        <div class="cell flex flex-1  px-1">
            <component :is="resolveComponent(col.cp)" :row="row" :col="col" :level="level" :index="id">
            </component>
        </div>
    </div>
</template>

<script setup>
import { defineProps, watch } from 'vue';
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
    },

});


</script>

