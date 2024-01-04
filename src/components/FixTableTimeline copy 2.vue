<template>
  <div
    style="
      position: fixed;
      top: 0;
      bottom: 0;
      overflow: auto;
      right: 0;
      left: 0;
    "
  >
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Status</th>
            <template v-for="week in weeks" :key="week" class="week-slot">
              <th colspan="7">
                <div>
                  {{
                    formatDate(week.start, { month: "short", year: "2-digit" })
                  }}
                </div>
                <div style="display: flex; justify-content: space-between">
                  <span
                    style="margin: 0 10px"
                    :style="{
                      backgroundColor: isToday(day)
                        ? 'red'
                        : isWeekend(day)
                        ? 'gray'
                        : 'none',
                    }"
                    v-for="day in getDatesBetween(week.start, week.end)"
                    :key="day"
                  >
                    {{ formatDate(day, { day: "2-digit" }) }}
                  </span>
                </div>
              </th>
            </template>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in tableData" :key="index">
            <th>{{ index + 1 }},{{ row.id }}</th>
            <td>{{ row.status }}</td>
            <template v-for="week in weeks" :key="week" class="week-slot">
              <td colspan="7">
                <div
                  style="
                    display: flex;
                    justify-content: space-between;
                    min-height: 1em;
                  "
                >
                  <div
                    style="flex-grow: 1"
                    v-for="day in getDatesBetween(week.start, week.end)"
                    :key="day"
                    :class="{selected:isDateInRange(day,row.sch)}"
                    @click="clickSch(row,day)"
                  ></div>
                </div>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      weeks: this.generateWeeks(new Date()),
      tableData: [
        { id: "AA/WEP/R001", status: "ready",sch:[new Date('2023-12-27'),new Date('2023-12-31'),
        new Date('2024-01-01'),new Date('2024-01-31')] },
        { id: "AA/WEP/R005/001", status: "ready",sch:[] },
        { id: "AA/WEP/R005/002", status: "ready" },
        { id: "AA/WEP/R005", status: "ready" },
        { id: "AA/BRM/R003", status: "ready" },
        { id: "AA/CMS/R006", status: "ready" },
        { id: "AA/API/R001", status: "ready" },
        { id: "AA/API/R002", status: "ready" },
        { id: "AA/API/R003/003", status: "ready" },
        { id: "AA/API/R003/004", status: "ready" },
        { id: "AA/CMS/R002", status: "ready" },
        { id: "AA/BDS/R001", status: "ready" },
        { id: "AA/IVR/R001", status: "ready" },
        { id: "AA/URS/R001", status: "ready" },
      ],
    };
  },
  methods: {
    clickSch(row,date){
      if(row.sch)
      row.sch.push(date);
    },
     isDateInRange(targetDate, sch) {
      if(!sch||!sch.length)return false;
      for(let i =0;i<sch.length;i++){
        let  startDate = sch[i++];
        let  endDate = sch[i];
        console.log(i);
       if(targetDate >= startDate && targetDate <= endDate)return true;
      }
     
  return false;
},
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
    generateWeeks(startDate, n = 10) {
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
table {
  border-collapse: separate;
  width: 100%;
  border-spacing: 0;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
}

tbody th {
  position: sticky;
  left: 0;
  top: 0;
  background-color: white;
  text-align: left;
}

thead th {
  position: sticky;
  top: 0;
  background-color: white;
}

thead th:first-child {
  z-index: 2;
}

th:first-child,
td:first-child {
  z-index: 1;
  /* Ensure the first column stays on top */
  position: sticky;
  left: 0;
  background-color: white;
}
.selected{
  background-color: blue;
}
</style>
