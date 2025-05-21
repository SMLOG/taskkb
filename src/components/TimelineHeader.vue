<template>
  <div class="row header line" :style="{ gridTemplateColumns: gridColumns() }">
    <template v-for="(col, cellIndex) in cols" :key="cellIndex">
      <div class="col" ref="th" :style="colStyle(col, 1,cellIndex)" :class="{ sticky: col.sticky }">
        <div class="cell">
        </div>
      </div>
    </template>
    <div class="col" :colspan="7 * weeks.length">
      <div style="display: flex; flex-wrap: nowrap">
        <div v-for="(week) in weeks" :key="week" class="week-slot">
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useConfigStore } from '@/stores/config'
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
</script>
<script>

export default {
  components: { VueDatePicker },

  data() {
    return {
      weekCount: 20,
      showDatePicker: false,
      selectStart: null,
      isDrag: 0,
      weeks: [],
      config: null,
    };
  },
  mounted() {
    this.config = useConfigStore().config;

    if (!this.config.startDate) this.config.startDate = new Date();
    if (!this.config.weekCount) this.config.weekCount = 20;
    this.$watch(
      () => this.config.startDate,
      () => {
        this.weeks.length = 0;
        this.weeks.push(...this.generateWeeks(this.config.startDate, this.config.weekCount));
      }
    );

    this.$watch(
      () => this.config.weekCount,
      () => {
        this.weeks.length = 0;
        this.weeks.push(...this.generateWeeks(this.config.startDate, this.config.weekCount));
      }
    );



    this.weeks.length = 0;
    this.weeks.push(...this.generateWeeks(this.config.startDate || new Date(), this.config.weekCount));
  },

  computed: {
    cols() {
      if (this.config && this.config.cols)
        return this.config.cols.filter(e => e.show);
      return [];
    },
    curRow() {
      const configStore = useConfigStore();
      return configStore.share.curRow;
    }
  },
  methods: {
    colStyle(col, isH,index) {
      let style = {};
      if (col.sticky) {
        style.left='var(--sticky-left-'+index+')';
      }else style.left = 'auto';
      return style;
    },
    gridColumns() {
      return this.cols.map(e => e.width + 'px').join(' ')+' 1fr';
    },
    isWeekend(date) {
      const dayOfWeek = date.getDay();
      return dayOfWeek === 0 || dayOfWeek === 6;
    },
    getDatesBetween(startDate, endDate, weekIndex) {
      const dates = [];
      const currentDate = new Date(startDate);
      const lastDate = new Date(endDate);
      let i = 0;
      while (currentDate <= lastDate) {
        let dateWrap = {
          date: new Date(currentDate),
          n: this.getDateAsInteger(currentDate),
          i: weekIndex * 7 + i++,
          isCur: this.isToday(currentDate),
          isWeekend: this.isWeekend(currentDate),
          label: this.formatDate(currentDate, { day: "2-digit" })
        };
        dates.push(dateWrap);
        currentDate.setDate(currentDate.getDate() + 1); // Move to the next day

      }

      return dates;
    },
    getDateAsInteger(dateObj) {
      let year = dateObj.getFullYear();
      let month = String(dateObj.getMonth() + 1).padStart(2, '0');
      let day = String(dateObj.getDate()).padStart(2, '0');
      return parseInt(`${year}${month}${day}`, 10);
    },
    generateWeeks(startDate, n = 20) {
      const weeks = [];
      let startOfWeek = new Date(startDate);

      // Adjust startOfWeek to the beginning of the week (Monday)
      const startDayOfWeek = (startOfWeek.getDay() + 6) % 7; // Convert Sunday (0) to 6, Monday (1) to 0, Tuesday (2) to 1, and so on
      startOfWeek.setDate(startOfWeek.getDate() - startDayOfWeek);

      for (let i = 0; i < n; i++) {
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);

        weeks.push({
          start: new Date(startOfWeek),
          end: new Date(endOfWeek),
          i: i,
          startn: this.getDateAsInteger(startOfWeek),
          endn: this.getDateAsInteger(endOfWeek),
          label: this.formatDate(startOfWeek, {
            month: "short",
            year: "2-digit",
          }),
          dates: this.getDatesBetween(startOfWeek, endOfWeek, i)
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
      return date.toLocaleDateString("en-US", { ...format });
    },

  },
};
</script>

<style scoped>
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
  background: white;
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



.day {
  padding: 0 5px;
  font-size: 60%;
}

.today {
  color: red !important;
  font-weight: bold
}

.weekend {
  background-color: #ccc;
  color: blue;
}
</style>
