<!-- InfiniteScrollCalendar.vue -->
<template>
    <div 
      class="calendar-container"
      ref="calendarContainer"
      @scroll="handleScroll"
      @wheel="handleWheel"
    >
      <div 
        v-for="(month, index) in visibleMonths" 
        :key="month.key"
        class="month-container bg-white p-4 rounded shadow mb-4"
      >
        <h2 class="text-lg font-bold mb-2">{{ month.name }} {{ month.year }}</h2>
        <div class="grid grid-cols-7 gap-1">
          <div v-for="day in dayNames" :key="day" class="text-center font-semibold">{{ day }}</div>
          <div 
            v-for="day in month.days" 
            :key="`${month.name}-${day.date}`" 
            class="text-center h-8 flex items-center justify-center"
            :class="{ 
              'bg-blue-500 text-white rounded-full': isToday(month, day),
              'text-gray-400': !day.isCurrentMonth,
              'hover:bg-gray-100 cursor-pointer': day.isCurrentMonth
            }"
          >
            {{ day.date }}
          </div>
        </div>
      </div>
      <div v-if="loading" class="loading-indicator py-4 text-center">
        Loading more months...
      </div>
    </div>
  </template>
  
  <script>
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  export default {
    name: 'InfiniteScrollCalendar',
    props: {
      initialYear: {
        type: Number,
        default: () => new Date().getFullYear()
      },
      initialMonth: {
        type: Number,
        default: () => new Date().getMonth()
      },
      monthsToShow: {
        type: Number,
        default: 6
      },
      currentDate: {
        type: Date,
        default: () => new Date()
      }
    },
    data() {
      return {
        loading: false,
        allMonths: [],
        startIndex: 0,
        scrollPosition: 0,
        bufferMonths: 3 // How many months to load when reaching scroll boundaries
      };
    },
    computed: {
      dayNames() {
        return dayNames;
      },
      visibleMonths() {
        return this.allMonths
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
      isToday(month, day) {
        if (!day.isCurrentMonth) return false;
        return month.year === this.currentDate.getFullYear() &&
               month.monthIndex === this.currentDate.getMonth() &&
               day.date === this.currentDate.getDate();
      },
      generateMonth(year, monthIndex) {
        return {
          key: `${year}-${monthIndex}`,
          name: monthNames[monthIndex],
          monthIndex,
          year,
          days: this.getMonthDays(year, monthIndex)
        };
      },
      loadMoreMonths(direction) {
        this.loading = true;
        
        setTimeout(() => {
          if (direction === 'future') {
            // Load future months
            const lastMonth = this.allMonths[this.allMonths.length - 1];
            let year = lastMonth.year;
            let monthIndex = lastMonth.monthIndex + 1;
            
            for (let i = 0; i < this.bufferMonths; i++) {
              if (monthIndex > 11) {
                monthIndex = 0;
                year++;
              }
              this.allMonths.push(this.generateMonth(year, monthIndex));
              monthIndex++;
            }
          } else {
            // Load past months
            const firstMonth = this.allMonths[0];
            let year = firstMonth.year;
            let monthIndex = firstMonth.monthIndex - 1;
            
            for (let i = 0; i < this.bufferMonths; i++) {
              if (monthIndex < 0) {
                monthIndex = 11;
                year--;
              }
              this.allMonths.unshift(this.generateMonth(year, monthIndex));
              monthIndex--;
            }
            
            // Adjust startIndex to maintain visual position
            this.startIndex += this.bufferMonths;
          }
          
          this.loading = false;
        }, 300); // Simulate async loading
      },
      handleWheel(event) {
    const container = event.target;
    const { scrollTop, scrollHeight, clientHeight } = container;

    // Detect scroll direction from event.deltaY
    const isScrollingDown = event.deltaY > 0;
    const isScrollingUp = event.deltaY < 0;

    // Check if at the bottom and trying to scroll down
    if (isScrollingDown && scrollHeight - (scrollTop + clientHeight) <= 0) {
      this.loadMoreMonths('future');
    }

    // Check if at the top and trying to scroll up
    if (isScrollingUp && scrollTop <= 0 && this.startIndex > 0) {
      this.loadMoreMonths('past');
    }
  },
      handleScroll(event) {
        const container = event.target;
        const { scrollTop, scrollHeight, clientHeight } = container;
        
        // Check if scrolled near bottom (loading future months)
        if (scrollHeight - (scrollTop + clientHeight) < 50 ) {
          this.loadMoreMonths('future');
        }
        
        // Check if scrolled near top (loading past months)
        if (scrollTop < 50 && this.startIndex > 0) {
          this.loadMoreMonths('past');
        }
        
        this.scrollPosition = scrollTop;
      },
      initializeMonths() {
        this.allMonths = [];
        
        // Generate initial months (centered around initial date)
        const startMonth = this.initialMonth - Math.floor(this.monthsToShow / 2);
        let year = this.initialYear;
        let monthIndex = startMonth;
        
        // Adjust if we went negative
        if (monthIndex < 0) {
          year += Math.floor(monthIndex / 12);
          monthIndex = 12 + (monthIndex % 12);
        }
        
        // Generate enough months for display + buffer
        for (let i = 0; i < this.monthsToShow + this.bufferMonths * 2; i++) {
          if (monthIndex > 11) {
            monthIndex = 0;
            year++;
          }
          this.allMonths.push(this.generateMonth(year, monthIndex));
          monthIndex++;
        }
        
        this.startIndex = this.bufferMonths;
      }
    },
    mounted() {
      this.initializeMonths();
      
      // Scroll to current month
      this.$nextTick(() => {
        const currentMonthIndex = this.allMonths.findIndex(
          month => month.year === this.currentDate.getFullYear() && 
                  month.monthIndex === this.currentDate.getMonth()
        );
        
        if (currentMonthIndex !== -1) {
          const container = this.$refs.calendarContainer;
          const monthElement = container.children[currentMonthIndex - this.startIndex];
          if (monthElement) {
            monthElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      });
    }
  };
  </script>
  
  <style scoped>
  .calendar-container {
    height: 80vh;
    overflow-y: auto;
    scroll-behavior: smooth;
  }
  
  .month-container {
    min-height: 250px;
  }
  
  .loading-indicator {
    color: #666;
    font-style: italic;
  }
  </style>