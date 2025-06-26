<template>
    <div class="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
        <div class="bg-white p-5 rounded-lg shadow-lg w-80 text-center">
            <p class="text-gray-700">You'll need to save "{{ fileName }}" to Google Drive before you can collaborate.
            </p>
            <div class="flex justify-center mt-5 space-x-4">
                <button @click="onCancel"
                    class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">Cancel</button>
                <button @click="onSave"
                    class="px-4 py-2 bg-blue-100 border border-blue-300 rounded-lg hover:bg-blue-200">Save to Google
                    Drive</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useAppStore } from '@/stores/appStore';
import { ref } from 'vue';
const emit = defineEmits(["confirm", "cancel"]);


const fileName = ref(useAppStore().path.fileName);

const onCancel = () => {
    emit('cancel')
};

const onSave = () => {
   emit('confirm')
};
</script>

<style></style>