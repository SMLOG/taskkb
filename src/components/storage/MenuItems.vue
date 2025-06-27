<template>
  <div
    ref="dropdown"
    class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 animate-fade-in"
  >
    <ul class="py-1">
      <template v-for="(group, groupIndex) in menuItems" :key="`group-${groupIndex}`">
        <li
          v-if="group.label"
          class="px-4 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
        >
          {{ group.label }}
        </li>
        <li
          v-for="(item, index) in group.items||group.items?.values"
          :key="`item-${groupIndex}-${index}`"
          class="relative group"
          @mouseenter="openSubmenu(groupIndex, index)"
          @mouseleave="closeSubmenu"
        >
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
            <span v-if="item.submenu" class="ml-2 text-gray-400">▶</span>
          </a>
          <ul
            v-if="item.submenu && activeSubmenuIndex?.group === groupIndex && activeSubmenuIndex?.item === index"
            class="absolute top-0 mt-[-1px] w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-60"
            :class="getSubmenuPositionClass(groupIndex, index)"
            :ref="el => setSubmenuRef(groupIndex, index, el)"
          >
            <template v-if="item.submenu.length > 0 && item.submenu[0].items.length > 0">
              <template v-for="(subGroup, subGroupIndex) in item.submenu" :key="`subgroup-${groupIndex}-${index}-${subGroupIndex}`">
                <li
                  v-if="subGroup.label"
                  class="px-4 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
                >
                  {{ subGroup.label }}
                </li>
                <li v-for="(submenuItem, subIndex) in subGroup.items" :key="`subitem-${subGroupIndex}-${subIndex}`">
                  <a
                    href="#"
                    class="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors duration-150"
                    @click.prevent="submenuItem.action"
                  >
                    {{ submenuItem.label }}
                  </a>
                </li>
              </template>
            </template>
            <li v-else class="px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400">
              No recent items
            </li>
          </ul>
        </li>
        <li v-if="groupIndex < menuItems.length - 1" class="border-t border-gray-100 dark:border-gray-700"></li>
      </template>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue';
import NewTab from '../dlg/NewTab.vue';
import Save from '../dlg/Save.vue';
import { useAppStore } from '@/stores/appStore';
import { getStorageBridgeByName } from '@/api/bridge';
import { useUserStore } from '@/stores/userStore';
import Config from '../dlg/Config.vue';
import Rename from '../dlg/Rename.vue';
import { downloadJSON } from '@/lib/parse';
import {showNotification,showDialog} from '@/composables/useSystem';
import { useRecentStore } from '@/stores/recentsStore';

const emit = defineEmits(['item-clicked', 'close']);
const props = defineProps({
  showButton: {
    type: [Object, null],
    default: null,
  },
});

const menuItems = ref([
  {
    label: 'File Operations',
    items: [
      { label: 'Save', shortcut: '⌘S', action: () => handleAction('save') },
      { label: 'Save as', action: () => handleAction('save-as') },
      { label: 'New...', shortcut: '⌘N', action: () => handleAction('new') },
      { label: 'Rename...', action: () => handleAction('rename') },
      { label: 'Close', shortcut: '⌘W', action: () => handleAction('close'), destructive: true },
    ],
  },
  {
    label: 'Open Options',
    items: [
      {
        label: 'Open From...',
        submenu: [
          {
            label: 'Cloud Storage',
            items: [
              { label: 'Google Drive', action: () => handleAction('open-from-google-drive') },
              { label: 'Browser', action: () => handleAction('open-from-browser') },
              { label: 'Device', action: () => handleAction('open-from-device') },
              { label: 'LocalStorage(deprecated)', action: () => handleAction('open-from-local') },
            ],
          },
        ],
      },
      {
        label: 'Open Recent',
        submenu: [], // Will be populated dynamically
      },
    ],
  },
  {
    label: 'Import/Export',
    items: [
      { label: 'Export as', action: () => handleAction('export') },
    ],
  },
  {
    label: 'Configure',
    items: [
      { label: 'Configure...', action: () => handleAction('configure') },
    ],
  },
]);

const activeSubmenuIndex = ref(null);
const dropdown = ref(null);
const submenu = ref({});
const submenuPositions = ref({});
const appStore = useAppStore();
const recentStore = useRecentStore();

const recentSubmenu = computed(() => {
  const recentItems = recentStore.recents;
  

  if (!recentItems || recentItems.length === 0) {
    return [
      {
        items: [
          { label: 'No recent files', action: () => {} }
        ]
      }
    ];
  }

  return [
    {
      items: recentItems.map(item => ({
        label: `${item.mode}\t${item.fileName}` ,
        action: () => openRecentFile(item)
      }))
    }
  ];
});

const openRecentFile = async (recentItem) => {
  try {
    emit('close');
    appStore.redirect(recentItem);
  } catch (error) {
    showNotification(`Failed to open recent file: ${error.message}`, 'error');
  }
};

const updateRecentSubmenu = () => {
  const openOptionsGroup = menuItems.value.find(group => group.label === 'Open Options');
  if (openOptionsGroup) {
    const recentItem = openOptionsGroup.items.find(item => item.label === 'Open Recent');
    if (recentItem) {
      recentItem.submenu = recentSubmenu.value;
    }
  }
};

// Debounce utility for resize events
const debounce = (fn, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};

const handleAction = async (id) => {
  try {
    emit('close');
    const storageActions = {
      'open-from-google-drive': 'G',
      'open-from-browser': 'B',
      'open-from-device': 'D',
      'open-from-local': 'L',
    };

    if (storageActions[id]) {
      return await handleStorageAction(id, storageActions[id]);
    }

    switch (id) {
      case 'new':
        await handleNewFile();
        break;
      case 'save':
        await handleSave();
        break;
      case 'save-as':
        await handleSaveAs();
        break;
      case 'configure':
        await showDialog(Config);
        break;
      case 'rename':
        await showDialog(Rename);
        break;
      case 'export':
        handleExport();
        break;
      default:
        break;
    }
  } catch (error) {
   if(error?.message) showNotification(`Action failed: ${error.message}`, 'error');
  }
};

const handleStorageAction = async (id, mode) => {
  try {
    const { pickFile } = await getStorageBridgeByName(mode);
    const user = useUserStore().getUser();
    const auth = await pickFile(user);
    useUserStore().addOrUpdateUser({ ...auth, mode });
    const newPath = { mode, id: auth.file.id, fileName: auth.file.filename };
    appStore.redirect(newPath);
    useRecentStore().addOrUpdateRemoveRecent(appStore.path);
  } catch (error) {
    showNotification(`Failed to open from ${mode}: ${error.message}`, 'error');
    throw error;
  }
};

const handleNewFile = async () => {
  try {
    const orgPath = appStore.path;
    const newPath = await showDialog(Save);
    appStore.newFile();
    await showDialog(NewTab);
    appStore.updatePath({ ...newPath, tabId: appStore.getCurrentTab().id });
    await appStore.saveData();
    useRecentStore().addOrUpdateRemoveRecent(appStore.path);
  } catch (error) {
    showNotification('Failed to create new file', 'error');
    throw error;
  }
};

const handleSaveAs = async () => {
  try {
    const orgPath = appStore.path;
    const newPath = await showDialog(Save);
    appStore.updatePath({ ...newPath, tabId: appStore.getCurrentTab().id });
    await appStore.saveData();
    useRecentStore().addOrUpdateRemoveRecent(appStore.path);
  } catch (error) {
    showNotification('Failed to save file', 'error');
    throw error;
  }
};

const handleSave = async () => {
  try {
    await useAppStore().saveData();
    showNotification('Saved Successfully!', 'success');
    useRecentStore().addOrUpdateRemoveRecent(appStore.path);
  } catch (error) {
    showNotification('Save Failed!', 'error');
    throw error;
  }
};

const handleExport = () => {
  try {
    const data = appStore.exportFile();
    downloadJSON(data, appStore.path.fileName);
  } catch (error) {
    showNotification('Export Failed!', 'error');
    throw error;
  }
};

const handleItemClick = (item) => {
  if (!item.submenu) {
    item.action();
  }
};

const openSubmenu = async (groupIndex, itemIndex) => {
  activeSubmenuIndex.value = { group: groupIndex, item: itemIndex };
  await nextTick();
  calculateSubmenuPosition(groupIndex, itemIndex);
};

const closeSubmenu = () => {
  activeSubmenuIndex.value = null;
};

const setSubmenuRef = (groupIndex, itemIndex, el) => {
  if (el) {
    submenu.value[`${groupIndex}-${itemIndex}`] = el;
  }
};

const calculateSubmenuPosition = (groupIndex, itemIndex) => {
  const submenuEl = submenu.value[`${groupIndex}-${itemIndex}`];
  if (!submenuEl || !dropdown.value) return;

  const dropdownRect = dropdown.value.getBoundingClientRect();
  const submenuWidth = 224; // w-56 (56 * 4 = 224px)
  const viewportWidth = window.innerWidth;
  const spaceOnRight = viewportWidth - (dropdownRect.right + submenuWidth);
  submenuPositions.value[`${groupIndex}-${itemIndex}`] = spaceOnRight < 0 ? 'left' : 'right';
};

const getSubmenuPositionClass = computed(() => (groupIndex, itemIndex) => {
  return submenuPositions.value[`${groupIndex}-${itemIndex}`] === 'left' ? 'left-[-224px]' : 'left-full';
});

const handleClickOutside = (event) => {
  if (
    dropdown.value &&
    !dropdown.value.contains(event.target) &&
    !(props.showButton && (props.showButton.contains(event.target) || props.showButton === event.target))
  ) {
    emit('close');
    closeSubmenu();
  }
};

const debouncedCalculatePosition = debounce((groupIndex, itemIndex) => {
  if (activeSubmenuIndex.value) {
    calculateSubmenuPosition(groupIndex, itemIndex);
  }
}, 100);

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('resize', () => debouncedCalculatePosition(activeSubmenuIndex.value?.group, activeSubmenuIndex.value?.item));
  updateRecentSubmenu();
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('resize', () => {});
});

watch(() => recentStore.recents, () => {
  updateRecentSubmenu();
}, { deep: true });
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
</style>