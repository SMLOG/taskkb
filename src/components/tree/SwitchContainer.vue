<template>
  <SwitchButton 
    v-model="activeView" 
    :options="viewOptions" 
    class="view-switcher"
  />
</template>

<script setup>
import { watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useViewStore } from '@/stores/view';
import SwitchButton from '../SwitchButton.vue';

const route = useRoute();
const router = useRouter();
const viewStore = useViewStore();

// Access store properties
const activeView = computed({
  get: () => viewStore.activeView,
  set: (value) => viewStore.setActiveView(value)
});

const viewOptions = computed(() => viewStore.viewOptions.filter(opt => opt.show !== false));

// Computed
const currentViewFromRoute = computed(() => {
  const firstPathSegment = route.fullPath.split('/')[1]?.toLowerCase() || '';
  return viewStore.viewOptions.some(opt => opt.value === firstPathSegment) 
    ? firstPathSegment 
    : '';
});

// Methods (same as before)
function normalizePath(path) {
  return path
    .replace(/^#/, '')
    .replace(/\/+/g, '/')
    .replace(/\/$/, '')
    .replace(/^\//, '') || '';
}

function buildNewPath(targetPath, oldPath, currentPath) {
  let newPath = currentPath;
  if (oldPath) {
    newPath = newPath.replace(new RegExp(`^/?${oldPath}/?`), '');
  }
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
  
  if (newPath !== route.path) {
    router.push({
      path: newPath,
      query: currentQuery
    }).catch(err => {
      console.error('Navigation error:', err);
    });
  }
}

// Watchers
watch(currentViewFromRoute, (newVal) => {
  if (newVal !== viewStore.activeView) {
    viewStore.setActiveView(newVal);
  }
}, { immediate: true });

watch(() => viewStore.activeView, (newValue, oldValue) => {
  handleNavigation(newValue, oldValue);
});
</script>