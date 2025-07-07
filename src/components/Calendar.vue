<template>
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
          class="text-center h-8 flex items-center justify-center"
          :class="{ 
            'bg-blue-500 text-white rounded-full': isToday(month, day),
            'text-gray-400': !day.isCurrentMonth,
            'hover:bg-gray-100 cursor-pointer': day.isCurrentMonth && !isSelected(month, day),
            'bg-blue-200 text-white rounded-full': isSelected(month, day) && !isToday(month, day),
            'bg-blue-300 text-white rounded-full': isInRange(month, day) && !isToday(month, day)
          }"
          @mousedown="startSelection(month, day)"
          @mouseover="updateSelection(month, day)"
          @mouseup="endSelection"
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

<script setup>
import { ref, computed, onMounted, nextTick,watch } from 'vue';
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
watch(
  () => [currentRowStore.currentRow,currentRowStore.currentRow?._tl?.start,currentRowStore.currentRow?._tl?.end], // Use a getter function for deep watching
  (newValue) => {
    startDate.value = newValue[0]?._tl?.start;
    endDate.value = newValue[0]?._tl?.end;
  },
  { immediate: true }
);


const visibleMonths = computed(() => allMonths.value);

const getMonthDays = (year, monthIndex) => {
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  const firstDayIndex = firstDay.getDay();

  const days = [];
  const prevMonthLastDay = new Date(year, monthIndex, 0).getDate();
  for (let i = 0; i < firstDayIndex; i++) {
    days.push({ date: prevMonthLastDay - firstDayIndex + i + 1, isCurrentMonth: false });
  }
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({ date: i, isCurrentMonth: true });
  }
  const totalDays = 42;
  let nextMonthDay = 1;
  while (days.length < totalDays) {
    days.push({ date: nextMonthDay++, isCurrentMonth: false });
  }
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
  date.setHours(0, 0, 0, 0); // Normalize to midnight

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
  endDate.value = null; // Reset end date when starting a new selection
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
    if(!currentRow?._tl)currentRow._tl={start:startDate.value,  end:endDate.value} 
      else{
        currentRow._tl.start= startDate.value;
        currentRow._tl.end= endDate.value;
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

const loadMoreMonths = (direction) => {
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
      const monthElement = container.children[currentMonthIndex - startIndex.value];
      if (monthElement) {
        monthElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
  background-color: #90cdf4; /* Lighter blue for start/end dates */
}

.bg-blue-300 {
  background-color: #bee3f8; /* Even lighter blue for in-range dates */
}
</style>