<template>
  <div ref="dropdown"
    class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 animate-fade-in">
    <ul class="py-1">
      <template v-for="(group, groupIndex) in menuItems" :key="`group-${groupIndex}`">
        <!-- Group Heading (optional) -->
        <li v-if="group.label"
          class="px-4 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {{ group.label }}
        </li>
        <!-- Group Items -->
        <li v-for="(item, index) in group.items" :key="`item-${groupIndex}-${index}`" class="relative group"
          @mouseenter="openSubmenu(groupIndex, index)" @mouseleave="closeSubmenu">
          <a href="#"
            class="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors duration-150"
            :class="{ 'text-red-600 dark:text-red-400': item.destructive }" @click.prevent="handleItemClick(item)">
            <span>{{ item.label }}</span>
            <span v-if="item.shortcut" class="text-xs text-gray-400 dark:text-gray-500">
              {{ item.shortcut }}
            </span>
            <span v-if="item.submenu" class="ml-2 text-gray-400">
              ▶
            </span>
          </a>
          <!-- Submenu -->
          <ul v-if="item.submenu && activeSubmenuIndex?.group === groupIndex && activeSubmenuIndex?.item === index"
            class="absolute top-0 mt-[-1px] w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-60"
            :class="submenuPositionClasses[`${groupIndex}-${index}`]" :ref="el => setSubmenuRef(groupIndex, index, el)">
            <!-- Submenu Group (if any) -->
            <template v-for="(subGroup, subGroupIndex) in item.submenu"
              :key="`subgroup-${groupIndex}-${index}-${subGroupIndex}`">
              <li v-if="subGroup.label"
                class="px-4 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {{ subGroup.label }}
              </li>
              <li v-for="(submenuItem, subIndex) in subGroup.items" :key="`subitem-${subGroupIndex}-${subIndex}`">
                <a href="#"
                  class="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors duration-150"
                  @click.prevent="submenuItem.action">
                  {{ submenuItem.label }}
                </a>
              </li>
            </template>
          </ul>
        </li>
        <li v-if="groupIndex < menuItems.length - 1" class="border-t border-gray-100 dark:border-gray-700"></li>
      </template>
    </ul>
  </div>
</template>

<script setup>
import { useDialog } from '@/composables/useDialog';
import { ref, computed, nextTick, onMounted, onUnmounted, inject } from 'vue';
import NewTab from '../dlg/NewTab.vue';
import Save from '../dlg/Save.vue';
import { useAppStore } from '@/stores/appStore';
import { getStorageBridgeByName } from '@/api/bridge';
import { useUserStore } from '@/stores/userStore';
import Config from '../dlg/Config.vue';
import Rename from '../dlg/Rename.vue';
import { downloadJSON } from '@/lib/parse';
const emit = defineEmits(['item-clicked', 'close']);

const activeSubmenuIndex = ref(null);
const dropdown = ref(null);
const submenu = ref({});
const submenuPositions = ref({});
const appStore = useAppStore();
const showNotification = inject('showNotification');

// Centralized action handler
const handleAction = async (id) => {
  console.log(id)
  emit('close');
  switch (id) {
    case 'new':
      {
        let orgPath = appStore.path;

        const newPath = await useDialog().dialog().open(Save);
        appStore.newFile();
        await useDialog().dialog().open(NewTab);
        appStore.updatePath({ ...newPath, tabId: appStore.getCurrentTab().id })
        await appStore.saveData();



      }
      break;
    case 'open-from-google-drive':
      {
        const { pickFile } = await getStorageBridgeByName('G');
        const user = useUserStore().getUser();
        const auth = await pickFile(user);
        useUserStore().addOrUpdateUser({ ...auth, mode: 'G' });
        const newPath = { mode: 'G', id: auth.file.id }
        useAppStore().rediret(newPath);

        console.log(auth)

      }
      break;
    case 'open-from-browser':
      {
        const { pickFile } = await getStorageBridgeByName('B');
        const user = useUserStore().getUser();
        const auth = await pickFile(user);
        useUserStore().addOrUpdateUser({ ...auth, mode: 'B' });
        const newPath = { mode: 'B', id: auth.file.id }
        useAppStore().rediret(newPath);

        console.log(auth)

      }
      break;
      case 'open-from-device':
      {
        const { pickFile } = await getStorageBridgeByName('D');
        const user = useUserStore().getUser();
        const auth = await pickFile(user);
        useUserStore().addOrUpdateUser({ ...auth, mode: 'D' });
        const newPath = { mode: 'D', id: auth.file.id }
        useAppStore().rediret(newPath);

        console.log(auth)

      }
      break;
      case 'open-from-local':
      {
        const { pickFile } = await getStorageBridgeByName('L');
        const user = useUserStore().getUser();
        const auth = await pickFile(user);
        useUserStore().addOrUpdateUser({ ...auth, mode: 'L' });
        const newPath = { mode: 'L', id: auth.file.id }
        useAppStore().rediret(newPath);

        console.log(auth)

      }
      break;
    case 'save':
      {

        try {
          await useAppStore().saveData();
          showNotification('Saved Successful!', 'success');
        } catch (error) {
          showNotification('Save Fail!', 'error');
        }


      }
      break;
    case 'configur':
      {

        await useDialog().dialog().open(Config);

      }
      break;
    case 'rename':
      {

        await useDialog().dialog().open(Rename);

      }
      break;
    case 'export':
      {
        const datas = appStore.exportFile();
        downloadJSON(datas, appStore.path.fileName);
      }
      break;
  }
  //emit('item-clicked', id);
};

const menuItems = ref([
  {
    label: 'File Operations',
    items: [
      { label: 'Save', shortcut: '⌘S', action: () => handleAction('save') },
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
      { label: 'Open Recent', action: () => handleAction('open-recent') },
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
      { label: 'Configure...', action: () => handleAction('configur') },
    ],
  },
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
  const shouldOpenLeft = spaceOnRight < 0;

  submenuPositions.value[`${groupIndex}-${itemIndex}`] = shouldOpenLeft ? 'left' : 'right';
};

const submenuPositionClasses = computed(() => {
  return menuItems.value.reduce((acc, group, groupIndex) => {
    group.items.forEach((_, itemIndex) => {
      acc[`${groupIndex}-${itemIndex}`] = submenuPositions.value[`${groupIndex}-${itemIndex}`] === 'left' ? 'left-[-224px]' : 'left-full';
    });
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
    if (activeSubmenuIndex.value) {
      calculateSubmenuPosition(activeSubmenuIndex.value.group, activeSubmenuIndex.value.item);
    }
  });
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('resize', () => { });
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