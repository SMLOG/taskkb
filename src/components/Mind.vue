<template>
    <div class="flex flex-col h-full bg-gray-50">
      <div class="flex flex-wrap gap-2 p-3 bg-gray-100 border-b border-gray-200">
        <button 
          @click="addNode"
          class="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add Node
        </button>
        <button 
          @click="editNode"
          class="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Edit Node
        </button>
        <button 
          @click="removeNode"
          class="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Remove Node
        </button>
        <button 
          @click="centerRoot"
          class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Center Root
        </button>
        <button 
          @click="expandAll"
          class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Expand All
        </button>
        <button 
          @click="collapseAll"
          class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Collapse All
        </button>
      </div>

      <div  class="flex-1 grow1 border border-gray-300 bg-white relative">
        <div ref="mindmapContainer" class="absolute inset-0">
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { onMounted, ref } from 'vue';
  import jsMind from 'jsmind';
  import 'jsmind/style/jsmind.css';
  
  export default {
    name: 'MindMap',
    setup() {
      const mindmapContainer = ref(null);
      let jm = null;
  
      // Sample mind map data
      const mindData = {
        meta: {
          name: 'jsMind Example',
          author: 'vue3-component',
          version: '0.2',
        },
        format: 'node_array',
        data: [
          { id: 'root', topic: 'Central Topic', isroot: true },
          { id: 'sub1', parentid: 'root', topic: 'Main Topic 1', direction: 'right' },
          { id: 'sub2', parentid: 'root', topic: 'Main Topic 2', direction: 'left' },
          { id: 'sub3', parentid: 'sub1', topic: 'Subtopic 1.1' },
          { id: 'sub4', parentid: 'sub1', topic: 'Subtopic 1.2' },
          { id: 'sub5', parentid: 'sub2', topic: 'Subtopic 2.1' },
        ],
      };
  
      // Initialize the mind map
      const initMindMap = () => {
        const options = {
          container: mindmapContainer.value,
          editable: true,
          theme: 'primary',
          mode: 'full',
          view: {
            line_width: 2,
            line_color: '#6b7280',
            node_title_height: 24,
          },
        };
  
        jm = new jsMind(options);
        jm.show(mindData);
      };
  
      // Add a new node
      const addNode = () => {
        const selectedNode = jm.get_selected_node();
        if (!selectedNode) {
          alert('Please select a node first');
          return;
        }
  
        const nodeId = 'node_' + Date.now();
        const topic = prompt('Enter node text:', 'New Node');
        
        if (topic) {
          jm.add_node(selectedNode.id, nodeId, topic);
        }
      };
  
      // Edit selected node
      const editNode = () => {
        const selectedNode = jm.get_selected_node();
        if (!selectedNode) {
          alert('Please select a node first');
          return;
        }
  
        const topic = prompt('Edit node text:', selectedNode.topic);
        if (topic !== null) {
          jm.update_node(selectedNode.id, topic);
        }
      };
  
      // Remove selected node
      const removeNode = () => {
        const selectedNode = jm.get_selected_node();
        if (!selectedNode) {
          alert('Please select a node first');
          return;
        }
  
        if (confirm('Are you sure you want to delete this node and all its children?')) {
          jm.remove_node(selectedNode.id);
        }
      };
  
      // Center the root node
      const centerRoot = () => {
        jm.center_root();
      };
  
      // Expand all nodes
      const expandAll = () => {
        jm.expand_all();
      };
  
      // Collapse all nodes
      const collapseAll = () => {
        jm.collapse_all();
      };
  
      onMounted(() => {
        initMindMap();
      });
  
      return {
        mindmapContainer,
        addNode,
        editNode,
        removeNode,
        centerRoot,
        expandAll,
        collapseAll,
      };
    },
  };
  </script>
  
  <style>
  /* Custom jsMind node styling - using standard CSS here */
  .jsmind-node {
    border-radius: 0.375rem; /* equivalent to rounded-md */
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
    border: 1px solid #e5e7eb; /* border-gray-200 */
    background-color: white;
    padding: 0.25rem 0.75rem; /* px-3 py-1 */
    transition: all 0.2s ease;
  }
  
  .jsmind-node.selected {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); /* shadow-md */
    border-color: #60a5fa; /* border-blue-400 */
    outline: 2px solid #bfdbfe; /* ring-2 ring-blue-200 */
    outline-offset: 2px;
  }
  
  .jmnode-theme .jmnode {
    border-radius: 0.375rem; /* rounded-md */
  }
  
  .jsmind-inner {
    background-color: white;
  }
  
  /* Connector lines */
  .jsmind-node line {
    stroke: #9ca3af; /* stroke-gray-400 */
  }
  
  /* Root node styling */
  .jsmind-node.root {
    background-color: #eff6ff; /* bg-blue-50 */
    border-color: #bfdbfe; /* border-blue-200 */
    color: #1e40af; /* text-blue-800 */
    font-weight: 600; /* font-semibold */
  }
  
  /* Hover effects */
  .jsmind-node:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); /* shadow-md */
    border-color: #d1d5db; /* border-gray-300 */
  }
  </style>