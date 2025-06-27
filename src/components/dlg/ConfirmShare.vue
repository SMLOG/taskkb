<template>
            <p >You'll need to save "{{ fileName }}" to Google Drive before you can collaborate.
            </p>
            <div class="flex justify-center mt-5 space-x-4">
                <button @click="onCancel"
                    class="px-4 py-2 border border-gray-300 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer">Cancel</button>
                <button @click="onSave"
                    class="px-4 py-2  border border-blue-300 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer">Save to Google
                    Drive</button>
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