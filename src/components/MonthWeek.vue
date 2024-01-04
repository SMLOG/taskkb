<template>
    <div style="
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
">
<FixTable></FixTable>

        <div style="display: table-cell;">
    <div class="weeks-timeline">
        <div class="week-header">
            <div v-for="week in weeks" :key="week" class="week-slot">
                <div>
                    {{ formatDate(week.start, { month: 'short', year: '2-digit' }) }}
                </div>
                <div style="display: flex;">
                    <div style="margin:5px;" :style="{backgroundColor:
                     isToday(day)?'red':   isWeekend(day)?'gray':'none'}" v-for="day in getDatesBetween(week.start, week.end)" :key="day">
                        {{ formatDate(day, {  day: '2-digit' }) }}
                    </div>
                   

            </div>
            </div>

        </div>
        <div class="week-body">
            <div class="week-row" v-for="week in weeks" :key="week">
                <div class="week-slot"></div>
            </div>
        </div>
    </div></div>

</div>
</template>
<script setup>
import FixTable from './FixTable.vue'

import TaskList from './TaskList.vue'
</script>
<script>


export default {
    data() {
        return {
            weeks: this.generateWeeks(new Date()),
            hongKongHolidays : [
        new Date('2023-01-01'), // New Year's Day
        // Lunar New Year (Chinese New Year) - Date varies
        new Date('2023-02-18'),
        new Date('2023-02-19'),
        new Date('2023-02-20'),
        // Ching Ming Festival
        new Date('2023-04-04'),
        // Good Friday - Date varies
        new Date('2023-04-07'),
        // Easter Monday - Date varies
        new Date('2023-04-10'),
        new Date('2023-05-01'), // Labour Day
        // Buddha's Birthday - Date varies
        new Date('2023-05-30'),
        new Date('2023-06-20'), // Tuen Ng Festival (Dragon Boat Festival)
        new Date('2023-07-01'), // Hong Kong Special Administrative Region Establishment Day
        // The day following the Chinese Mid-Autumn Festival - Date varies
        new Date('2023-09-26'),
        new Date('2023-10-01'), // National Day
        // Chung Yeung Festival - Date varies
        new Date('2023-10-09')
      

      // 2024
      ,
        new Date('2024-01-01'), // New Year's Day
        // Lunar New Year (Chinese New Year) - Date varies
        new Date('2024-02-07'),
        new Date('2024-02-08'),
        new Date('2024-02-09'),
        // Ching Ming Festival
        new Date('2024-04-04'),
        new Date('2024-04-05'), // The day following Ching Ming Festival observed
        // Good Friday - Date varies
        new Date('2024-04-12'),
        // Easter Monday - Date varies
        new Date('2024-04-15'),
        new Date('2024-05-01'), // Labour Day
        // Buddha's Birthday - Date varies
        new Date('2024-05-18'),
        new Date('2024-06-07'), // Tuen Ng Festival (Dragon Boat Festival)
        new Date('2024-07-01'), // Hong Kong Special Administrative Region Establishment Day
        // The day following the Chinese Mid-Autumn Festival - Date varies
        new Date('2024-09-17'),
        new Date('2024-10-01'), // National Day
        // Chung Yeung Festival - Date varies
        new Date('2024-10-14')
      ]
        };
    },
    methods: {
         isWeekend(date) {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
},

        getDatesBetween(startDate, endDate) {
  const dates = [];
  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);

  while (currentDate <= lastDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
  }

  return dates;
},
 isSameDate(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  if (d1.toDateString() === d2.toDateString()) {
    return true;
  } else {
    return false;
  }
},
generateWeeks(startDate) {
  const weeks = [];
  let startOfWeek = new Date(startDate);
  
  // Adjust startOfWeek to the beginning of the week (Monday)
  const startDayOfWeek = (startOfWeek.getDay() + 6) % 7; // Convert Sunday (0) to 6, Monday (1) to 0, Tuesday (2) to 1, and so on
  startOfWeek.setDate(startOfWeek.getDate() - startDayOfWeek);
  
  for (let i = 0; i < 5; i++) {
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    weeks.push({
      start: new Date(startOfWeek),
      end: new Date(endOfWeek)
    });

    startOfWeek.setDate(startOfWeek.getDate() + 7);
  }

  return weeks;
},
 isToday(date) {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
},


        formatDate(date, format) {
            return date.toLocaleDateString('en-US', { ...format });
        }
    }
};
</script>
  
<style>
.weeks-timeline {
    display: flex;
    flex-direction: column;
    border: 1px solid #ccc;
    border-radius: 4px;
    overflow: hidden;
}

.week-header {
    display: flex;
    border-bottom: 1px solid #ccc;
}

.week-body {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
}

.week-row {
    display: flex;
    border-bottom: 1px solid #ccc;
}

.week-slot {
    padding: 8px;
    border-right: 1px solid #ccc;
    text-align: center;
}

.week-slot:first-child {
    border-left: 1px solid #ccc;
}
.container {
  position: relative;
  height: 200px;
  border: 1px solid gray;
}

.sticky-div {
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  background-color: lightblue;
}

.content {
  padding-right: 110px; /* Add space to the right for the sticky div */
}
</style>