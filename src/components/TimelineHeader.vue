<template>
  <div class="row header line" :style="{ gridTemplateColumns: gridColumns }">
    <template v-for="(col, cellIndex) in cols" :key="cellIndex">
      <div class="col" ref="th" :style="colStyle(col, 1, cellIndex)" :class="{ sticky: col.sticky }">
        <div class="cell"></div>
      </div>
    </template>
    <div class="col" :colspan="7 * weeks.length" v-if="showSch">
      <div style="display: flex; flex-wrap: nowrap">
        <div v-for="week in weeks" :key="week.i" class="week-slot"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import '@vuepic/vue-datepicker/dist/main.css';



// Methods
const colStyle = (col, isH, index) => {
  const style = {};
  if (col.sticky) {
    style.left = `var(--sticky-left-${index})`;
  } else {
    style.left = 'auto';
  }
  return style;
};

const props = defineProps({
  cols:{},
  gridColumns:{},
 weeks: {},days:{},firstDay:{},showSch:{}
});

</script>

<style scoped>
.week-slot {
  position: relative;
  flex-grow: 1;
}

.week-slot::after {
  content: '';
  width: 0;
  position: absolute;
  top: 0;
  height: 100%;
  border-left: 1px solid #ddd;
  right: 0;
}

.line .week-slot::after {
  height: var(--table-height);
  z-index: -1;
}

.line {
  z-index: -1 !important;
  height: 1px;
  margin-top: -2px;
}

.header .selected {
  background-color: green !important;
}

.sticky {
  position: sticky;
  z-index: 3;
}

.row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.col {
  border-right: 1px solid #ccc;
  position: relative;
}

.header {
  position: sticky;
  top: 0;
  z-index: var(--vt-index-sticky-header);
  background-color: white;
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

.day {
  padding: 0 5px;
  font-size: 60%;
}

.today {
  color: red !important;
  font-weight: bold;
}

.weekend {
  background-color: #ccc;
  color: blue;
}
</style>