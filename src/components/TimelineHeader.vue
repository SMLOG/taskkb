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
<style src="@/components/tree.css" scoped></style>
