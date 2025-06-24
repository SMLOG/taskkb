<template>
  <div ref="dropdown" class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 animate-fade-in">
    <ul class="py-1 divide-y divide-gray-100 dark:divide-gray-700">
      <li v-for="(item, index) in menuItems" :key="index" class="relative group" @mouseenter="openSubmenu(index)" @mouseleave="closeSubmenu">
        <a
          href="#"
          class="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors duration-150"
          :class="{ 'text-red-600 dark:text-red-400': item.destructive }"
          @click.prevent="handleItemClick(item)"
        >
          <span>{{ item.label }}</span>
          <span v-if="item.shortcut" class="text-xs text-gray-400 dark:text-gray-500">
            {{ item.shortcut }}
          </span>
          <span v-if="item.submenu" class="ml-2 text-gray-400">
            ▶
          </span>
        </a>
        <!-- Submenu -->
        <ul
          v-if="item.submenu && activeSubmenuIndex === index"
          class="absolute top-0 mt-[-1px] w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-60"
          :class="submenuPositionClasses[index]"
          :ref="el => submenu[index] = el"
        >
          <li v-for="(submenuItem, subIndex) in item.submenu" :key="subIndex">
            <a
              href="#"
              class="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors duration-150"
              @click.prevent="submenuItem.action"
            >
              {{ submenuItem.label }}
            </a>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';

const emit = defineEmits(['item-clicked', 'close']);

const activeSubmenuIndex = ref(null);
const dropdown = ref(null);
const submenu = ref([]);
const submenuPositions = ref({});

// Centralized action handler
const handleAction = (id) => {
  emit('item-clicked', id);
};

const menuItems = ref([
  { label: 'Save', shortcut: '⌘S', action: () => handleAction('save') },
  { label: 'Share...', action: () => handleAction('share') },
  {
    label: 'Open From...',
    submenu: [
      { label: 'Google Drive', action: () => handleAction('open-from-google-drive') },
      { label: 'Dropbox', action: () => handleAction('open-from-dropbox') },
      { label: 'OneDrive', action: () => handleAction('open-from-onedrive') },
    ],
  },
  { label: 'Open Recent', action: () => handleAction('open-recent') },
  { label: 'New...', shortcut: '⌘N', action: () => handleAction('new') },
  { label: 'Rename...', action: () => handleAction('rename') },
  { label: 'Make a Copy...', action: () => handleAction('copy') },
  { label: 'Open Folder...', action: () => handleAction('open-folder') },
  { label: 'Import from', action: () => handleAction('import') },
  { label: 'Export as', action: () => handleAction('export') },
  { label: 'Properties...', action: () => handleAction('properties') },
  { label: 'Close', shortcut: '⌘W', action: () => handleAction('close'), destructive: true },
]);

const props = defineProps({
  showButton: {
    default: null,
  },
});

const handleItemClick = (item) => {
  if (!item.submenu) {
    item.action();
  }
};

const openSubmenu = async (index) => {
  activeSubmenuIndex.value = index;
  await nextTick();
  calculateSubmenuPosition(index);
};

const closeSubmenu = () => {
  activeSubmenuIndex.value = null;
};

const calculateSubmenuPosition = (index) => {
  const submenuEl = submenu.value[index];
  if (!submenuEl || !dropdown.value) return;

  const dropdownRect = dropdown.value.getBoundingClientRect();
  const submenuWidth = 224; // w-56 (56 * 4 = 224px)
  const viewportWidth = window.innerWidth;

  const spaceOnRight = viewportWidth - (dropdownRect.right + submenuWidth);
  const shouldOpenLeft = spaceOnRight < 0;

  submenuPositions.value[index] = shouldOpenLeft ? 'left' : 'right';
};

const submenuPositionClasses = computed(() => {
  return menuItems.value.reduce((acc, _, index) => {
    acc[index] = submenuPositions.value[index] === 'left' ? 'left-[-224px]' : 'left-full';
    return acc;
  }, {});
});

const handleClickOutside = (event) => {
  const profileButton = props.showButton;

  if (
    dropdown.value &&
    !dropdown.value.contains(event.target) &&
    !(profileButton && (profileButton.contains(event.target) || profileButton === event.target))
  ) {
    emit('close');
    closeSubmenu();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('resize', () => {
    if (activeSubmenuIndex.value !== null) {
      calculateSubmenuPosition(activeSubmenuIndex.value);
    }
  });
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('resize', () => {});
});
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

.group:hover .submenu {
  display: block;
}

ul ul {
  display: none;
  position: absolute;
  top: 0;
  min-width: 200px;
}

.group:hover ul {
  display: block;
}

a:has(+ ul)::after {
  content: '▶';
  position: absolute;
  right: 1rem;
  color: #9ca3af;
}

.left-[-224px] a:has(+ ul)::after {
  content: '◀';
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