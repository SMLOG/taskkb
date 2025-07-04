<template>
  <div class="max-w-md mx-2 mt-1 relative">
    <div class="flex items-center space-x-2">
      <!-- Menu Button -->
      <button
        ref="showMenu"
        @click="showDropDownMenuItems"
        aria-label="Open menu"
        class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 transition-colors duration-200"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle data-v-8a269fda="" cx="4" cy="12" r="3" fill="currentColor"></circle>
          <circle data-v-8a269fda="" cx="12" cy="12" r="3" fill="currentColor"></circle>
          <circle data-v-8a269fda="" cx="20" cy="12" r="3" fill="currentColor"></circle>
        </svg>
      </button>

      <!-- Share Button -->
      <button
        @click="handleShare"
        aria-label="Share content"
        class="flex items-center px-2 py-1 text-xs font-medium rounded bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200"
      >
        <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
          <path
            d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7l-7.05 4.11c-.54-.5-1.25-.81-2.04-.81-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"
          />
        </svg>
        Share
      </button>

      <!-- Profile Button -->
      <button
        ref="showProfileButton"
        @click="toggleShowProfile"
        aria-label="Toggle profile"
        class="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200"
      >
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <path
            d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
          />
        </svg>
      </button>
    </div>

    <!-- Dropdown Menu -->
    <MenuItems
      v-if="isMenuVisible"
      :showButton="showMenu"
      @close="isMenuVisible = false"
      @keydown.escape="isMenuVisible = false"
    />

    <!-- Profile Panel -->
    <Profile
      v-if="isProfileVisible"
      :showProfileButton="showProfileButton"
      @close="isProfileVisible = false"
      @keydown.escape="isProfileVisible = false"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Profile from './Profile.vue';
import MenuItems from './MenuItems.vue';
import { getStorageBridgeByName } from '@/api/bridge';
import { useAppStore } from '@/stores/appStore';
import { useUserStore } from '@/stores/userStore';
import { showDialog, showNotification } from '@/composables/useSystem';
import ConfirmShare from '../dlg/ConfirmShare.vue';

// State
const isProfileVisible = ref(false);
const isMenuVisible = ref(false);
const showProfileButton = ref(null);
const showMenu = ref(null);

// Handle share action with error handling
const handleShare = async () => {
  try {
    const appStore = useAppStore();
    const userStore = useUserStore();

    if (appStore.path.mode !== 'G') {
      await showDialog(ConfirmShare);
      const { pickFolder } = await getStorageBridgeByName('G');
      const user = userStore.getUser();
      const auth = await pickFolder(user);
      const mode = 'G';
      userStore.addOrUpdateUser({ ...auth, mode });
      
      const newPath = { 
        mode, 
        id: undefined, 
        parent: { id: auth.parent.id } 
      };
      appStore.updatePath({ ...appStore.path, ...newPath });
      await appStore.saveData();
    }

    const { openShareDialog } = await getStorageBridgeByName('G');
    const user = userStore.getUser();
    const fileId = appStore.path.id;
    await openShareDialog(user, fileId);
  } catch (error) {
    console.error('Share operation failed:', error);
    // Optionally show error dialog to user
    await showNotification( 'Failed to share content. Please try again.', 'error');
  }
};

// Toggle profile visibility
const toggleShowProfile = () => {
  isProfileVisible.value = !isProfileVisible.value;
  if (isProfileVisible.value) {
    isMenuVisible.value = false; // Close menu if profile opens
  }
};

// Toggle dropdown menu
const showDropDownMenuItems = () => {
  isMenuVisible.value = !isMenuVisible.value;
  if (isMenuVisible.value) {
    isProfileVisible.value = false; // Close profile if menu opens
  }
};
</script>

<style scoped>
@reference "@/assets/main.css";

button {
  @apply transition-colors duration-200 ease-in-out;
}

button svg {
  @apply shrink-0;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .max-w-md {
    @apply max-w-full;
  }
}

</style>