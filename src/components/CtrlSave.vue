<template>

</template>

<script setup>
import { useAppStore } from '@/stores/appStore';

import { onMounted, onUnmounted, inject } from 'vue';

const saveData = async () => {
    try {
        await useAppStore().saveData();
    } catch (error) {
        console.error(error)
    }
}
const handleKeydown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault(); // Prevent browser's default save dialog
        saveData();
    }
};



// Add event listener on mount, remove on unmount
onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
});
</script>