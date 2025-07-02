<template>
        <div >
            <h2 class="text-gray-400 text-lg mb-4">Error loading file</h2>
            <p class="text-gray-500 mb-6">The file was not found. It does not exist or you do not have access. ()</p>
            <div class="flex justify-center space-x-4">
                <button @click="handleCancel"
                    class="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
                <button @click="handleTryOpen" class="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600">Try
                    opening via this page</button>
                <button @click="handleChangeUser"
                    class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500">Change user</button>
            </div>
        </div>
</template>

<script setup>
import { nextTick } from 'vue';
import { useAppStore } from '@/stores/appStore';

const emit = defineEmits([ "confirm", "cancel"]);


// Define reactive variables or functions
const handleCancel = async () => {
    await nextTick();
    useAppStore().resetPath();
    emit('cancel');
};

const handleTryOpen = () => {
    console.log('Try opening via this page clicked');
};

const handleChangeUser = () => {
    console.log('Change user clicked');
};



</script>
