<template>
        <div class="sticky top-0 w-full header-gradient backdrop-blur-lg py-2 px-2 border-b border-white/20 shadow-sm ">
            <div class="flex items-center justify-between">
                <h2 class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
                    Calendar
                </h2>
                <div class="flex space-x-3" v-if="false">
                    <button class="p-2 rounded-full hover:bg-white/20 transition-all duration-300 transform hover:scale-110">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                    </button>
                </div>
            </div>
            </div>
  <div 
    class="calendar-container select-none"
    ref="calendarContainer"
    @scroll="handleScroll"
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
          class="text-center h-16 flex items-center justify-start flex flex-col"
          :class="{ 
            'text-gray-400': !day.isCurrentMonth,
          }"
          @mousedown="startSelection(month, day)"
          @mouseover="updateSelection(month, day)"
          @mouseup="endSelection"
        >
          <div class="w-8 h-8 flex items-center justify-center rounded-full  font-medium mb-1 flex-shrink-0" 
          :class="{            
            'bg-blue-500 text-white': isToday(month, day),
            'hover:bg-gray-100 cursor-pointer': day.isCurrentMonth && !isSelected(month, day),
            'bg-blue-200 text-white ': isSelected(month, day) && !isToday(month, day),
            'bg-blue-300 text-white': isInRange(month, day) && !isToday(month, day)}">
          {{ day.isCurrentMonth?day.date:'' }}
        </div>
        <div class="task-badge mt-1 px-1 py-0.5 bg-purple-100 text-purple-800 rounded">
          <div  v-if="getTasksForDate(day).length>0" >({{ getTasksForDate(day).length }})</div>
        </div>
        </div>
      </div>
    </div>
    <div v-if="loading" class="loading-indicator py-4 text-center">
      Loading more months...
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useCurrentRowStore } from '@/stores/currentRowStore';

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const props = defineProps({
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
  },
  tasks: {
    type: Array,
    default: () => []
  }
});

const loading = ref(false);
const allMonths = ref([]);
const startIndex = ref(0);
const scrollPosition = ref(0);
const bufferMonths = 3;
const calendarContainer = ref(null);
const isLoadingMore = ref(false);
const isDragging = ref(false);
const startDate = ref(null);
const endDate = ref(null);

const currentRowStore = useCurrentRowStore();

const visibleMonths = computed(() => allMonths.value);

const getTasksForDate = (day) => {
  if (!props.tasks || props.tasks.length === 0) return [];
 
  return props.tasks.filter(task => {
    const yes=  task.start && day.value>=task.start&&day.value<=task.end;
    if(yes){
      console.log(yes)
      return yes;
    }

  });
};

const scrollToDate = (date) => {
  if (!date) return;
  
  // Check if we need to load more months
  const dateYear = date.getFullYear();
  const dateMonth = date.getMonth();
  
  const isDateBeforeFirstMonth = 
    dateYear < allMonths.value[0].year || 
    (dateYear === allMonths.value[0].year && dateMonth < allMonths.value[0].monthIndex);
    
  const isDateAfterLastMonth = 
    dateYear > allMonths.value[allMonths.value.length - 1].year || 
    (dateYear === allMonths.value[allMonths.value.length - 1].year && 
     dateMonth > allMonths.value[allMonths.value.length - 1].monthIndex);

  if (isDateBeforeFirstMonth) {
    loadMoreMonths('past', () => scrollToDate(date));
    return;
  }
  
  if (isDateAfterLastMonth) {
    loadMoreMonths('future', () => scrollToDate(date));
    return;
  }

  // If we have the month, scroll to it
  nextTick(() => {
    const container = calendarContainer.value;
    if (!container) return;

    const targetMonthIndex = allMonths.value.findIndex(
      month => month.year === dateYear && month.monthIndex === dateMonth
    );

    if (targetMonthIndex !== -1) {
      const monthElements = container.children;
      const targetElement = monthElements[targetMonthIndex];
      
      if (targetElement) {
        const containerHeight = container.clientHeight;
        const elementPosition = targetElement.offsetTop;
        const scrollToPosition = elementPosition - (containerHeight / 3);
        
        container.scrollTo({
          top: scrollToPosition,
          behavior: 'smooth'
        });
      }
    }
  });
};

const getMonthDays = (year, monthIndex) => {
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  const firstDayIndex = firstDay.getDay();

  const days = [];
  const prevMonthLastDay = new Date(year, monthIndex, 0).getDate();
  const prevMonth = monthIndex === 0 ? 11 : monthIndex - 1;
  const prevYear = monthIndex === 0 ? year - 1 : year;

  for (let i = 0; i < firstDayIndex; i++) {
    const day = prevMonthLastDay - firstDayIndex + i + 1;
    const value = `${prevYear}${String(prevMonth + 1).padStart(2, '0')}${String(day).padStart(2, '0')}`;
    days.push({ date: prevMonthLastDay - firstDayIndex + i + 1, isCurrentMonth: false,value });
  }
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const value = `${year}${String(monthIndex + 1).padStart(2, '0')}${String(i).padStart(2, '0')}`;
    days.push({ date: i, isCurrentMonth: true,value });
  }
  /*  const totalDays = 42;
  let nextMonthDay = 1;
  const nextYear = monthIndex === 11 ? year + 1 : year;
  const nextMonth = monthIndex === 11 ? 0 : monthIndex + 1;
 while (days.length < totalDays) {
    const value = `${nextYear}${String(nextMonth + 1).padStart(2, '0')}${String(nextMonthDay).padStart(2, '0')}`;
    days.push({ date: nextMonthDay++, isCurrentMonth: false,value });
  }*/
  return days;
};

const isToday = (month, day) => {
  if (!day.isCurrentMonth) return false;
  return (
    month.year === props.currentDate.getFullYear() &&
    month.monthIndex === props.currentDate.getMonth() &&
    day.date === props.currentDate.getDate()
  );
};

const isSelected = (month, day) => {
  if (!day.isCurrentMonth) return false;
  const date = new Date(month.year, month.monthIndex, day.date);
  return (
    (startDate.value && date.getTime() === startDate.value.getTime()) ||
    (endDate.value && date.getTime() === endDate.value.getTime())
  );
};

const isInRange = (month, day) => {
  if (!day.isCurrentMonth || !startDate.value || !endDate.value) return false;

  // Create date for the given day, ignoring time
  const date = new Date(month.year, month.monthIndex, day.date);
  date.setHours(0, 0, 0, 0);

  // Normalize start and end dates to midnight
  const start = new Date(Math.min(startDate.value.getTime(), endDate.value.getTime()));
  start.setHours(0, 0, 0, 0);

  const end = new Date(Math.max(startDate.value.getTime(), endDate.value.getTime()));
  end.setHours(0, 0, 0, 0);

  return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
};

const startSelection = (month, day) => {
  if (!day.isCurrentMonth) return;
  isDragging.value = true;
  startDate.value = new Date(month.year, month.monthIndex, day.date);
  endDate.value = null;
};

const updateSelection = (month, day) => {
  if (!isDragging.value || !day.isCurrentMonth) return;
  endDate.value = new Date(month.year, month.monthIndex, day.date);
};

const endSelection = () => {
  isDragging.value = false;
  if (startDate.value && endDate.value) {
    console.log('Selected range:', startDate.value, 'to', endDate.value);
    const currentRow = useCurrentRowStore().currentRow;
    if(currentRow){
      if (!currentRow?._tl) {
      currentRow._tl = { start: startDate.value, end: endDate.value };
    } else {
      currentRow._tl.start = startDate.value;
      currentRow._tl.end = endDate.value;
    }
    }

  }
};

const generateMonth = (year, monthIndex) => {
  return {
    key: `${year}-${monthIndex}`,
    name: monthNames[monthIndex],
    monthIndex,
    year,
    days: getMonthDays(year, monthIndex)
  };
};

const loadMoreMonths = (direction, callback) => {
  if (isLoadingMore.value) return;
  isLoadingMore.value = true;
  loading.value = true;

  setTimeout(() => {
    if (direction === 'future') {
      const lastMonth = allMonths.value[allMonths.value.length - 1];
      let year = lastMonth.year;
      let monthIndex = lastMonth.monthIndex + 1;

      for (let i = 0; i < bufferMonths; i++) {
        if (monthIndex > 11) {
          monthIndex = 0;
          year++;
        }
        allMonths.value.push(generateMonth(year, monthIndex));
        monthIndex++;
      }
    } else {
      const firstMonth = allMonths.value[0];
      let year = firstMonth.year;
      let monthIndex = firstMonth.monthIndex - 1;

      for (let i = 0; i < bufferMonths; i++) {
        if (monthIndex < 0) {
          monthIndex = 11;
          year--;
        }
        allMonths.value.unshift(generateMonth(year, monthIndex));
        monthIndex--;
      }
      startIndex.value += bufferMonths;
    }

    loading.value = false;
    isLoadingMore.value = false;
    
    if (callback) callback();
  }, 300);
};

const handleScroll = (event) => {
  const container = event.target;
  const { scrollTop, scrollHeight, clientHeight } = container;
  const threshold = 200;

  if (scrollHeight - (scrollTop + clientHeight) <= threshold && !isLoadingMore.value) {
    loadMoreMonths('future');
  }

  if (scrollTop <= threshold && startIndex.value > 0 && !isLoadingMore.value) {
    loadMoreMonths('past');
  }

  scrollPosition.value = scrollTop;
};

const initializeMonths = () => {
  allMonths.value = [];
  const startMonth = props.initialMonth - Math.floor(props.monthsToShow / 2);
  let year = props.initialYear;
  let monthIndex = startMonth;

  if (monthIndex < 0) {
    year += Math.floor(monthIndex / 12);
    monthIndex = 12 + (monthIndex % 12);
  }

  for (let i = 0; i < props.monthsToShow + bufferMonths * 2; i++) {
    if (monthIndex > 11) {
      monthIndex = 0;
      year++;
    }
    allMonths.value.push(generateMonth(year, monthIndex));
    monthIndex++;
  }

  startIndex.value = bufferMonths;
};



// Watch for current row changes
watch(
  () => [currentRowStore.currentRow, currentRowStore.currentRow?._tl?.start, currentRowStore.currentRow?._tl?.end],
  (newValue) => {
    const newStartDate = newValue[0]?._tl?.start;
    const newEndDate = newValue[0]?._tl?.end;
    
    if (newStartDate && newStartDate !== startDate.value) {
      startDate.value = newStartDate;
      endDate.value = newEndDate;
      scrollToDate(newEndDate);
      scrollToDate(newStartDate);
    }
  },
  { immediate: true }
);

onMounted(() => {
  initializeMonths();

  nextTick(() => {
    const currentMonthIndex = allMonths.value.findIndex(
      (month) =>
        month.year === props.currentDate.getFullYear() &&
        month.monthIndex === props.currentDate.getMonth()
    );

    if (currentMonthIndex !== -1) {
      const container = calendarContainer.value;
      const monthElement = container.children[currentMonthIndex];
      if (monthElement) {
        const containerHeight = container.clientHeight;
        const elementPosition = monthElement.offsetTop;
        const scrollToPosition = elementPosition - (containerHeight / 3);
        
        container.scrollTo({
          top: scrollToPosition,
          behavior: 'smooth'
        });
      }
    }
  });
});
</script>

<style scoped>
.calendar-container {
  height: 100%;
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

.bg-blue-200 {
  background-color: #90cdf4;
}

.bg-blue-300 {
  background-color: #bee3f8;
}
</style>