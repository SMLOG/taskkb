<script setup>
import { ref, computed } from 'vue';

const jsonData = ref({});
const selectedList = ref([]);
const columnMappings = ref({});
const columnNames = ref({});
const columnExpressions = ref({});
const columnWidths = ref({});
const listProperty = ref('');
const mappingSectionVisible = ref(false);
const tableSectionVisible = ref(false);
const listSelectionVisible = ref(false);
const draggedColumn = ref(null);
const resizingColumn = ref(null);
const startX = ref(0);
const startWidth = ref(0);
const newColumnName = ref('');
const columnToMap = ref('');
const newColumnExpression = ref('value');
const selectedColumn = ref(null);

// Function to recursively find all array properties
const findArrayProperties = (obj, prefix = '') => {
  const arrayProps = [];
  if (Array.isArray(obj)) {
    arrayProps.push('root');
    obj.forEach((item, index) => {
      if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
        arrayProps.push(...findArrayProperties(item, `root[${index}]`));
      }
    });
  } else if (typeof obj === 'object' && obj !== null) {
    Object.keys(obj).forEach(key => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (Array.isArray(obj[key])) {
        arrayProps.push(fullKey);
        if (obj[key].length > 0 && typeof obj[key][0] === 'object' && !Array.isArray(obj[key][0])) {
          obj[key].forEach((item, index) => {
            if (typeof item === 'object' && item !== null) {
              arrayProps.push(...findArrayProperties(item, `${fullKey}[${index}]`));
            }
          });
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        arrayProps.push(...findArrayProperties(obj[key], fullKey));
      }
    });
  }
  return arrayProps;
};

// Computed property for available list properties
const listProperties = computed(() => {
  return findArrayProperties(jsonData.value);
});

// Computed property for JSON object properties
const jsonProperties = computed(() => {
  return selectedList.value.length > 0 ? Object.keys(selectedList.value[0] || {}) : [];
});

// Handle file upload
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        jsonData.value = JSON.parse(e.target.result);
        listSelectionVisible.value = true;
      } catch (err) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  }
};

// Handle list property selection
const handleListSelection = () => {
  if (listProperty.value) {
    let selected = jsonData.value;
    if (listProperty.value === 'root') {
      selected = jsonData.value;
    } else {
      const keys = listProperty.value.split('.').reduce((acc, key) => {
        if (key.includes('[')) {
          const [prop, index] = key.split('[');
          acc.push(prop, parseInt(index.replace(']', '')));
        } else {
          acc.push(key);
        }
        return acc;
      }, []);
      
      try {
        for (const key of keys) {
          selected = selected[key];
          if (!selected) {
            alert('Invalid property path');
            return;
          }
        }
      } catch (err) {
        alert('Error accessing selected property');
        return;
      }
    }
    
    selectedList.value = selected;
    if (!Array.isArray(selectedList.value) || selectedList.value.length === 0 || typeof selectedList.value[0] !== 'object' || Array.isArray(selectedList.value[0])) {
      alert('Selected property must be an array of objects');
      return;
    }
    // Automatically map all properties to columns
    columnMappings.value = {};
    columnNames.value = {};
    columnExpressions.value = {};
    columnWidths.value = {};
    jsonProperties.value.forEach(prop => {
      columnMappings.value[prop] = prop;
      columnNames.value[prop] = prop;
      columnExpressions.value[prop] = 'value';
      columnWidths.value[prop] = '150px';
    });
    mappingSectionVisible.value = true;
    tableSectionVisible.value = true;
  }
};

// Handle column header click to populate form
const handleColumnClick = (column) => {
  selectedColumn.value = column;
  newColumnName.value = columnNames.value[column];
  columnToMap.value = columnMappings.value[column];
  newColumnExpression.value = columnExpressions.value[column];
};

// Clear selection handler
const clearSelection = () => {
  selectedColumn.value = null;
  newColumnName.value = '';
  columnToMap.value = '';
  newColumnExpression.value = 'value';
};

// Add a new column or update existing
const addNewColumn = () => {
  if (!newColumnName.value.trim()) {
    alert('Please enter a column name');
    return;
  }

  const columnKey = selectedColumn.value || `custom_${Date.now()}`;
  
  columnMappings.value[columnKey] = columnToMap.value;
  columnNames.value[columnKey] = newColumnName.value;
  columnExpressions.value[columnKey] = newColumnExpression.value || 'value';
  columnWidths.value[columnKey] = columnWidths.value[columnKey] || '150px';
  
  clearSelection();
};

// Remove mapping and auto-select next column
const removeMapping = (column) => {
  const columns = Object.keys(columnMappings.value);
  const currentIndex = columns.indexOf(column);
  
  const newMappings = { ...columnMappings.value };
  const newNames = { ...columnNames.value };
  const newExpressions = { ...columnExpressions.value };
  const newWidths = { ...columnWidths.value };
  
  delete newMappings[column];
  delete newNames[column];
  delete newExpressions[column];
  delete newWidths[column];
  
  columnMappings.value = newMappings;
  columnNames.value = newNames;
  columnExpressions.value = newExpressions;
  columnWidths.value = newWidths;
  
  // Auto-select next column if available
  if (selectedColumn.value === column) {
    const remainingColumns = Object.keys(newMappings);
    if (remainingColumns.length > 0) {
      const nextIndex = currentIndex < remainingColumns.length ? currentIndex : remainingColumns.length - 1;
      handleColumnClick(remainingColumns[nextIndex]);
    } else {
      clearSelection();
    }
  }
};


// Column reordering handlers
const dragStartColumn = (e, column) => {
  if (resizingColumn.value) {
    e.preventDefault();
    return;
  }
  draggedColumn.value = column;
  e.dataTransfer.setData('text/plain', column);
};

const dragOverColumn = (e) => {
  if (resizingColumn.value) return;
  e.preventDefault();
  e.currentTarget.classList.add('dragover-column');
};

const dragLeaveColumn = (e) => {
  e.currentTarget.classList.remove('dragover-column');
};

const dropColumn = (e, targetColumn) => {
  if (resizingColumn.value) return;
  e.preventDefault();
  e.currentTarget.classList.remove('dragover-column');
  if (draggedColumn.value && draggedColumn.value !== targetColumn) {
    const columns = Object.keys(columnMappings.value);
    const fromIndex = columns.indexOf(draggedColumn.value);
    const toIndex = columns.indexOf(targetColumn);
    
    const newColumns = [...columns];
    newColumns.splice(fromIndex, 1);
    newColumns.splice(toIndex, 0, draggedColumn.value);
    
    const newMappings = {};
    const newNames = {};
    const newExpressions = {};
    const newWidths = {};
    newColumns.forEach(col => {
      newMappings[col] = columnMappings.value[col];
      newNames[col] = columnNames.value[col];
      newExpressions[col] = columnExpressions.value[col];
      newWidths[col] = columnWidths.value[col] || '150px';
    });
    
    columnMappings.value = newMappings;
    columnNames.value = newNames;
    columnExpressions.value = newExpressions;
    columnWidths.value = newWidths;
  }
  draggedColumn.value = null;
};

// Resize handlers
const startResize = (e, column) => {
  e.stopPropagation();
  resizingColumn.value = column;
  startX.value = e.clientX;
  const th = e.target.parentElement;
  startWidth.value = th.getBoundingClientRect().width;
  document.addEventListener('mousemove', resize);
  document.addEventListener('mouseup', stopResize);
};

const resize = (e) => {
  if (resizingColumn.value) {
    const delta = e.clientX - startX.value;
    const newWidth = Math.max(50, startWidth.value + delta);
    columnWidths.value = { ...columnWidths.value, [resizingColumn.value]: `${newWidth}px` };
  }
};

const stopResize = () => {
  resizingColumn.value = null;
  document.removeEventListener('mousemove', resize);
  document.removeEventListener('mouseup', stopResize);
};

// Update column name
const updateColumnName = (prop, value) => {
  columnNames.value = { ...columnNames.value, [prop]: value };
};

// Update column expression
const updateColumnExpression = (prop, value) => {
  columnExpressions.value = { ...columnExpressions.value, [prop]: value || 'value' };
};

// Evaluate expression safely
const evaluateExpression = (expression, value, item, index, list) => {
  try {
    const fn = new Function('value', 'item', 'index', 'list', `return ${expression}`);
    return fn(value, item, index, list);
  } catch (err) {
    console.error('Expression error:', err);
    return `Error: ${err.message}`;
  }
};

// Generate table
const generateTable = () => {
  if (Object.keys(columnMappings.value).length === 0) {
    alert('No columns are mapped. Please select a list to map columns.');
    return;
  }
  tableSectionVisible.value = true;
};

function handleImport() {
  if (selectedList.value.length === 0) {
    alert('No data selected. Please select a valid JSON array.');
    return;
  }
  
  // Here you can handle the import logic, e.g., creating a new tab with the selected data
  console.log('Importing data:', selectedList.value);
  
  // Reset state after import
  jsonData.value = {};
  selectedList.value = [];
  columnMappings.value = {};
  columnNames.value = {};
  columnExpressions.value = {};
  columnWidths.value = {};
  listProperty.value = '';
  mappingSectionVisible.value = false;
  tableSectionVisible.value = false;
}
// Explicitly expose functions needed in template
defineExpose({
  evaluateExpression
});
</script>

<template>
  <div class="h-[85vh] flex flex-col">
    <header class="text-left flex justify-between items-center">
      <h1 class="text-3xl font-bold text-blue-600 mb-2 border-b">Import JSON List to create Tab</h1>
      <button @click="handleImport" class="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors">OK</button>
    </header>

    <div class="flex flex-col flex-1 lg:flex-row gap-6">
      <!-- Left Sidebar - Controls -->
      <div class="lg:w-80 flex flex-col gap-6 relative">
        <div class="absolute inset-0 overflow-y-auto">
                  <!-- Data Input Card -->
        <div class="bg-gray-50 p-5 rounded-lg shadow">
          <h2 class="text-xl font-semibold mb-4 text-blue-500 border-b pb-2">Data Input</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Upload JSON File</label>
              <input type="file" accept=".json" @change="handleFileUpload"
                class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition-colors">
            </div>

            <div v-if="listSelectionVisible">
              <label class="block text-sm font-medium text-gray-700 mb-2">Select Data Array</label>
              <select v-model="listProperty" @change="handleListSelection"
                class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2 border">
                <option value="">Select a property</option>
                <option v-for="prop in listProperties" :key="prop" :value="prop">{{ prop }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Column Management Card -->
        <div class="bg-gray-50 p-5 rounded-lg shadow" v-if="mappingSectionVisible">
          <h2 class="text-xl font-semibold mb-4 text-blue-500 border-b pb-2">Column Management</h2>
          <div class="space-y-4">
            <div>
              <h3 class="font-medium text-gray-700 mb-3">
                {{ selectedColumn ? `Editing: ${columnNames[selectedColumn]}` : 'Create New Column' }}
              </h3>
              
              <div class="space-y-3">
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">Column Name</label>
                  <input v-model="newColumnName" type="text" placeholder="Enter column name"
                    class="w-full rounded border-gray-300 border p-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                </div>
                
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">Map to Property</label>
                  <select v-model="columnToMap" 
                    class="w-full rounded border-gray-300 border p-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select property (optional)</option>
                    <option v-for="prop in jsonProperties" :key="prop" :value="prop">{{ prop }}</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">Transformation</label>
                  <input v-model="newColumnExpression" type="text" placeholder="value.toUpperCase()"
                    class="w-full rounded border-gray-300 border p-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                  <p class="text-xs text-gray-400 mt-1">Use 'value' to reference the mapped property</p>
                </div>
                
                <div class="flex space-x-2 pt-2">
                  <button @click="addNewColumn" 
                    class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors">
                    {{ selectedColumn ? 'Update' : 'Add' }}
                  </button>
                  
                  <button v-if="selectedColumn" @click="clearSelection" 
                    class="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg transition-colors">
                    Cancel
                  </button>
                </div>
                
                <div v-if="selectedColumn" class="pt-2 border-t">
                  <button @click="removeMapping(selectedColumn)" 
                    class="w-full text-red-500 hover:text-red-700 text-sm flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove Column
                  </button>
                </div>
              </div>
            </div>
            
            <div class="pt-2 border-t">
              <button @click="generateTable" 
                class="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors">
                Refresh Table View
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>

      <!-- Main Table Area -->
      <div class="flex flex-1" v-if="tableSectionVisible">
        <div class="flex flex-1 flex-col">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold text-blue-500">Table Preview</h2>
            <span class="text-sm text-gray-500">{{ selectedList.length }} rows</span>
          </div>
          
<div class="flex-1 relative">
            <!-- Table Container with Sticky Headers -->
          <div class="overflow-auto border rounded-lg flex-1 absolute h-full w-full inset-0">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th v-for="column in Object.keys(columnMappings)" :key="column" 
                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-move relative group"
                    :style="{ width: columnWidths[column] || '180px' }"
                    draggable="true"
                    @dragstart="dragStartColumn($event, column)"
                    @dragover="dragOverColumn" 
                    @dragleave="dragLeaveColumn" 
                    @drop="dropColumn($event, column)"
                    @click="handleColumnClick(column)">
                    
                    <div class="flex items-center justify-between">
                      <span class="truncate">{{ columnNames[column] }}</span>
                      <span class="text-gray-400 text-xs ml-2">{{ columnMappings[column] || 'custom' }}</span>
                    </div>
                    
                    <div class="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-gray-200 opacity-0 group-hover:opacity-100"
                      @mousedown="startResize($event, column)">
                    </div>
                    
                    <div v-if="selectedColumn === column" class="absolute inset-0 border-2 border-blue-400 pointer-events-none"></div>
                  </th>
                </tr>
              </thead>
              
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(item, index) in selectedList.slice(0, 100)" :key="index" class="hover:bg-gray-50">
                  <td v-for="column in Object.keys(columnMappings)" :key="column" class="px-4 py-2 text-sm text-gray-700"
                    :style="{ width: columnWidths[column] || '180px' }">
                    <div class="truncate">
                      {{
                        evaluateExpression(
                          columnExpressions[column],
                          columnMappings[column] ? item[columnMappings[column]] : null,
                          item,
                          index,
                          selectedList
                        )
                      }}
                    </div>
                  </td>
                </tr>
                
                <tr v-if="selectedList.length > 100">
                  <td :colspan="Object.keys(columnMappings).length" class="px-4 py-2 text-sm text-center text-gray-500">
                    Showing first 100 of {{ selectedList.length }} rows
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.draggable {
  cursor: move;
  user-select: none;
}
.dropzone {
  min-height: 100px;
  border: 2px dashed #ccc;
}
.dropzone.dragover {
  background-color: #e0f7fa;
}
th.dragover-column {
  background-color: #e0f7fa;
  border: 2px dashed #93c5fd;
}

/* Improved scrollbar for table */
::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Sticky header implementation */
.relative {
  position: relative;
}
.max-h-[70vh] {
  max-height: 70vh;
}
.sticky {
  position: sticky;
}
.top-0 {
  top: 0;
}
.z-10 {
  z-index: 10;
}

/* Header shadow when scrolled */
.scrolled thead {
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
</style>