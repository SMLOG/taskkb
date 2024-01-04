<template>
    <div>
      <table>
        <tbody>
          <tr v-for="(item, index) in items" :key="item.id"
            :draggable="true" :class="{ selected: isSelected(index) }"
            @dragstart="dragStart(index)" @dragover="dragOver" @drop="drop(index)">
            <td>
              <input type="checkbox" v-model="selectedRows" :value="index">
            </td>
            <td>{{ item.name }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
          { id: 3, name: 'Item 3' },
          // Add more items as needed
        ],
        selectedRows: [],
        dragIndex: null
      };
    },
    methods: {
      isSelected(index) {
        return this.selectedRows.includes(index);
      },
      dragStart(index) {
        this.dragIndex = index;
      },
      dragOver(event) {
        event.preventDefault();
      },
      drop(targetIndex) {
        if (this.dragIndex !== null) {
          const draggedRows = this.selectedRows.map(rowIndex => this.items[rowIndex]);
          const droppedAbove = targetIndex < Math.min(...this.selectedRows);
          const insertionIndex = droppedAbove ? targetIndex : targetIndex + this.selectedRows.length;
  
          // Remove dragged rows from original positions
          this.items = this.items.filter((_, i) => !this.selectedRows.includes(i));
  
          // Insert dragged rows at the new position
          this.items.splice(insertionIndex, 0, ...draggedRows);
  
          // Update the dragIndex to account for the new position
          this.dragIndex = this.items.indexOf(draggedRows[0]);
  
          this.selectedRows = [];
        }
      }
    }
  };
  </script>