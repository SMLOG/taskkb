<template>
  <div class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 animate-fade-in overflow-hidden">
    <ul class="py-1 divide-y divide-gray-100 dark:divide-gray-700">
      <li v-for="(item, index) in menuItems" :key="index">
        <a 
          href="#" 
          class="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors duration-150"
          :class="{'text-red-600 dark:text-red-400': item.destructive}"
          @click.prevent="item.action"
        >
          {{ item.label }}
          <span v-if="item.shortcut" class="float-right text-xs text-gray-400 dark:text-gray-500">
            {{ item.shortcut }}
          </span>
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup>
const emit = defineEmits(['item-clicked']);

const menuItems = [
  { label: 'Save', shortcut: '⌘S', action: () => emit('item-clicked', 'save') },
  { label: 'Share...', action: () => emit('item-clicked', 'share') },
  { label: 'Open from', action: () => emit('item-clicked', 'open-from') },
  { label: 'Open Recent', action: () => emit('item-clicked', 'open-recent') },
  { label: 'New...', shortcut: '⌘N', action: () => emit('item-clicked', 'new') },
  { label: 'Rename...', action: () => emit('item-clicked', 'rename') },
  { label: 'Make a Copy...', action: () => emit('item-clicked', 'copy') },
  { label: 'Open Folder...', action: () => emit('item-clicked', 'open-folder') },
  { label: 'Import from', action: () => emit('item-clicked', 'import') },
  { label: 'Export as', action: () => emit('item-clicked', 'export') },
  { label: 'Properties...', action: () => emit('item-clicked', 'properties') },
  { label: 'Close', shortcut: '⌘W', action: () => emit('item-clicked', 'close'), destructive: true },
];
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.15s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
/* Enhanced Dropdown Styles */
.animate-fade-in {
  animation: fadeIn 0.2s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

div[role="menu"] {
  position: absolute;
  top: 100%;
  right: 0;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

ul {
  list-style: none;
  padding: 0;
}

li a {
  text-decoration: none;
  color: #374151;
}

li a:hover {
  background-color: #e0f2fe;
}
</style>