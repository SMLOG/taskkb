<script setup>
import { ref, computed } from 'vue';

const jsonData = ref({});
const selectedList = ref([]);
const columnMappings = ref({});
const columnNames = ref({});
const columnExpressions = ref({});
const listProperty = ref('');
const mappingSectionVisible = ref(false);
const tableSectionVisible = ref(false);
const listSelectionVisible = ref(false);

// Function to recursively find all array properties
const findArrayProperties = (obj, prefix = '') => {
  const arrayProps = [];
  // Check if the root is an array
  if (Array.isArray(obj)) {
    arrayProps.push('root');
    // Process each item in the root array if they are objects
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
      selected = jsonData.value; // Root is the array
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
    columnMappings.value = {};
    columnNames.value = {};
    columnExpressions.value = {};
    jsonProperties.value.forEach(prop => {
      columnNames.value[prop] = prop; // Default column name
      columnExpressions.value[prop] = 'value'; // Default expression
    });
    mappingSectionVisible.value = true;
  }
};

// Drag and drop handlers
const dragStart = (e, property) => {
  e.dataTransfer.setData('text/plain', property);
};

const dragOver = (e) => {
  e.preventDefault();
  e.currentTarget.classList.add('dragover');
};

const dragLeave = (e) => {
  e.currentTarget.classList.remove('dragover');
};

const drop = (e, column) => {
  e.preventDefault();
  e.currentTarget.classList.remove('dragover');
  const property = e.dataTransfer.getData('text/plain');
  columnMappings.value = { ...columnMappings.value, [column]: property };
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
    return `Error: ${err.message}`;
  }
};

// Generate table
const generateTable = () => {
  if (Object.keys(columnMappings.value).length === 0) {
    alert('Please map at least one column before generating the table.');
    return;
  }
  tableSectionVisible.value = true;
};
</script>

<template>
  <div class="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
    <h1 class="text-2xl font-bold mb-4">JSON to Table Mapper</h1>

    <!-- File Input -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">Upload JSON File</label>
      <input type="file" accept=".json" @change="handleFileUpload"
        class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
    </div>

    <!-- List Property Selection -->
    <div v-if="listSelectionVisible" class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">Select JSON Property Containing the List</label>
      <select v-model="listProperty" @change="handleListSelection"
        class="block w-full border border-gray-300 rounded-md p-2">
        <option value="">Select a property</option>
        <option v-for="prop in listProperties" :key="prop" :value="prop">{{ prop }}</option>
      </select>
    </div>

    <!-- Column Mapping UI -->
    <div v-if="mappingSectionVisible" class="mb-6">
      <h2 class="text-lg font-semibold mb-2">Map JSON Properties to Table Columns</h2>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <h3 class="text-sm font-medium text-gray-700">Available JSON Properties</h3>
          <div class="mt-2 space-y-2">
            <div v-for="prop in jsonProperties" :key="prop" class="draggable bg-blue-100 p-2 rounded"
              draggable="true" @dragstart="dragStart($event, prop)">
              {{ prop }}
            </div>
          </div>
        </div>
        <div>
          <h3 class="text-sm font-medium text-gray-700">Table Columns</h3>
          <div class="mt-2 space-y-2">
            <div v-for="prop in jsonProperties" :key="prop" class="dropzone p-2 border rounded"
              @dragover="dragOver" @dragleave="dragLeave" @drop="drop($event, prop)">
              <label class="block text-sm font-medium text-gray-700">Column Name:</label>
              <input type="text" v-model="columnNames[prop]" @input="updateColumnName(prop, $event.target.value)"
                class="mt-1 block w-full border border-gray-300 rounded-md p-1 text-sm">
              <label class="block text-sm font-medium text-gray-700 mt-2">Value Expression:</label>
              <input type="text" v-model="columnExpressions[prop]" @input="updateColumnExpression(prop, $event.target.value)"
                class="mt-1 block w-full border border-gray-300 rounded-md p-1 text-sm"
                placeholder="e.g., value.toUpperCase() or item.name + ' (' + index + ')'">
              <span v-if="columnMappings[prop]" class="block mt-1">Mapped to: {{ columnMappings[prop] }}</span>
            </div>
          </div>
        </div>
      </div>
      <button @click="generateTable" class="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
        Generate Table
      </button>
    </div>

    <!-- Table Output -->
    <div v-if="tableSectionVisible" class="mt-6">
      <h2 class="text-lg font-semibold mb-2">Generated Table</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white border border-gray-300">
          <thead>
            <tr class="bg-gray-200">
              <th v-for="column in Object.keys(columnMappings)" :key="column" class="border px-4 py-2">
                {{ columnNames[column] || column }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in selectedList" :key="index">
              <td v-for="column in Object.keys(columnMappings)" :key="column" class="border px-4 py-2">
                {{ columnMappings[column] ? evaluateExpression(columnExpressions[column], item[columnMappings[column]], item, index, selectedList) : '' }}
              </td>
            </tr>
          </tbody>
        </table>
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
</style>