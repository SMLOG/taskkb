<template>

  <div style="
      position: fixed;
      top: 0;
      bottom: 0;
      overflow: auto;
      right: 0;
      left: 0;
      display: flex;
      flex-direction: column;
    ">
      <div style="display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
    width: 100%;
    top: 0;
    left: 0; line-height: 1.5em;">
    <div style="display: flex;">
    <a>All</a>
    <div style="position: relative;" class="filterSearch" >
      <input  />
    </div>
  </div>
  <div>
    <div><a>Grid</a><a>List</a><a>Card</a></div>
  </div>
    
    
  </div>
    <div class="table-container" style="    flex-grow: 1;
    overflow: auto;">


      <div class="vue-columns-resizable" style="position: relative;" >
        <div class="columns-resize-bar" ref="rbar" @mousedown="resizeBarMouseDown(col,key)"  v-for="(col, key) in cols" :key="key" 
        style=" position: absolute; top: 0px;  width: 8px; cursor: col-resize; z-index: 3;" :style="{height:tableHeight+'px'}"></div>
      </div>
      <table ref="table"    @mousedown.left="handleMouseDown" @mousemove="handleMouseMove" @mouseup.left="handleMouseUp">
  <colgroup v-if="false">
    <col style="width:46px" />
    <col  v-for="(col, key) in cols" :key="key" :width="col.width+'px'" :style="{minWidth:col.width+'px',maxWidth:col.width+'px'}" />
  </colgroup>
        <thead>
          <tr>
            <th freeze="1" style="min-width: 46px;max-width: 46px;">#</th>
            <th v-for="(col, key) in cols" ref="th" :key="key" :style="{minWidth:col.width+'px',width:col.width+'px',maxWidth:col.width+'px'}" >
              <div class="cell" >
                  <component :is="col.cp" :col="col"></component >
              </div>
            </th>
           
            <th :colspan="7 * weeks.length" v-if="config.showSch">
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
          <template v-for="(row, rowIndex) in getAllRow()" :key="rowIndex">
            <tr v-show="!isCollapsed(row)" :class="{ rowSelected: selectedRowIndex == rowIndex }" @dragover="dragOver"
              @drop="drop($event, row, rowIndex)">
              <th :draggable="true" @dragstart="dragstart($event, row)" @click="clickSelectCell($event, rowIndex, row)"
                @contextmenu="clickSelectCell($event, rowIndex, row);showContextMenu($event,rowIndex)">
                {{ rowIndex + 1 }}
              </th>

              <td v-for="(col, cellIndex) in cols" 
              :tabindex="100*rowIndex+cellIndex" 
              :key="cellIndex" :class="cellClass(rowIndex+1,cellIndex+1)" 
               @click="clickSelectCell($event, rowIndex, row,cellIndex,col)"
               @dblclick="dblclickEditCell($event)"
               >
                <div class="cell">
                  <component :is="col.cp" :row="row" :col="col" @change="saveData(1)" ></component>
                </div>
              </td>
              <td :colspan="7 * weeks.length" v-if="config.showSch">
                <div style="display: flex; flex-wrap: nowrap" class="sch">
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
        
        position: sticky;
        bottom: 0;
        left: 0;
        z-index: 3;
        background: white;
      "><div style="display: flex;flex-direction: column;">
      <Config v-if="showConfig" :config="config"></Config>
      <div style="display: flex;height: 30px;">
        <a @click="addRow(1)">Add Row</a>
        <a @click="deleteRow(selectRow)">Delete Row</a>
        <a @click="addSubRow(1)">Add Sub Row</a>
        <a @click="saveData(0)">Save</a>
        <a @click="showConfig = !showConfig">Configuration</a>
        <a @click="showConfig = !showConfig">Team</a>
      </div>
      </div>
    </div>

  </div>

  <!-- Context menu -->
  <div v-show="isContextMenuVisible" :style="{ left: contextMenuPosition.x + 'px', top: contextMenuPosition.y + 'px' }"
    class="contextmenu">
    <ul>
      <li @click="addRow(1)">Insert Row after {{ selectedRowIndex }}</li>
      <li>Delete Row</li>
      <li>Menu Item 3</li>
    </ul>
  </div>
</template>
<script setup>

import Config from './Config.vue';



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


import ColTitle from './ColTitle.vue';
import ColDropText from './ColDropText.vue';
import ColDate from './ColDate.vue';


export default {
  components: { ColTitle, ColDropText,ColDate },
  
  data() {
    return {
      tableHeight:20,
      isContextMenuVisible: false,
      contextMenuPosition: { x: 0, y: 0 },
      showConfig: 0,
      selectStart: null,
      isDrag: 0,
      weeks: this.generateWeeks(today),
      config:localStorage.getItem('config')?JSON.parse(localStorage.getItem('config')):{},
      tableData: data,
      dragRow: null,
      selectedRowIndex: null,
      selectRow: null,
      selectedcellIndex:null,
      selectCol:null,
      
      isMouseDown: false,
      startRowIndex: null,
      startcellIndex: null,
      endRowIndex: null,
      endcellIndex: null
    };
  },
  mounted() {
    document.addEventListener("click", this.hideContextMenu);
    window.data = this.tableData;
    document.addEventListener("keydown", this.handleKeyDown);

    document.body.addEventListener('mousemove', this.handleResize);
    document.body.addEventListener('mouseup', this.resizeBarMouseUp);



    this.resize();

const table = this.$refs.table;
this.tableHeight =table.offsetHeight; 
const resizeObserver = new ResizeObserver(entries => {
  for (const entry of entries) {
    const resizedTable = entry.target;
    console.log('Table has been resized:', resizedTable);
    this.tableHeight = table.offsetHeight;
  }
});

resizeObserver.observe(table);
  },
  beforeUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("click", this.hideContextMenu);
  },
  computed:{
    cols(){
      if(!this.config.cols)this.config.cols=[];
      return this.config.cols;
    },
    currentCell(){
      return this.selectRow&&this.selectCol? this.selectRow['c'+this.selectCol.fn]:null;
    }

  },
  watch: {

  },
  methods: {
    resize(){
      for(let i=0;i<this.$refs.rbar.length;i++){
      this.$refs.rbar[i].style.left = this.$refs.th[i].offsetLeft + this.$refs.th[i].offsetWidth - 4 + 'px';

    }
    },
    handleResize(event){
      console.log('handleResize')
      if(this.resizeColumn){
        let i = this.resizeColumnIndex;

        let width = this.$refs.th[i].offsetWidth +  event.movementX;
        console.log(width);
        this.resizeColumn.width =width;
        this.$refs.th[i].style.width=width+'px';
        let j=i;
        this.$refs.rbar[i].style.left = this.$refs.th[j].offsetLeft + this.$refs.th[j].offsetWidth - 4 + 'px'
      }

    },
    resizeBarMouseDown(col,colIndex){
      console.log('resizeBarMouseDown')
        console.log(col)
        this.resizeColumn = col;
        this.resizeColumnIndex = colIndex;
              document.body.style.cursor = 'col-resize';
              document.body.style.userSelect = 'none';
            
    },
    resizeBarMouseUp(){
      console.log('resizeBarMouseUp')
      if(this.resizeColumn){
        this.resize();
      }
      this.resizeColumn = 0;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
},
    dblclickEditCell(event){
      let cellHeight = event.target.closest('td').offsetHeight;
  
    },
    cellClass(rowIndex,cellIndex){
      const minRowIndex = Math.min(this.startRowIndex, this.endRowIndex);
      const maxRowIndex = Math.max(this.startRowIndex, this.endRowIndex);
      const mincellIndex = Math.min(this.startcellIndex, this.endcellIndex);
      const maxcellIndex = Math.max(this.startcellIndex, this.endcellIndex);
      let selected = this.isSelected(rowIndex, cellIndex);
     return { selected:selected ,
      left:selected&&cellIndex==mincellIndex ,
      right:selected&&cellIndex==maxcellIndex|| mincellIndex-1==cellIndex && (rowIndex>=minRowIndex&& rowIndex<=maxRowIndex),
      top:selected&&rowIndex==minRowIndex,
      bottom:selected&&rowIndex==maxRowIndex
     };
    },
    handleMouseDown(event) {
      console.log('mosuedown')

      const cell = event.target.closest('td');
      if(!cell || this.resizeColumn)return null;
      const activeElement = document.activeElement;

      if(cell.querySelector("[contenteditable=true]"))return;
      if (activeElement) {
        activeElement.blur();
      }
      event.preventDefault();
      this.isMouseDown = true;
      this.startRowIndex = cell.parentNode.rowIndex;
      this.startcellIndex = cell.cellIndex;
      this.endRowIndex = this.startRowIndex;
      this.endcellIndex = this.startcellIndex;
    },
    handleMouseMove(event) {
      if (this.isMouseDown) {
        const cell = event.target.closest('td');
        this.endRowIndex = cell.parentNode.rowIndex;
        this.endcellIndex = cell.cellIndex;
      }
    },
    handleMouseUp() {
      this.isMouseDown = false;
    },
    isSelected(rowIndex, cellIndex) {
      const minRowIndex = Math.min(this.startRowIndex, this.endRowIndex);
      const maxRowIndex = Math.max(this.startRowIndex, this.endRowIndex);
      const mincellIndex = Math.min(this.startcellIndex, this.endcellIndex);
      const maxcellIndex = Math.max(this.startcellIndex, this.endcellIndex);
      return (
        (rowIndex >= minRowIndex && rowIndex <= maxRowIndex) &&
        (cellIndex >= mincellIndex && cellIndex <= maxcellIndex)
      );
    },
    clickSelectCell(event, rowIndex, row,cellIndex,col) {
      this.selectedRowIndex = rowIndex;
      this.selectedcellIndex=cellIndex;
      this.selectRow = row;
      this.selectCol = col;

    },
    deleteRow(row) {
      let list = row._p && row._p._childs || this.tableData;
      list.splice(list.indexOf(row), 1);
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
      console.log(num)
      if (this.selectRow) {
        let list = this.selectRow._p&&this.selectRow._p._childs||this.tableData;
        let index = list.indexOf(this.selectRow);
        list.splice(index + 1, 0, { _id: '',_p:this.selectRow._p });

      } else this.tableData.push({ _id: '' })

    },
    addSubRow(num) {
      if (!this.tableData[this.selectedRowIndex].childs)
        this.tableData[this.selectedRowIndex].childs = [];

      this.tableData[this.selectedRowIndex].childs.push({ _id: '' })


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
    saveData(bool) {
      console.log(bool)
      if(!bool ||this.config.autoSave ){
       
     
      localStorage.setItem('data', JSON.stringify(this.tableData, function (key, value) {
        if (key === "_p") {
          console.log(value);
          return null;
        } else return value;
      }));
      localStorage.setItem('config', JSON.stringify(this.config));

    }
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
    showContextMenu(event,index) {
      event.preventDefault();
      this.isContextMenuVisible = true;
      this.contextMenuPosition.x = event.clientX;
      this.contextMenuPosition.y = event.clientY;
      this.selectedRowIndex = index; 
    },
    hideContextMenu() {
      this.isContextMenuVisible = false;
    },
  },
};
</script>

<style scoped>
table {
  border-collapse: separate;
  border-spacing: 0;
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

td {
  vertical-align: top;
}

.selected th {
  background-color: #F0FFF0;
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

.selected {
  background-color: #F0FFF0;
}

.sch .selected {
  background-color: lightgreen;
}

.contextmenu {
  background: white;
  z-index: 1;
  position: fixed;
  border: 2px solid gray;
  border-radius: 5px;
  padding: 5px;
}
.contextmenu ul{margin: 0;}

td.left {
  border-left: 1px darkgreen solid ;
}
td.right {
  border-right: 1px darkgreen solid ;
}
td.top {
  border-top: 1px darkgreen solid ;
}
td.bottom {
  border-bottom: 1px darkgreen solid ;
}
.filterSearch{
  position: relative;
    display: inline-block;
    width: 200px;
    height: 24px;
}
.filterSearch input{width:100%;}
.filterSearch:after{
  content: "T";
    position: absolute;
    right:3px;
    top:0;
    color:green;
    font-weight: bold;
}
</style>
