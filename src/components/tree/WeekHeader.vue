<template>
  <div class="col select-none"  v-if="showSch">
    <div class="flex flex-nowrap">
      <div v-for="(week, index) in weeks" :key="week" class="week-slot">
        <div>
          <span>{{ week.label }}</span><span>({{ week.i + 1 }})</span>
        </div>
        <div class="flex justify-between">
          <span
            v-for="day in week.dates"
            :key="day"
            class="day"
            :class="getDayClasses(day, selectStartRef)"
          >
            {{ day.label }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps,watch } from 'vue';
import { isBetween } from '@/lib/schedule';

const props=defineProps({
  weeks: {
    type: Array,
    required: true,
  },
  showSch: {
    type: Boolean,
  },
  schReady: {
    type: Boolean,
  },
  
  selectStartRef: {
    type: Object,
  },
  config:{}
});

const getDayClasses = (day, selectStartRef) => ({
  selected: selectStartRef?.start && isBetween(selectStartRef.start.i, selectStartRef.end.i, day.i),
  today: day.isCur,
  weekend: day.isWeekend,
  holiday: day.holiday,
});

</script>

<style scoped>
@reference "@/assets/main.css"
.col {
  @apply border-r border-gray-500;
  position: relative;
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
  @apply border-r border-gray-500;
  right: 0;
}

.day {
  padding: 0 5px;
  font-size: 60%;
  display: inline-block;
  width: 3em;
  @apply flex-1;

}

.selected {
  background-color: limegreen !important;
}

.today {
  color: red !important;
  font-weight: bold;
}

.weekend {
  text-decoration: line-through;
}

.holiday {
  text-decoration: underline;
}

.sch {
  user-select: none;
  height: 100%;
}
.week-slot:last-child:after {
  border-right: none;
}
</style>
