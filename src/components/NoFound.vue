<template>
    <div
        class="bg-gray-900 fixed inset-0 z-50 flex items-center justify-center flex items-center justify-center h-screen z-99999">
        <div class="bg-gray-800 p-6 rounded-lg shadow-lg text-center border border-gray-700">
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
    </div>
</template>

<script setup>
import { ref } from 'vue';

// Define reactive variables or functions
const handleCancel = () => {
    console.log('Cancel clicked');
};

const handleTryOpen = () => {
    console.log('Try opening via this page clicked');
};

const handleChangeUser = () => {
    console.log('Change user clicked');
};
</script>

<style scoped>
/* Add any custom styles here if needed */
</style>