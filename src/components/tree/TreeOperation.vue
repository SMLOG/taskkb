<template>
  <div id="operation" class="bottom-0 left-0 z-7 bg-white dark:bg-gray-900 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-1px_rgba(0,0,0,0.06)]">
    <div class="mx-auto px-1">
      <div class="flex flex-col sticky left-0 bottom-0 active">
        <div class="flex just-between">
          <div class="flex flex-wrap items-center gap-2 py-3 flex-1">
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

            <div class="flex items-center gap-2 pr-2 border-r border-gray-200 dark:border-gray-700">
              <button @click="saveData(0)" class="btn-secondary" :disabled="savingRef">
                💾 Save {{ savingRef ? "..." : "" }}
              </button>
              <button @click="openConfig" class="btn-secondary">
                ⚙ Config
              </button>
            </div>

            <div class="relative" @blur="showDropdown = false" ref="menuRef">
              <button ref="moreButton" @mouseenter="handleShowDropdown" @focus="handleShowDropdown"
                @click="handleShowDropdown" @mouseleave="handleMouseLeave" class="btn-secondary">
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
                  📋 Copy <span v-if="selectDepths.length">Selected({{ selectDepths.length }})</span> to Clipboard(CSV)
                </button>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <FullscreenToggle />
            </div>
          </div>
          <div class=" gap-2 py-3">
            <SwitchButton v-model="activeView" :options="viewOptions" />
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

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

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useTree } from '@/composables/useTree';
import Config from '@/components/dlg/Config.vue';
import { useAppStore } from "@/stores/appStore";
import { storeToRefs } from 'pinia'
import { downloadJSON } from '@/lib/parse';
import { showNotification } from '@/composables/useSystem';
import { showDialog } from '@/composables/useSystem';
import FullscreenToggle from '../FullscreenToggle.vue';
import SwitchButton from '../SwitchButton.vue';
import { useRoute, useRouter } from 'vue-router';
import {selectDepths } from '@/composables/context';



const viewOptions = ref([
  { value: '', label: 'List' },
  { value: 'calendar', label: 'Calendar' }
]);
const route = useRoute();

const activeView = ref(viewOptions.value.filter(e=>e.value==route.fullPath.split('/')[1]).length>0?route.fullPath.split('/')[1]:'')

const router = useRouter();

const handleNavigation = (targetPath, oldPath) => {

  
  // Navigate if not on the target route
  const currentQuery = { ...route.query };
  console.log(route.fullPath)
  let newPath =location.hash.replace(/^#/,'');
  
 

  
  
  // Ensure path starts with a single slash
  if (!oldPath && targetPath) {
    newPath = targetPath+'/'+newPath.replace('/'+targetPath+'/','').replace(/^\//, ''); // Added safeguard against double slashes
  }else if(!targetPath &&oldPath){
    newPath = newPath.replace('/'+oldPath+'/','')
  }
  
  // Ensure we don't end up with double slashes
  newPath = ('/'+newPath).replace(/\/+/g, '/').replace('//', '/');

  
  if(route.fullPath.indexOf(newPath)!==0)
  router.push({
    path: newPath,
    query: currentQuery, // Preserve query parameters
  });
};
watch(
  () => activeView.value,
  (newValue,oldValue) => {
    handleNavigation(newValue,oldValue);
  },
  { immediate: true }
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