<template>
  <Tabs>
    <button @click="addTab"
      class="plus-button text-gray-500 hover:text-blue-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-gray-700 rounded-full transition-all duration-200"
      title="Add New Tab">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
      </svg>
    </button>
  </Tabs>
  <NewTabPopup v-if="showNewTabPopup" v-model="showNewTabPopup" />
  <ConfirmPopUp v-if="showRmoveConfirmRef > -1" @cancel="showRmoveConfirmRef = -1" @confirm="confirmRemoveTab()" />
</template>

<script setup>
import { ref } from 'vue';
import { useAppStore } from "@/stores/appStore";
import Tabs from '@/components/Tabs.vue';
import NewTabPopup from '@/components/NewTabPopup.vue';
import ConfirmPopUp from '@/components/ConfirmPopUp.vue';

const appStore = useAppStore();

const showNewTabPopup = ref(false);

const addTab = () => {
  showNewTabPopup.value = true;
};

const showRmoveConfirmRef = ref(-1);
const confirmRemoveTab = () => {
  appStore.removeTab(showRmoveConfirmRef.value);
  showRmoveConfirmRef.value = -1;

}

</script>

<style scoped>
.plus-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-left: 8px;
}
</style>