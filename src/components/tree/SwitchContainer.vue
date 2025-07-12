<template>
  <SwitchButton 
    v-model="activeView" 
    :options="viewOptions" 
    class="view-switcher"
  />
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SwitchButton from '../SwitchButton.vue';

// Constants
const VIEW_OPTIONS = [
  { value: '', label: 'List' },
  { value: 'cards', label: 'Card' },
  { value: 'calendar', label: 'Calendar' }
];

const route = useRoute();
const router = useRouter();

// Reactive state
const viewOptions = ref(VIEW_OPTIONS);
const activeView = ref('');

// Computed
const currentViewFromRoute = computed(() => {
  const firstPathSegment = route.fullPath.split('/')[1]?.toLowerCase() || '';
  return VIEW_OPTIONS.some(opt => opt.value === firstPathSegment) 
    ? firstPathSegment 
    : '';
});

// Methods
function normalizePath(path) {
  return path
    .replace(/^#/, '')              // Remove hash prefix
    .replace(/\/+/g, '/')           // Collapse multiple slashes
    .replace(/\/$/, '')             // Remove trailing slash
    .replace(/^\//, '') || '';      // Remove leading slash
}

function buildNewPath(targetPath, oldPath, currentPath) {
  let newPath = currentPath;
  
  // Remove old path if it exists
  if (oldPath) {
    newPath = newPath.replace(new RegExp(`^/?${oldPath}/?`), '');
  }
  
  // Add new path if it exists
  if (targetPath) {
    newPath = `/${targetPath}/${newPath}`.replace(/\/+/g, '/');
  } else {
    newPath = `/${newPath}`.replace(/\/+/g, '/');
  }
  
  return newPath.replace(/\/$/, '');
}

function handleNavigation(targetPath, oldPath) {
  const currentQuery = { ...route.query };
  const currentPath = normalizePath(location.hash);
  
  const newPath = buildNewPath(targetPath, oldPath, currentPath);
  
  // Only navigate if the path actually changed
  if (newPath !== route.path) {
    router.push({
      path: newPath,
      query: currentQuery // Preserve query parameters
    }).catch(err => {
      console.error('Navigation error:', err);
      // Optionally redirect to a safe fallback
    });
  }
}

// Watchers
watch(currentViewFromRoute, (newVal) => {
  activeView.value = newVal;
}, { immediate: true });

watch(activeView, (newValue, oldValue) => {
  handleNavigation(newValue, oldValue);
});
</script>
