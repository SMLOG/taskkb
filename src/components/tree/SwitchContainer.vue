<template>
  <SwitchButton v-model="activeView" :options="viewOptions" />
</template>

<script setup>
import { ref, watch } from 'vue';
import SwitchButton from '../SwitchButton.vue';
import { useRoute, useRouter } from 'vue-router';

const viewOptions = ref([
  { value: '', label: 'List' },
  { value: 'calendar', label: 'Calendar' }
]);
const route = useRoute();

const activeView = ref(viewOptions.value.filter(e => e.value == route.fullPath.split('/')[1]).length > 0 ? route.fullPath.split('/')[1] : '')

const router = useRouter();

function handleNavigation(targetPath, oldPath) {
  // Get current route information
  const currentQuery = { ...route.query };
  const currentFullPath = route.fullPath;

  // Get hash and clean it (remove leading # and normalize slashes)
  let newPath = location.hash.replace(/^#/, '').replace(/\/+/g, '/');

  // Handle path construction based on parameters
  if (targetPath && !oldPath) {
    // Case 1: Adding targetPath to the path
    newPath = `/${targetPath}/${newPath.replace(`/${targetPath}/`, '').replace(/^\//, '')}`;
  } else if (!targetPath && oldPath) {
    // Case 2: Removing oldPath from the path
    newPath = `/${newPath.replace(`/${oldPath}/`, '').replace(/^\//, '')}`;
  } else {
    // Case 3: No changes needed to path structure
    newPath = `/${newPath.replace(/^\//, '')}`;
  }

  // Final path normalization
  newPath = newPath.replace(/\/+/g, '/').replace(/\/$/, ''); // Remove duplicate slashes and trailing slash

  // Only navigate if the new path is different from current
  if (!currentFullPath.startsWith(newPath)) {
    try {
      router.push({
        path: newPath,
        query: currentQuery, // Preserve query parameters
      });
    } catch (error) {
      console.error('Navigation error:', error);
      // Optionally handle navigation errors (e.g., fallback to home)
    }
  }
};
watch(
  () => activeView.value,
  (newValue, oldValue) => {
    handleNavigation(newValue, oldValue);
  },
  { immediate: true }
);

</script>