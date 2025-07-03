<!-- Calendar.vue -->
<template>
    <div class="grid grid-cols-4 gap-4">
      <div v-for="month in months" :key="month.name" class="bg-white p-4 rounded shadow">
        <h2 class="text-lg font-bold mb-2">{{ month.name }}</h2>
        <div class="grid grid-cols-7 gap-1">
          <div v-for="day in dayNames" :key="day" class="text-center font-semibold">{{ day }}</div>
          <div 
            v-for="day in month.days" 
            :key="`${month.name}-${day.date}`" 
            class="text-center h-8 flex items-center justify-center"
            :class="{ 
              'bg-blue-500 text-white rounded-full': isToday(month.name, day.date, day.isCurrentMonth),
              'text-gray-400': !day.isCurrentMonth,
              'hover:bg-gray-100 cursor-pointer': day.isCurrentMonth
            }"
          >
            {{ day.date }}
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  export default {
    name: 'Calendar',
    props: {
      year: {
        type: Number,
        default: new Date().getFullYear()
      },
      currentDate: {
        type: Date,
        default: () => new Date()
      }
    },
    data() {
      return {
        months: []
      };
    },
    computed: {
      dayNames() {
        return dayNames;
      }
    },
    methods: {
      getMonthDays(year, monthIndex) {
        const firstDay = new Date(year, monthIndex, 1);
        const lastDay = new Date(year, monthIndex + 1, 0);
        const firstDayIndex = firstDay.getDay();
  
        const days = [];
  
        // Previous month days
        const prevMonthLastDay = new Date(year, monthIndex, 0).getDate();
        for (let i = 0; i < firstDayIndex; i++) {
          days.push({ 
            date: prevMonthLastDay - firstDayIndex + i + 1, 
            isCurrentMonth: false 
          });
        }
  
        // Current month days
        for (let i = 1; i <= lastDay.getDate(); i++) {
          days.push({ 
            date: i, 
            isCurrentMonth: true 
          });
        }
  
        // Next month days
        const totalDays = 42; // 6 weeks
        let nextMonthDay = 1;
        while (days.length < totalDays) {
          days.push({ 
            date: nextMonthDay++, 
            isCurrentMonth: false 
          });
        }
  
        return days;
      },
      isToday(monthName, day, isCurrentMonth) {
        if (!isCurrentMonth) return false;
        const monthIndex = monthNames.indexOf(monthName);
        return monthIndex === this.currentDate.getMonth() && 
               day === this.currentDate.getDate() && 
               this.currentDate.getFullYear() === this.year;
      },
      generateMonths() {
        this.months = monthNames.map((name, index) => ({
          name,
          days: this.getMonthDays(this.year, index)
        }));
      }
    },
    created() {
      this.generateMonths();
    },
    watch: {
      year() {
        this.generateMonths();
      }
    }
  };
  </script>
  
  <style scoped>
  /* Add any component-specific styles here */
  </style>