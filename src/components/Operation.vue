<template>
    <div>
      <div style="display: flex;flex-direction: column;">
        <Config v-if="showConfig" :config="config"></Config>
        <div style="display: flex;height: 30px;">
          <a @click="addRow(1)">Add Row</a>
          <a @click="deleteRow(selectRow)">Delete Row</a>
          <a @click="addSubRow(1)">Add Sub Row</a>
          <a @click="saveData(0)">Save</a>
          <a @click="showConfig = !showConfig">Configuration</a>
          <a @click="showConfig = !showConfig">Team</a>
        </div>
      </div>
    </div>
</template>



<script setup>
import { useConfigStore } from '@/stores/config'
import Config from './Config.vue';
</script>
<script>
export default {

  data() {
    return {
      showConfig: 0,
      config: null,

    };
  },
  mounted() {

    const configStore = useConfigStore();
    this.config = configStore.config;

  },

  watch: {

  },
  methods: {
  }
};
</script>

<style scoped>
table {
  border-collapse: separate;
  border-spacing: 0;
}

th,
td {
  border: 1px solid #ddd;
  padding: 0;
  min-height: 1em;
}

tbody th {
  position: sticky;
  left: 0;
  top: 0;
  background-color: white;
  text-align: left;
  z-index: 2;
}

thead th {
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 2;
}

thead th:first-child {
  z-index: 4;
}

th:first-child,
td:first-child {
  z-index: 3;
  /* Ensure the first column stays on top */
  position: sticky;
  left: 0;
  background-color: white;
  width: 46px;
  min-width: 46px;
  text-align: center;
}

td {
  vertical-align: top;
}

.selected th {
  background-color: #F0FFF0;
}

.week-slot {
  position: relative;
  flex-grow: 1;
}

.week-slot::after {
  content: "";
  width: 0;
  position: absolute;
  top: 0;
  height: 100%;
  border: 1px solid #ddd;
  right: 0;
}

.line .week-slot::after {
  height: var(--table-height);
  z-index: -1;
}

.line {
  z-index: -1 !important;
}

.selectStart {
  background-color: yellow;
  left: 0px;
  top: 0px;
  position: absolute;
}

.drag {
  cursor: move;
}

.resizable {
  position: relative;
  overflow: hidden;
}

.resize-handle {
  position: absolute;
  top: 0;
  right: -11px;
  bottom: 0;
  width: 3px;
  background-color: #eee;
  cursor: col-resize;
}

.selected {
  background-color: #F0FFF0 !important;
}

.sch .selected {
  background-color: lightgreen !important;
}

.contextmenu {
  background: white;
  z-index: 1;
  position: fixed;
  border: 2px solid gray;
  border-radius: 5px;
  padding: 5px;
}

.contextmenu ul {
  margin: 0;
}

td.left {
  border-left: 1px darkgreen solid;
}

td.right {
  border-right: 1px darkgreen solid;
}

td.top {
  border-top: 1px darkgreen solid;
}

td.bottom {
  border-bottom: 1px darkgreen solid;
}

.filterSearch {
  position: relative;
  display: inline-block;
  width: 200px;
  height: 24px;
}

.filterSearch input {
  width: 100%;
}

.filterSearch:after {
  content: "T";
  position: absolute;
  right: 3px;
  top: 0;
  color: green;
  font-weight: bold;
}

.curRow,
.wholeRowSelected td {
  background-color: #E0EEE0 !important
}

.sticky {
  position: sticky;
  z-index: 3;
  background: white;
}

.cell {
  line-height: 2em;
}

.row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.col {
  border: 1px solid #ccc;
  position: relative;
}

.header {
  position: sticky;
  top: 0;
  z-index: var(--vt-index-sticky-header);
  background-color: white
}

.sticky {
  position: sticky;
  z-index: var(--vt-index-sticky);
  background: white;
}

.lsticky {
  position: sticky;
  z-index: var(--vt-index-sticky);
  left: 0;
  background: white;
  text-align: center;

}

.cell {
  line-height: 2em;
}

.sch {
  height: 100%;
}

.curRow,
.wholeRowSelected>div {
  background-color: #E0EEE0 !important
}

.day {
  margin: 0 5px;
  font-size: 60%;
}

.plantime {
  background-color: lightblue;
  cursor: move;
  position: relative;
}

.plantime .rightDrag {
  position: absolute;
  right: 0px;
  width: 4px;
  top: 0;
  bottom: 0;
}

.plantime .rightDrag:hover {
  background: blue;
  cursor: ew-resize;
}
</style>
