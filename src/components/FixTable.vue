<template>
    <div style="
    position: fixed;
    top: 0;
    bottom: 0;    overflow: auto;
    right: 0;
    left: 0;
">
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th v-for="i in tableData[0].length" :key="i">Header 1</th> <!-- Empty cell for the fixed header column -->
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in tableData" :key="index">
            <th>{{ index+1}}</th> <!-- Fixed first column -->
            <td v-for="(cell, cellIndex) in row.slice(1)" :key="cellIndex">{{ cell }}</td>
          </tr>
        </tbody>
      </table>
    </div></div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        tableData: [
        ['Row 1', 'Data 1', 'Data 2', 'Data 3', 'Data 4', 'Data 5', 'Data 6', 'Data 7', 'Data 8', 'Data 9', 'Data 10', 'Data 11', 'Data 12', 'Data 13', 'Data 14', 'Data 15', 'Data 16', 'Data 17', 'Data 18', 'Data 19', 'Data 20', 'Data 21', 'Data 22', 'Data 23', 'Data 24', 'Data 25', 'Data 26', 'Data 27', 'Data 28', 'Data 29', 'Data 30', 'Data 31', 'Data 32', 'Data 33', 'Data 34', 'Data 35', 'Data 36', 'Data 37', 'Data 38', 'Data 39', 'Data 40', 'Data 41', 'Data 42'],
        ['Row 2', 'Data 43', 'Data 44', 'Data 45', 'Data 46', 'Data 47', 'Data 48', 'Data 49', 'Data 50', 'Data 51', 'Data 52', 'Data 53', 'Data 54', 'Data 55', 'Data 56', 'Data 57', 'Data 58', 'Data 59', 'Data 60', 'Data 61', 'Data 62', 'Data 63', 'Data 64', 'Data 65', 'Data 66', 'Data 67', 'Data 68', 'Data 69', 'Data 70', 'Data 71', 'Data 72', 'Data 73', 'Data 74', 'Data 75', 'Data 76', 'Data 77', 'Data 78', 'Data 79', 'Data 80', 'Data 81', 'Data 82', 'Data 83', 'Data 84'],
        ['Row 2', 'Data 43', 'Data 44', 'Data 45', 'Data 46', 'Data 47', 'Data 48', 'Data 49', 'Data 50', 'Data 51', 'Data 52', 'Data 53', 'Data 54', 'Data 55', 'Data 56', 'Data 57', 'Data 58', 'Data 59', 'Data 60', 'Data 61', 'Data 62', 'Data 63', 'Data 64', 'Data 65', 'Data 66', 'Data 67', 'Data 68', 'Data 69', 'Data 70', 'Data 71', 'Data 72', 'Data 73', 'Data 74', 'Data 75', 'Data 76', 'Data 77', 'Data 78', 'Data 79', 'Data 80', 'Data 81', 'Data 82', 'Data 83', 'Data 84'],
        ['Row 2', 'Data 43', 'Data 44', 'Data 45', 'Data 46', 'Data 47', 'Data 48', 'Data 49', 'Data 50', 'Data 51', 'Data 52', 'Data 53', 'Data 54', 'Data 55', 'Data 56', 'Data 57', 'Data 58', 'Data 59', 'Data 60', 'Data 61', 'Data 62', 'Data 63', 'Data 64', 'Data 65', 'Data 66', 'Data 67', 'Data 68', 'Data 69', 'Data 70', 'Data 71', 'Data 72', 'Data 73', 'Data 74', 'Data 75', 'Data 76', 'Data 77', 'Data 78', 'Data 79', 'Data 80', 'Data 81', 'Data 82', 'Data 83', 'Data 84'],
        ['Row 2', 'Data 43', 'Data 44', 'Data 45', 'Data 46', 'Data 47', 'Data 48', 'Data 49', 'Data 50', 'Data 51', 'Data 52', 'Data 53', 'Data 54', 'Data 55', 'Data 56', 'Data 57', 'Data 58', 'Data 59', 'Data 60', 'Data 61', 'Data 62', 'Data 63', 'Data 64', 'Data 65', 'Data 66', 'Data 67', 'Data 68', 'Data 69', 'Data 70', 'Data 71', 'Data 72', 'Data 73', 'Data 74', 'Data 75', 'Data 76', 'Data 77', 'Data 78', 'Data 79', 'Data 80', 'Data 81', 'Data 82', 'Data 83', 'Data 84'],
        ['Row 2', 'Data 43', 'Data 44', 'Data 45', 'Data 46', 'Data 47', 'Data 48', 'Data 49', 'Data 50', 'Data 51', 'Data 52', 'Data 53', 'Data 54', 'Data 55', 'Data 56', 'Data 57', 'Data 58', 'Data 59', 'Data 60', 'Data 61', 'Data 62', 'Data 63', 'Data 64', 'Data 65', 'Data 66', 'Data 67', 'Data 68', 'Data 69', 'Data 70', 'Data 71', 'Data 72', 'Data 73', 'Data 74', 'Data 75', 'Data 76', 'Data 77', 'Data 78', 'Data 79', 'Data 80', 'Data 81', 'Data 82', 'Data 83', 'Data 84'],
        ['Row 2', 'Data 43', 'Data 44', 'Data 45', 'Data 46', 'Data 47', 'Data 48', 'Data 49', 'Data 50', 'Data 51', 'Data 52', 'Data 53', 'Data 54', 'Data 55', 'Data 56', 'Data 57', 'Data 58', 'Data 59', 'Data 60', 'Data 61', 'Data 62', 'Data 63', 'Data 64', 'Data 65', 'Data 66', 'Data 67', 'Data 68', 'Data 69', 'Data 70', 'Data 71', 'Data 72', 'Data 73', 'Data 74', 'Data 75', 'Data 76', 'Data 77', 'Data 78', 'Data 79', 'Data 80', 'Data 81', 'Data 82', 'Data 83', 'Data 84'],
        ['Row 2', 'Data 43', 'Data 44', 'Data 45', 'Data 46', 'Data 47', 'Data 48', 'Data 49', 'Data 50', 'Data 51', 'Data 52', 'Data 53', 'Data 54', 'Data 55', 'Data 56', 'Data 57', 'Data 58', 'Data 59', 'Data 60', 'Data 61', 'Data 62', 'Data 63', 'Data 64', 'Data 65', 'Data 66', 'Data 67', 'Data 68', 'Data 69', 'Data 70', 'Data 71', 'Data 72', 'Data 73', 'Data 74', 'Data 75', 'Data 76', 'Data 77', 'Data 78', 'Data 79', 'Data 80', 'Data 81', 'Data 82', 'Data 83', 'Data 84'],
        ['Row 2', 'Data 43', 'Data 44', 'Data 45', 'Data 46', 'Data 47', 'Data 48', 'Data 49', 'Data 50', 'Data 51', 'Data 52', 'Data 53', 'Data 54', 'Data 55', 'Data 56', 'Data 57', 'Data 58', 'Data 59', 'Data 60', 'Data 61', 'Data 62', 'Data 63', 'Data 64', 'Data 65', 'Data 66', 'Data 67', 'Data 68', 'Data 69', 'Data 70', 'Data 71', 'Data 72', 'Data 73', 'Data 74', 'Data 75', 'Data 76', 'Data 77', 'Data 78', 'Data 79', 'Data 80', 'Data 81', 'Data 82', 'Data 83', 'Data 84'],
        ['Row 2', 'Data 43', 'Data 44', 'Data 45', 'Data 46', 'Data 47', 'Data 48', 'Data 49', 'Data 50', 'Data 51', 'Data 52', 'Data 53', 'Data 54', 'Data 55', 'Data 56', 'Data 57', 'Data 58', 'Data 59', 'Data 60', 'Data 61', 'Data 62', 'Data 63', 'Data 64', 'Data 65', 'Data 66', 'Data 67', 'Data 68', 'Data 69', 'Data 70', 'Data 71', 'Data 72', 'Data 73', 'Data 74', 'Data 75', 'Data 76', 'Data 77', 'Data 78', 'Data 79', 'Data 80', 'Data 81', 'Data 82', 'Data 83', 'Data 84'],
        ['Row 2', 'Data 43', 'Data 44', 'Data 45', 'Data 46', 'Data 47', 'Data 48', 'Data 49', 'Data 50', 'Data 51', 'Data 52', 'Data 53', 'Data 54', 'Data 55', 'Data 56', 'Data 57', 'Data 58', 'Data 59', 'Data 60', 'Data 61', 'Data 62', 'Data 63', 'Data 64', 'Data 65', 'Data 66', 'Data 67', 'Data 68', 'Data 69', 'Data 70', 'Data 71', 'Data 72', 'Data 73', 'Data 74', 'Data 75', 'Data 76', 'Data 77', 'Data 78', 'Data 79', 'Data 80', 'Data 81', 'Data 82', 'Data 83', 'Data 84'],
        ['Row 2', 'Data 43', 'Data 44', 'Data 45', 'Data 46', 'Data 47', 'Data 48', 'Data 49', 'Data 50', 'Data 51', 'Data 52', 'Data 53', 'Data 54', 'Data 55', 'Data 56', 'Data 57', 'Data 58', 'Data 59', 'Data 60', 'Data 61', 'Data 62', 'Data 63', 'Data 64', 'Data 65', 'Data 66', 'Data 67', 'Data 68', 'Data 69', 'Data 70', 'Data 71', 'Data 72', 'Data 73', 'Data 74', 'Data 75', 'Data 76', 'Data 77', 'Data 78', 'Data 79', 'Data 80', 'Data 81', 'Data 82', 'Data 83', 'Data 84'],
        ['Row 2', 'Data 43', 'Data 44', 'Data 45', 'Data 46', 'Data 47', 'Data 48', 'Data 49', 'Data 50', 'Data 51', 'Data 52', 'Data 53', 'Data 54', 'Data 55', 'Data 56', 'Data 57', 'Data 58', 'Data 59', 'Data 60', 'Data 61', 'Data 62', 'Data 63', 'Data 64', 'Data 65', 'Data 66', 'Data 67', 'Data 68', 'Data 69', 'Data 70', 'Data 71', 'Data 72', 'Data 73', 'Data 74', 'Data 75', 'Data 76', 'Data 77', 'Data 78', 'Data 79', 'Data 80', 'Data 81', 'Data 82', 'Data 83', 'Data 84'],
        ['Row 2', 'Data 43', 'Data 44', 'Data 45', 'Data 46', 'Data 47', 'Data 48', 'Data 49', 'Data 50', 'Data 51', 'Data 52', 'Data 53', 'Data 54', 'Data 55', 'Data 56', 'Data 57', 'Data 58', 'Data 59', 'Data 60', 'Data 61', 'Data 62', 'Data 63', 'Data 64', 'Data 65', 'Data 66', 'Data 67', 'Data 68', 'Data 69', 'Data 70', 'Data 71', 'Data 72', 'Data 73', 'Data 74', 'Data 75', 'Data 76', 'Data 77', 'Data 78', 'Data 79', 'Data 80', 'Data 81', 'Data 82', 'Data 83', 'Data 84'],
        ['Row 2', 'Data 43', 'Data 44', 'Data 45', 'Data 46', 'Data 47', 'Data 48', 'Data 49', 'Data 50', 'Data 51', 'Data 52', 'Data 53', 'Data 54', 'Data 55', 'Data 56', 'Data 57', 'Data 58', 'Data 59', 'Data 60', 'Data 61', 'Data 62', 'Data 63', 'Data 64', 'Data 65', 'Data 66', 'Data 67', 'Data 68', 'Data 69', 'Data 70', 'Data 71', 'Data 72', 'Data 73', 'Data 74', 'Data 75', 'Data 76', 'Data 77', 'Data 78', 'Data 79', 'Data 80', 'Data 81', 'Data 82', 'Data 83', 'Data 84'],
        ['Row 2', 'Data 43', 'Data 44', 'Data 45', 'Data 46', 'Data 47', 'Data 48', 'Data 49', 'Data 50', 'Data 51', 'Data 52', 'Data 53', 'Data 54', 'Data 55', 'Data 56', 'Data 57', 'Data 58', 'Data 59', 'Data 60', 'Data 61', 'Data 62', 'Data 63', 'Data 64', 'Data 65', 'Data 66', 'Data 67', 'Data 68', 'Data 69', 'Data 70', 'Data 71', 'Data 72', 'Data 73', 'Data 74', 'Data 75', 'Data 76', 'Data 77', 'Data 78', 'Data 79', 'Data 80', 'Data 81', 'Data 82', 'Data 83', 'Data 84'],
        ['Row 2', 'Data 43', 'Data 44', 'Data 45', 'Data 46', 'Data 47', 'Data 48', 'Data 49', 'Data 50', 'Data 51', 'Data 52', 'Data 53', 'Data 54', 'Data 55', 'Data 56', 'Data 57', 'Data 58', 'Data 59', 'Data 60', 'Data 61', 'Data 62', 'Data 63', 'Data 64', 'Data 65', 'Data 66', 'Data 67', 'Data 68', 'Data 69', 'Data 70', 'Data 71', 'Data 72', 'Data 73', 'Data 74', 'Data 75', 'Data 76', 'Data 77', 'Data 78', 'Data 79', 'Data 80', 'Data 81', 'Data 82', 'Data 83', 'Data 84'],
        // Add more rows as needed
      ]
      };
    }
  };
  </script>
  
  <style scoped>

  
  table {
    border-collapse: separate;
    width: 100%;
    border-spacing: 0;
  }
  
  th,
  td {
    border: 1px solid #ddd;
    padding: 8px;
  }
  
  th {
    position: sticky;
    left: 0;
    top:0;
    background-color: white;
  }
  
  thead th:first-child
   {
    z-index: 2;
  }

  th:first-child,
  td:first-child {
    z-index: 1; /* Ensure the first column stays on top */
    position: sticky;
    left: 0;
    background-color: white;
  }

  
  </style>