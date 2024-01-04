<template>
    <div>
      <h1>Task List</h1>
      <input v-model="newTask" placeholder="Enter a new task" @keydown.enter="addTask">
      <ul>
        <li v-for="(task, index) in tasks" :key="index">
          {{ task }}
          <button @click="removeTask(index)">Delete</button>
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        tasks: [
          'Complete project proposal',
          'Review code changes',
          'Prepare presentation slides'
        ],
        newTask: ''
      };
    },
    methods: {
      addTask() {
        if (this.newTask.trim() !== '') {
          this.tasks.push(this.newTask);
          this.newTask = '';
        }
      },
      removeTask(index) {
        this.tasks.splice(index, 1);
      }
    }
  };
  </script>