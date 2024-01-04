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
    <div class="table-container" >
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Status</th>
            <th :colspan="7 * weeks.length">
              <div style="display: flex; flex-wrap: nowrap">
                <div v-for="week in weeks" :key="week" class="week-slot">
                  <div>
                    {{
                      formatDate(week.start, {
                        month: "short",
                        year: "2-digit",
                      })
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
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in tableData" :key="index">
            <th>{{ index + 1 }},{{ row.id }}</th>
            <td>{{ row.status }}</td>
            <td :colspan="7 * weeks.length">
              <div style="display: flex; flex-wrap: nowrap">
                <div
                  v-for="week in weeks"
                  :key="week"
                  class="week-slot"
                  :style="{ width: (1 / weeks.length) * 100 + '%' }"
                >
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
                      :class="{
                        selected: isDateInRange(day, row.sch),
                        drag: selectStart && selectStart.row==row&& selectStart.type == 1,
                        selectStart:
                          selectStart &&
                          selectStart.row == row &&
                          (selectStart.start.getTime() == day.getTime() ||
                            (selectStart.end != null &&
                              isDateInRange2(
                                day,
                                selectStart.end,
                                selectStart.start
                              ))),
                      }"
                      @click="clickSch(row, day)"
                      @mouseenter="enterSch(row, day)"
                      @mousedown.left="mouseDownSch(row, day)"

                    ></div>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
const today = new Date();
today.setHours(0, 0, 0, 0);
export default {
  data() {
    return {
      selectStart: null,
      isDrag: 0,
      weeks: this.generateWeeks(today),
      tableData: [
        {
          id: "AA/WEP/R001",
          status: "ready",
          sch: [{ start: new Date("2023-12-27"), end: new Date("2023-12-31") }],
        },
        { id: "AA/WEP/R005/001", status: "ready", sch: [] },
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
  mounted() {
    document.addEventListener('keydown', this.handleKeyDown);
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
  },
  methods: {
    subtractDates(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day

  const convertedDate1 = new Date(date1);
  const convertedDate2 = new Date(date2);

  const timeDiff = (convertedDate1.getTime() - convertedDate2.getTime());

  const diffInDays = Math.round(timeDiff / oneDay);

  return diffInDays;
},
increaseDateByDays(date, days) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
},
    enterSch(row, date) {
      if (this.selectStart != null && row == this.selectStart.row) {
        if (this.selectStart.type == 1) {
           let days =  this.subtractDates(date,this.selectStart.date);

           this.selectStart.start = this.increaseDateByDays(this.selectStart.orgStart,days);
           this.selectStart.end = this.increaseDateByDays(this.selectStart.orgEnd,days);

        } else {
          if (
            !this.selectStart.end ||
            date.getTime() != this.selectStart.end.getTime()
          ) {
   
            this.selectStart.end = date;
          }
        }
      }
    },
    handleKeyDown(event){
      if (event.key === "Delete" || event.key === "Backspace" || event.code === "Delete" || event.code === "Backspace") {
        if(this.selectStart){
        this.addDatePeriod(this.selectStart.row.sch,null,{start:this.selectStart.orgStart,end:this.selectStart.orgEnd});
        this.selectStart=null;
      }
      }

    },
    mouseDownSch(row, date) {

      console.log('moousedown');

      if (this.selectStart && this.selectStart.type==1 &&this.selectStart.row==row){
        this.addDatePeriod(row.sch,this.selectStart,{start:this.selectStart.orgStart,end:this.selectStart.orgEnd});

        this.selectStart=null;
        return ;
      }

      let startEnd = this.isDateInRange(date, row.sch);

      if (startEnd ){
        console.log(startEnd);
        this.selectStart = {
          type: 1,
          start: startEnd.start,
          end: startEnd.end,
          orgStart: startEnd.start,
          orgEnd: startEnd.end,
          date: date,
          row:row
        };
      }

    },
    clickSch(row, date) {
      console.log("clickSch");

     
      if (this.isDateInRange(date, row.sch)) {
        console.log("drag start");
        //  this.selectStart={type:1,row:row,start:date,end:null};
        return;
      }
      if (this.selectStart == null)
        this.selectStart = { type: 2, row: row, start: date };
      else if (this.selectStart.row == row) {
        if (!row.sch) row.sch = [];
        this.addDatePeriod(row.sch, {
          start: this.selectStart.start,
          end: date,
        });
        console.log(row.sch);
        // row.sch.push({start:this.selectStart[1],end:date});
        this.selectStart = null;
      } else this.selectStart = null;
    },
    addDatePeriod(mergedPeriods, addPeriod,removeOldPeriod) {

      if(addPeriod){
        let newPeriod = {
        start:
          addPeriod.start.getTime() > addPeriod.end.getTime()
            ? addPeriod.end
            : addPeriod.start,
        end:
          addPeriod.start.getTime() < addPeriod.end.getTime()
            ? addPeriod.end
            : addPeriod.start,
      };
      mergedPeriods.push(newPeriod);
      }

      mergedPeriods.sort((a, b) => a.start - b.start);

      const updatedMerged = [];

      for (const period of mergedPeriods) {

        if(removeOldPeriod&&removeOldPeriod.start.getTime()==period.start.getTime())continue;
        if (
          updatedMerged.length === 0 ||
          period.start > updatedMerged[updatedMerged.length - 1].end
        ) {
          // If no overlap, add the current period as a new merged period
          updatedMerged.push(period);
        } else {
          // If overlap or adjacent, update the end date of the last merged period
          updatedMerged[updatedMerged.length - 1].end = Math.max(
            updatedMerged[updatedMerged.length - 1].end,
            period.end
          );
        }
      }

      mergedPeriods.length = 0; // Clear the original array

      for (const period of updatedMerged) {
        mergedPeriods.push(period); // Update the original array with the revised merged periods
      }
    },

    isDateInRange2(targetDate, startDate, endDate) {
      // Convert dates to milliseconds since Unix epoch
      const targetTime = targetDate.getTime();
      const startTime = startDate.getTime();
      const endTime = endDate.getTime();

      // Check if targetDate is between startDate and endDate (inclusive)
      if (startTime <= endTime) {
        return targetTime >= startTime && targetTime <= endTime;
      } else {
        return targetTime >= endTime && targetTime <= startTime;
      }
    },
    isDateInRange(targetDate, sch) {
      if (!sch || !sch.length) return false;
      for (let i = 0; i < sch.length; i++) {
        let startDate = sch[i].start;
        let endDate = sch[i].end;

        if (targetDate >= startDate && targetDate <= endDate)
          return { start: startDate, end: endDate };
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
  z-index: 2;
}

thead th {
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 2;
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

.selected {
  background-color: #ddd;
}

.week-slot {
  position: relative;
}

.week-slot::after {
  content: "";
  width: 0;
  position: absolute;
  top: 0;
  height: 100%;
  border: 1px solid #ddd;
  right: 0;
}

.selectStart {
  background-color: yellow;
}
.drag {
  cursor: move;
}
</style>
