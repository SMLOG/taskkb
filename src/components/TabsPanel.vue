<template>
  <Tabs/>
  <NewTabPopup v-if="showNewTabPopup" v-model="showNewTabPopup" />
  <ConfirmPopUp v-if="showRmoveConfirmRef>-1" @cancel="showRmoveConfirmRef=-1" @confirm="confirmRemoveTab()"/>
</template>

<script setup>
import { ref } from 'vue';
import { useAppStore } from "@/stores/appStore";
import Tabs from '@/components/Tabs.vue';
import NewTabPopup from '@/components/NewTabPopup.vue';
import ConfirmPopUp from '@/components/ConfirmPopUp.vue';

const showNewTabPopup = ref(false);
const appStore = useAppStore();


const showRmoveConfirmRef = ref(-1);
const confirmRemoveTab = ()=>{
  appStore.removeTab(showRmoveConfirmRef.value);
  showRmoveConfirmRef.value=-1;

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