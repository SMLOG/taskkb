<template>
  <div id="operation"
    class="bottom-0 left-0 z-7 bg-white dark:bg-gray-900 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-1px_rgba(0,0,0,0.06)]">
    <div class="mx-auto px-1">
      <div class="flex flex-col sticky left-0 bottom-0 active">
        <div class="flex just-between">
          <div class="flex flex-wrap items-center gap-2 py-3 flex-1">
            <div class="flex items-center gap-2 pr-2  border-gray-200 dark:border-gray-700 sm:just-between">
              <button @click="saveData(0)" class="btn-secondary" :disabled="saved || savingRef"
                :class="{ '!bg-red-100 !text-red-700 !dark:bg-red-900 !dark:text-red-200': !saved }">
                💾 <span v-if="savingRef">Saving...</span> <span v-else-if="saved">Saved</span><span v-else>Unsaved
                  changes. Click here to save.</span>
              </button>
              <button
                class="p-2 md:hidden rounded-full hover:bg-white/20 transition-all duration-300 transform hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>

            <div id="more">
              <div class="flex gap-2">

                <div class="flex items-center gap-2 pr-2 border-r border-gray-200 dark:border-gray-700">
                  <button @click="addRow(1)" class="btn-secondary">
                    ＋{{ selectDepths.length > 0 ? selectDepths.length : '' }}
                  </button>
                  <button v-if="selectDepths.length == 1" @click="copyNode" class="btn-secondary">
                    ⎘ Copy
                  </button>
                  <button v-if="selectDepths.length" @click="deleteSelectedNodes()" class="btn-secondary">
                    ✕ Delete {{ selectDepths.length }}
                  </button>
                </div>
                <div class="relative" @blur="showDropdown = false" ref="menuRef">
                  <button ref="moreButton" @click="handleShowDropdown" @mouseleave="handleMouseLeave"
                    class="btn-secondary">
                    ⋮ Export
                  </button>
                  <div v-show="showDropdown" :class="[
                    'absolute left-0 w-55 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10',
                    dropdownPosition === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'
                  ]" tabindex="-1" @mouseleave="showDropdown = false" @mouseenter="cleanTimeout">
                    <button @click="download" class="btn-link w-full text-left px-3 py-2">
                      📤 Export(JSON)
                    </button>
                    <button @click="exportCSV" class="btn-link w-full text-left px-3 py-2">
                      📊 Export <span v-if="selectDepths.length">Selected({{ selectDepths.length }})</span> (CSV)
                    </button>
                    <button @click="csvToMarkdown" class="btn-link w-full text-left px-3 py-2">
                      📝 Copy <span v-if="selectDepths.length">Selected({{ selectDepths.length }})</span> to
                      Clipboard(Markdown)
                    </button>
                    <button @click="copyClipboard" class="btn-link w-full text-left px-3 py-2">
                      📋 Copy <span v-if="selectDepths.length">Selected({{ selectDepths.length }})</span> to
                      Clipboard(CSV)
                    </button>
                  </div>
                </div>
                <button @click="openConfig" class="btn-secondary">
                  ⚙ Config
                </button>
                <div class="flex items-center gap-2">
                  <FullscreenToggle />
                </div>
              </div>
              <div class=" gap-2 py-3">
                <SwitchContainer />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import { useTree } from '@/composables/useTree';
import Config from '@/components/dlg/Config.vue';
import { useAppStore } from "@/stores/appStore";
import { storeToRefs } from 'pinia'
import { downloadJSON } from '@/lib/parse';
import { showNotification } from '@/composables/useSystem';
import { showDialog } from '@/composables/useSystem';
import FullscreenToggle from '../FullscreenToggle.vue';
import SwitchContainer from './SwitchContainer.vue';
import { selectDepths } from '@/composables/context';

const saved = computed(() => useAppStore().saved);

watch(
  () => useAppStore().tabsDataMapRef,
  (newValue, oldValue) => {
    console.log('update ...');
    useAppStore().setSaved(false);
  },
  { immediate: true, deep: true }
);

const tree = useTree();

const openConfig = async () => {
  await showDialog(Config, null, { size: '2md' });
}




const { configRef, treeRef } = storeToRefs(useAppStore());

const menuRef = ref(null);
const showDropdown = ref(false);
const moreButton = ref(null);
const dropdownPosition = ref('top');
const DROPDOWN_HEIGHT = 200;

const savingRef = ref(false);


const handleClickOutside = (event) => {
  if (menuRef.value && !menuRef.value.contains(event.target)) {
    showDropdown.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

const handleShowDropdown = () => {
  if (!moreButton.value) return;

  const rect = moreButton.value.getBoundingClientRect();
  const spaceAbove = rect.top;
  const spaceBelow = window.innerHeight - rect.bottom;

  dropdownPosition.value = spaceAbove < DROPDOWN_HEIGHT && spaceBelow >= DROPDOWN_HEIGHT ? 'bottom' : 'top';
  showDropdown.value = true;
  cleanTimeout();
};

const timeout = ref(0);
const handleMouseLeave = () => {
  timeout.value = setTimeout(() => {
    showDropdown.value = false;

  }, 200);
}
const cleanTimeout = () => {
  window.clearTimeout(timeout.value);

}

function download() {
  let data = JSON.parse(JSON.stringify(treeRef.value));
  configRef.value.title = useAppStore().getCurrentTab().title;
  downloadJSON({ data, config: configRef.value, timestamp: new Date().getTime() }, useAppStore().getCurrentTab().title + ".json");
}

async function saveData(bool) {

  if (saved?.value) return;
  if (savingRef.value) return;

  if (!bool) {
    try {
      savingRef.value = true;
      await useAppStore().saveData();
      showNotification('Saved Successful!', 'success');
    } catch (error) {
      showNotification('Save Fail!', 'error');
    }
    savingRef.value = false;

  }
}


function deleteSelectedNodes() {
  if (confirm("Please confirm to delete it?")) {
    tree.delSelectedNode();
    saveData(true);
  }
}

function addRow(num) {
  tree.insertNode({});
}

function copyNode() {
  tree.copySelectedNode();
}

function dowloadText(text, name) {
  let link = document.createElement("a");
  link.setAttribute("download", name);
  link.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  document.body.append(link);
  link.click();
  document.body.removeChild(link);
}

function exportCSV() {
  let text = tree.exportCSV(configRef.value);
  dowloadText(text, configRef.value.title + ".csv");
  showNotification('export CSV', 'success');
}

function csvToMarkdown() {
  let csvString = tree.exportCSV(configRef.value, true);
  const lines = csvString.trim().split('\n');
  const table = lines.map(line => line.split(',').map(item => item.trim()));
  let markdown = [];
  const header = table[0];
  markdown.push('| ' + header.join(' | ') + ' |');
  markdown.push('|-' + '-|-'.repeat(header.length - 1) + '-|');
  for (let i = 1; i < table.length; i++) {
    markdown.push('| ' + table[i].join(' | ') + ' |');
  }
  let md = markdown.join('\n');
  navigator.clipboard.writeText(md).then(function () {
    showNotification('copied to clipboard!', 'success');
  }).catch(function (err) {
    console.error('Could not copy text: ', err);
  });
  return markdown.join('\n');
}

function copyClipboard() {
  let text = tree.exportCSV(configRef.value, false, '\t');
  navigator.clipboard.writeText(text).then(function () {
    showNotification('copied to clipboard!', 'success');
  }).catch(function (err) {
    console.error('Could not copy text: ', err);
  });
}

</script>
<style>
@reference "@/assets/main.css";

button {
  @apply px-2 py-1 text-xs font-medium rounded-md transition-colors duration-200;
}

.btn-secondary {
  @apply bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:border-gray-600;
}

.btn-info {
  @apply bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600;
}

.btn-warning {
  @apply bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600;
}

.btn-link {
  @apply text-blue-600 hover:text-blue-800 hover:bg-gray-100 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-gray-700 no-underline;
}
</style>