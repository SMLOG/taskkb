<template>
  <div style="
      position: fixed;
      top: 0;
      bottom: 0;
      overflow: auto;
      right: 0;
      left: 0;
    ">
    <div class="table-container">
      <table>
        <colgroup>
          <col width="46px">
          <col v-for="(col, key) in cols" :key="key"
            :style="{ minWidth: 'var(--col-' + key + '-width)', maxWidth: +'var(--col-' + key + '-width)' }">
        </colgroup>
        <thead>
          <tr>
            <th>#</th>
            <th v-for="(col, key) in cols" :key="key">
              <div class="cell">
                <vue-resizable :width="col.width" :active="['r']"  @resize:move="handleResize(col, key, $event)">
                  <component :is="col.cp" :col="col"></component>
                </vue-resizable>
              </div>
            </th>

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
                    <span style="margin: 0 10px" :style="{
                      backgroundColor: isToday(day)
                        ? 'red'
                        : isWeekend(day)
                          ? 'gray'
                          : 'none',
                    }" v-for="day in getDatesBetween(week.start, week.end)" :key="day">
                      {{ formatDate(day, { day: "2-digit" }) }}
                    </span>
                  </div>
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(row, index) in getAllRow()" :key="index">
            <tr v-show="!isCollapsed(row)" :draggable="true" :class="{ selected: selectedIndex == index }"
              @dragstart="dragstart($event, row)" @dragover="dragOver" @drop="drop($event, row, index)">
              <th>
                  {{ index + 1 }}
              </th>

              <td v-for="(col, key) in cols" :key="key"
                :style="{ minWidth: 'var(--col-' + key + '-width)', maxWidth: 'var(--col-' + key + '-width)' }">
                <div class="cell">
                  <component :is="col.cp" :row="row" :col="col"></component>
                </div>
              </td>
              <td :colspan="7 * weeks.length">
                <div style="display: flex; flex-wrap: nowrap">
                  <div v-for="week in weeks" :key="week" class="week-slot"
                    :style="{ width: (1 / weeks.length) * 100 + '%' }">
                    <div style="
                      display: flex;
                      justify-content: space-between;
                      min-height: 1em;
                    ">
                      <div style="flex-grow: 1" v-for="day in getDatesBetween(week.start, week.end)" :key="day" :class="{
                        selected: isDateInRange(day, row._sch),
                        drag:
                          selectStart &&
                          selectStart.row == row &&
                          selectStart.type == 1,
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
                      }" @click="clickSch(row, day)" @mouseenter="enterSch(row, day)"
                        @mousedown.left="mouseDownSch(row, day)"></div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <div style="
        height: 30px;
        position: sticky;
        bottom: 0;
        left: 0;
        z-index: 3;
        background: white;
      ">
      <div style="display: flex;">
        <a @click="addRow(1)">Add Row</a>
        <a @click="addSubRow(1)">Add Sub Row</a>
        <a @click="saveData()">Save</a>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, shallowRef } from 'vue';
import ContentEditable from './ContentEditable.vue';

import VueResizable from 'vue-resizable';



</script>
<script>

const today = new Date();
today.setHours(0, 0, 0, 0);
const data = localStorage.getItem('data') ? JSON.parse(localStorage.getItem('data')) : [];
function loopToSetDate(row) {
  if (row._sch) for (let peroid of row._sch) {
    peroid.start = new Date(peroid.start);
    peroid.end = new Date(peroid.end);
  }
  if (row._childs) {
    for (let ch of row._childs) {
      loopToSetDate(ch);
    }
  }
}
for (let d of data) {
  loopToSetDate(d);
}
const fields = [
  {

    name: '_id',
    active: 1,
    order: 1,
    type: "text",
    buildin: 1

  },
  {

    name: '_sch',
    active: 1,
    order: 1,
    type: "text",
    buildin: 1

  },
  {

    name: 'title',
    active: 1,
    order: 1,
    type: "text",
    buildin: 1

  },
  {

    name: 'Status',
    active: 1,
    order: 1,
    type: "text",
    options: ["In Progress", "Done", "New"]

  },
  {

    name: 'Priority',
    active: 1,
    order: 2,
    type: "text",
    options: ["Low", "High"]

  },
  {

    name: 'Assignee',
    active: 1,
    order: 2,
    type: "text",
  },
  {

    name: 'Start date',
    active: 1,
    order: 2,
    type: "text",
  },
  {

    name: 'Due date',
    active: 1,
    order: 2,
    type: "text",
  },
];

import ColTitle from './ColTitle.vue';
import ColDropText from './ColDropText.vue';



export default {
  components:{ColTitle,ColDropText},
  data() {
    return {
      selectStart: null,
      isDrag: 0,
      weeks: this.generateWeeks(today),
      cols: localStorage.getItem('cols') ? JSON.parse(localStorage.getItem('cols')) : [
        { cp: 'ColTitle' },
        {
          cp: 'ColDropText', field: {

            name: 'Priority',
            active: 1,
            order: 2,
            type: "text",
            options: ["Low", "High"]

          }
        },
        {
          cp: 'ColDropText', field: {

            name: 'Status',
            active: 1,
            order: 1,
            type: "text",
            options: ["In Progress", "Done", "New"]

          }
        },
        {
          cp: 'ColDropText', field: {

            name: 'Assignee',
            active: 1,
            order: 2,
            type: "text",
          }
        },

      ],
      fields: fields,
      tableData: data || [{
        "_id": "a", "_level": 0, "title": "abc", _childs: [
          { "_id": "e", "_level": 0, "title": "efg" }, { "_id": "f", "_level": 0, "title": "hil" }
        ]
      }, { "_id": "b", "_level": 0, "title": "efg" }, { "_id": "c", "_level": 0, "title": "hil" }],
      dragRow: null,
      selectedIndex: null
    };
  },
  mounted() {
    window.data = this.tableData;
    document.addEventListener("keydown", this.handleKeyDown);
    
    for( let i=0;i< this.cols.length;i++){
      let col = this.cols[i];
      document.documentElement.style.setProperty("--col-" + i + "-width", "".concat(col.width, "px"));
    }
  },
  beforeUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  },
  methods: {
    deleteRow(row) {
      let list = row._p && row._p._childs || this.tableData;
      list.splice(list.indexOf(row), 1);
    },
    handleResize(col, index, event) {

      col.width = event.width;
      document.documentElement.style.setProperty("--col-" + index + "-width", "".concat(col.width, "px"));
    },
    getAllRow() {
      let rows = [];
      for (let root of this.tableData) {
        root._level = 0;
        rows.push(...this.getRootRows(root));
      }
      return rows;
    },
    isCollapsed(row) {
      if (row && row._p) {
        if (row._p._collapsed) return true;
        return this.isCollapsed(row._p._p)
      }
      return false;

    },
    getRootRows(rootRow) {

      let list = [];
      list.push(rootRow);
      if (rootRow._childs) {
        for (let row of rootRow._childs) {
          row._level = rootRow._level + 1;
          row._p = rootRow;

          list.push(...this.getRootRows(row));
        }

      }
      return list;


    },
    dragstart(event, row) {
      this.dragRow = row;
      console.log(event);
      this.dragStartClientX = event.clientX;
    },
    dragOver(event) {
      event.preventDefault();
    },
    isParentMoveToChild(fromRow, toRow) {
      if (!fromRow._childs) return false;
      for (let row of fromRow._childs) {
        if (row == toRow) return true;

        if (this.isParentMoveToChild(row, toRow)) return true;
      }
      return false;

    },
    drop(event, row) {

      console.log(event);
      if (this.isParentMoveToChild(this.dragRow, row)) {
        console.error("not allow parent move to child.");
        return;
      } else if (row == this.dragRow) {
        console.error('same row');
        return;
      }
      let toChildList = row._p ? row._p._childs : this.tableData;
      console.log('drop');

      if (this.dragRow !== null) {

        let fromChildList = this.dragRow._p ? this.dragRow._p._childs : this.tableData;
        let fromIndex = fromChildList.indexOf(this.dragRow);
        let targetIndex = toChildList.indexOf(row);

        if (event.clientX - this.dragStartClientX > 50) {
          console.log('drop to child.');
          fromChildList.splice(fromIndex, 1);
          if (!row._childs) row._childs = [];
          row._childs.push(this.dragRow);
          this.dragRow._p = row;
          this.dragRow._level = row._level + 1;
          return;
        }

        if (row._p == this.dragRow._p && fromIndex - targetIndex == 1) {
          fromChildList.splice(fromIndex, 1);
          targetIndex = toChildList.indexOf(row);
          fromChildList.splice(targetIndex, 0, this.dragRow);
        } else {
          fromChildList.splice(fromIndex, 1);
          targetIndex = toChildList.indexOf(row);
          toChildList.splice(targetIndex + 1, 0, this.dragRow);
          this.dragRow._p = row._p;
          this.dragRow._level = row._level;
        }

        this.dragRow = null;

      }
    },
    addRow(num) {
      if (this.selectedIndex != null) {
        this.tableData.splice(this.selectedIndex + 1, 0, { _id: '' });
      } else this.tableData.push({ _id: '' })

    },
    addSubRow(num) {
      if (!this.tableData[this.selectedIndex].childs)
        this.tableData[this.selectedIndex].childs = [];

      this.tableData[this.selectedIndex].childs.push({ _id: '' })


    },
    focusNext(index) {
      if (index + 1 < this.$refs.ids.length) {
        console.log('focus' + (index + 1));
        setTimeout(() => {
          this.$refs.ids[index + 1].$el.querySelector('[contenteditable=true]').focus();
        }, 100);

      }
      else {
        this.addRow(1)
        setTimeout(() => {
          this.$refs.ids[index + 1].$el.querySelector('[contenteditable=true]').focus();
        }, 100);
      }
    },
    saveData() {
      localStorage.setItem('data', JSON.stringify(this.tableData, function (key, value) {
        if (key === "_p") {
          console.log(value);
          return null;
        } else return value;
      }));
      localStorage.setItem('cols',JSON.stringify(this.cols));
    },
    moveCursorToEnd(index) {
      this.$nextTick(() => {
        const spanElement = this.$refs.spanElement[index];
        console.log(spanElement);
        if (spanElement) {
          const range = document.createRange();
          const selection = window.getSelection();
          range.selectNodeContents(spanElement);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      });
    },
    subtractDates(date1, date2) {
      const oneDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day

      const convertedDate1 = new Date(date1);
      const convertedDate2 = new Date(date2);

      const timeDiff = convertedDate1.getTime() - convertedDate2.getTime();

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
          let days = this.subtractDates(date, this.selectStart.date);

          this.selectStart.start = this.increaseDateByDays(
            this.selectStart.orgStart,
            days
          );
          this.selectStart.end = this.increaseDateByDays(
            this.selectStart.orgEnd,
            days
          );
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
    handleKeyDown(event) {
      if (
        event.key === "Delete" ||
        event.key === "Backspace" ||
        event.code === "Delete" ||
        event.code === "Backspace"
      ) {
        if (this.selectStart) {
          this.addDatePeriod(this.selectStart.row._sch, null, {
            start: this.selectStart.orgStart,
            end: this.selectStart.orgEnd,
          });
          this.selectStart = null;
        }
      }
    },
    mouseDownSch(row, date) {
      console.log("moousedown");


      if (
        this.selectStart &&
        this.selectStart.row == row
      ) {
        if (this.selectStart.type == 1) {
          this.addDatePeriod(row._sch, this.selectStart, {
            start: this.selectStart.orgStart,
            end: this.selectStart.orgEnd,
          });
          this.selectStart = null;
        }

        else {

          //  this.addDatePeriod(row._sch, this.selectStart);
        }


        return;
      }

      if (this.selectStart) return;
      let startEnd = this.isDateInRange(date, row._sch);

      if (startEnd) {
        console.log(startEnd);
        this.selectStart = {
          type: 1,
          start: startEnd.start,
          end: startEnd.end,
          orgStart: startEnd.start,
          orgEnd: startEnd.end,
          date: date,
          row: row,
        };
      }
    },
    clickSch(row, date) {
      console.log("clickSch");

      if (this.isDateInRange(date, row._sch)) {
        console.log("drag start");
        //  this.selectStart={type:1,row:row,start:date,end:null};
        return;
      }
      if (this.selectStart == null)
        this.selectStart = { type: 2, row: row, start: date };
      else if (this.selectStart.row == row) {
        if (!row._sch) row._sch = [];
        this.addDatePeriod(row._sch, {
          start: this.selectStart.start,
          end: date,
        });
        // row.sch.push({start:this.selectStart[1],end:date});
        this.selectStart = null;
      } else this.selectStart = null;
    },
    addDatePeriod(mergedPeriods, addPeriod, removeOldPeriod) {
      if (addPeriod) {
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
        if (
          removeOldPeriod &&
          removeOldPeriod.start.getTime() == period.start.getTime()
        )
          continue;
        if (
          updatedMerged.length === 0 ||
          period.start.getTime() - updatedMerged[updatedMerged.length - 1].end.getTime() > 24 * 3600 * 1000
        ) {
          // If no overlap, add the current period as a new merged period
          updatedMerged.push(period);
        } else {
          // If overlap or adjacent, update the end date of the last merged period
          updatedMerged[updatedMerged.length - 1].end = period.end.getTime() > updatedMerged[updatedMerged.length - 1].end.getTime() ? period.end : updatedMerged[updatedMerged.length - 1].end;
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
.cell{
  overflow: hidden;
  text-overflow: ellipsis;

}
th,
td {
  border: 1px solid #ddd;
  padding: 0;
  min-height: 1em;
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
  z-index: 4;
}

th:first-child,
td:first-child {
  z-index: 3;
  /* Ensure the first column stays on top */
  position: sticky;
  left: 0;
  background-color: white;
  width: 46px;
  min-width: 46px;
  text-align: center;
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

.resizable {
  position: relative;
  overflow: hidden;
}

.resize-handle {
  position: absolute;
  top: 0;
  right: -11px;
  bottom: 0;
  width: 3px;
  background-color: #eee;
  cursor: col-resize;
}

</style>
