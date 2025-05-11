import { ref } from "vue";
import { useDataRowsStore } from "@/stores/dataRows";
import { useConfigStore } from "@/stores/config";

const weeksRef = ref([]);
const weeks = weeksRef.value;

const isDrag = ref(false);
const dragMode = ref(false);

function addDatePeriod(addPeriod) {
  if (addPeriod) {
    let newPeriod = {
      start:
        addPeriod.start.n > addPeriod.end.n ? addPeriod.end : addPeriod.start,
      end:
        addPeriod.start.n < addPeriod.end.n ? addPeriod.end : addPeriod.start,
    };
    return newPeriod;
  }
}
function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}
function getDate(i){
  return  weeks[parseInt(i / 7)].dates[i % 7];

}
function plusWorkDays  (startIndex,days){
  let start = startIndex;
  let k=0;
  let total = Math.abs(days);
  let inc = days>0?1:-1;
  if(days==0)return getDate(start);
  for(;true;){
    start += inc;
    let date = getDate(start);
    if(date.isWeekend && config.allowOptions&&config.allowOptions.indexOf('W')==-1 ||date.holiday&&config.allowOptions&&config.allowOptions.indexOf('H')==-1)continue;
    k++;
    if(k==total)return getDate(start);
  }
  
}
let config;
export function useTableComposable() {
  const flatRows = useDataRowsStore().flatRows;
 config = useConfigStore().config;
  
  const selectRowsIndex = useDataRowsStore().selectRowsIndex;

  let isMouseDown;
  let selectRowStart;
  let selectRowEnd;
  let moveType =ref(null);
  let resizeColumn;
  let startRowIndex=ref(-1);
  let startcellIndex=ref(-1);
  let endRowIndex=ref(-1);
  let endcellIndex=ref(-1);
  let selectStartRef =ref(null);
  let dragStartClientX;

  const dragOver = (event) => {
    event.preventDefault();
  };

  const selectRowSch = (row,event)=> {
    if (!moveType.value && (!selectStartRef.value || selectStartRef.value.type != 2)){
      selectStartRef.value = { type: 1, row: row, start: row._tl.start, end: row._tl.end };

      {
  
      const cell = event.target.closest(".row");

      const rowIndex = parseInt(cell.dataset.rowIndex);
      dragIndexRang.value.length=0;
      let orgDate = selectStartRef.value.row._tl.end;
      for(let j=rowIndex+1;j<flatRows.length;j++){
        let row = flatRows[j];
        if(row._lock)break;
        if(row._tl){
          if(row._tl.end.i<orgDate.i)break;
             dragIndexRang.value.push(j);
        }
      }
    }
  }

  }

  let curRowIndex = useDataRowsStore().curRowIndex;
  const handleMouseDown = (event) => {
    console.log("mosuedown");

    let rowEl = event.target.closest(".row");
    if (rowEl) {
      isMouseDown = true;
      let rowIndex = parseInt(rowEl.dataset.rowIndex);
      let row = flatRows[rowIndex];
      useDataRowsStore().curRowIndex = parseInt(rowEl.dataset.rowIndex);
      let selectRows = selectRowsIndex;
      if (event.target.classList.contains("num")) {
        if (selectRows.indexOf(rowIndex) > -1) {
          //drag
          isDrag.value = true;
        } else {
          selectRowStart = parseInt(rowEl.dataset.rowIndex);
          selectRowEnd = parseInt(rowEl.dataset.rowIndex);
          selectRows.length = 0;
          selectRows.push(selectRowStart);
        }
      } else {
        selectRows.length = 0;
        selectRowStart = selectRowEnd = -1;

        if (row&&row._tl && row._tl.start && selectStartRef.value && selectStartRef.value.row == row) {
          if (event.target.classList.contains("selectStartRef")) {
            moveType.value = {
              x: event.clientX,
              type: "move",
              _tl: deepCopy(row._tl),
            };
          } else if (event.target.classList.contains("rightDrag")) {
            moveType.value = {
              x: event.clientX,
              type: "rightDrag",
              initValue: deepCopy(row._tl.end),
              _tl: deepCopy(row._tl),
            };
          } else if (event.target.classList.contains("leftDrag")) {
            moveType.value = {
              x: event.clientX,
              type: "leftDrag",
              initValue: deepCopy(row._tl.start),
              _tl: deepCopy(row._tl),
            };
          }
        } else if (event.target.closest(".sch")) {
          let x =
            event.clientX -
            event.target.closest(".sch").getBoundingClientRect().left;
          let totalWidth = event.target.closest(".sch").offsetWidth;
          let index = parseInt((x / totalWidth) * config.weekCount * 7);
          let date = weeks[parseInt(index / 7)].dates[index % 7];
          if (!row._tl || !row._tl.start) {
            if (selectStartRef.value == null) {
              selectStartRef.value = { type: 2, row: row, start: date, end: date };



            } else if (selectStartRef.value.row == row && selectStartRef.value.start) {
              console.log('update');
              row._tl = addDatePeriod({
                start: selectStartRef.value.start,
                end: date,
              });
            } else {
              selectStartRef.value = null;
              console.log("delete selectStart");
            }
          } else {

            if (selectStartRef.value && row != selectStartRef.value.row) {
              selectStartRef.value = null;
              console.log("delete selectStart");
            }else{
              selectRowSch(row,event);
            }

          } 
        }
      }
    }

    const cell = event.target.closest("div.col");
    if (!cell || resizeColumn) {
      startRowIndex.value = -1;
      startcellIndex.value = -1;
      endRowIndex.value = -1;
      endcellIndex.value = -1;
      return null;
    }
    const activeElement = document.activeElement;

    if (cell.querySelector("[contenteditable=true]")) return;
    if (activeElement) {
      activeElement.blur();
    }
    isMouseDown = true;
    event.preventDefault();
    const rowIndex = parseInt(cell.getAttribute("data-row"));
    const cellIndex = parseInt(cell.getAttribute("data-col"));

    startRowIndex.value = rowIndex;
    startcellIndex.value = cellIndex;
    endRowIndex.value = startRowIndex.value;
    endcellIndex.value = startcellIndex.value;
  };

  const handleMouseCellsMove = (event) => {
    let rowEl = event.target.closest(".row");
    if (rowEl) {
      if (isMouseDown) {
        const cell = event.target.closest("div.col");
        if (!isDrag.value && selectRowsIndex.length) {
          selectRowsIndex.length = 0;
          selectRowEnd = parseInt(rowEl.dataset.rowIndex);
          selectRowsIndex.push(
            ...Array.from(
              { length: Math.abs(selectRowStart - selectRowEnd) + 1 },
              (_, i) => Math.min(selectRowStart, selectRowEnd) + i
            )
          );
        } else if (cell) {
          const rowIndex = parseInt(cell.getAttribute("data-row"));
          const cellIndex = parseInt(cell.getAttribute("data-col"));
          endRowIndex.value = rowIndex;
          endcellIndex.value = cellIndex;
        }
      }
    }

    let sch = event.target.closest(".sch");
    if (sch) {
      let x =
        event.clientX -
        event.target.closest(".sch").getBoundingClientRect().left;
      let totalWidth = event.target.closest(".sch").offsetWidth;
      let index = parseInt((x / totalWidth) * config.weekCount * 7);
      let date = weeks[parseInt(index / 7)].dates[index % 7];

      if (selectStartRef.value != null) {
        if (!selectStartRef.value.row._tl) selectStartRef.value.end = date;
        else {
          if (moveType.value) {
            let ox = event.clientX - moveType.value.x;

            let totalWidth = event.target.closest(".sch").offsetWidth;
            let unitWidth = totalWidth / config.weekCount / 7;

            let index =
              moveType.value._tl[moveType.value.type == "rightDrag" ? "end" : "start"].i +
              parseInt(ox / unitWidth);
            let date = weeks[parseInt(index / 7)].dates[index % 7];

            if (moveType.value.type == "rightDrag") {
              selectStartRef.value.end = date;

            }
            else if (moveType.value.type == "leftDrag") selectStartRef.value.start = date;
            else {
              let moveUnits = parseInt(ox / unitWidth);
              index = plusWorkDays( moveType.value._tl.start.i,moveUnits).i;

              selectStartRef.value.start = weeks[parseInt(index / 7)].dates[index % 7];

              index = plusWorkDays( moveType.value._tl.end.i,moveUnits).i;

              selectStartRef.value.end = weeks[parseInt(index / 7)].dates[index % 7];
              console.log("moveUnits", moveUnits);
            }
          }
        }
      }
    }
  };

  const handleMouseUp = (event) => {
    if (isDrag.value) {
      selectRowsIndex.length = 0;
    }
    isDrag.value = isMouseDown = false;
    if (moveType.value) {
      event.stopPropagation();
      console.log('event.stopPropagation();',event)
      let orgDate = selectStartRef.value.row._tl.end;
      let orgStartDate = selectStartRef.value.row._tl.start;

      selectStartRef.value.row._tl.start = selectStartRef.value.start;
      selectStartRef.value.row._tl.end = selectStartRef.value.end;

      let newDate = selectStartRef.value.end;

      if(newDate.i-orgDate.i!=0 && dragMode.value){
        let workdays =(newDate.i-orgDate.i>0?1:-1)*new Array(Math.abs(newDate.i-orgDate.i))
        .fill(0).map((e,index)=>Math.min(orgDate.i,newDate.i)+index+1)
        .map(e=>getDate(e))
        .filter(e=>!(e.isWeekend&&config.allowOptions&&config.allowOptions.indexOf('W')==-1||e.holiday&&config.allowOptions&&config.allowOptions.indexOf('H')==-1)).length;


        const cell = event.target.closest(".row");

        const rowIndex = parseInt(cell.dataset.rowIndex);

        for(let j=rowIndex+1;j<flatRows.length;j++){
          let row = flatRows[j];
          if(row._lock)break;
          if(row._tl){
            if(row._tl.end.i<orgDate.i)break;
            row._tl.end = plusWorkDays(row._tl.end.i,workdays);
            if(row._tl.start.i>orgDate.i || moveType.value.type=='move'&&row._tl.start.i<=orgStartDate.i)
              row._tl.start = plusWorkDays(row._tl.start.i,workdays);
          }
        }
        console.log(workdays);
      }

      
      moveType.value = null;

    }else{
      locateCurSch(event);
    }
  };
  const dragIndexRang = ref([]);
  const inDragRang = (rowIndex)=>{
      return dragIndexRang.value.indexOf(rowIndex)>-1;
  };

  const isSelected = (rowIndex, cellIndex) => {
    const minRowIndex = Math.min(startRowIndex.value, endRowIndex.value);
    const maxRowIndex = Math.max(startRowIndex.value, endRowIndex.value);
    const mincellIndex = Math.min(startcellIndex.value, endcellIndex.value);
    const maxcellIndex = Math.max(startcellIndex.value, endcellIndex.value);
    return (
      minRowIndex >= 0 &&
      rowIndex >= minRowIndex &&
      rowIndex <= maxRowIndex &&
      mincellIndex >= 0 &&
      cellIndex >= mincellIndex &&
      cellIndex <= maxcellIndex
    );
  };
  const cellClass = (rowIndex, cellIndex, col) => {
    const minRowIndex = Math.min(startRowIndex.value, endRowIndex.value);
    const maxRowIndex = Math.max(startRowIndex.value, endRowIndex.value);
    const mincellIndex = Math.min(startcellIndex.value, endcellIndex.value);
    const maxcellIndex = Math.max(startcellIndex.value, endcellIndex.value);
    let selected = isSelected(rowIndex, cellIndex);
    return {
      selected: selected,
      left: selected && cellIndex == mincellIndex,
      right:
        (selected && cellIndex == maxcellIndex) ||
        (mincellIndex - 1 == cellIndex &&
          rowIndex >= minRowIndex &&
          rowIndex <= maxRowIndex),
      top: selected && rowIndex == minRowIndex,
      bottom: selected && rowIndex == maxRowIndex,
      sticky: col.sticky,
    };
  };

  const dragstart = (event) => {
    let interceptor = event.target.closest(".etype");
    if (interceptor) {
      let rowIndex = parseInt(interceptor.closest(".row").dataset.rowIndex);
      let row = flatRows[rowIndex];
      console.log(event);
      dragStartClientX = event.clientX;
    }
  };

  const drop = (event) => {
    let interceptor = event.target.closest(".row");
    if (!interceptor) {
      return;
    }
    let rowIndex = parseInt(interceptor.closest(".row").dataset.rowIndex);

    useDataRowsStore().dragAndDrop(
      rowIndex,
      event.clientX - dragStartClientX > 50
    );

    selectRowsIndex.length = 0;
    isDrag.value =false;
  };

  const getCacWidth = ()=>{
    return (calculateDaysBetweenDates(selectStartRef.value.end, selectStartRef.value.start)) * 100 + '%';
  }

  const handleKeyDown = (event)=> {
    if (
      event.key === "Delete" ||
      event.key === "Backspace" ||
      event.code === "Delete" ||
      event.code === "Backspace"
    ) {
      if (selectStartRef.value) {
        delete selectStartRef.value.row._tl;
        selectStartRef.value = null;
      }
    }
  }

  const calculateDaysBetweenDates=(d1, d2, exclusiveHolidayWeeken)=> {

    if(!d2)return 1;
    let date1 = d1.i > d2.i ? d1 : d2;
    let date2 = d1.i > d2.i ? d2 : d1;
    if (exclusiveHolidayWeeken) {
      let weekIndex1 = parseInt(date1.i / 7);
      let weekIndex2 = parseInt(date2.i / 7);

      let i = date2.i % 7;
      let count = 0;
      for (let w = weekIndex2; w <= weekIndex1; w++) {

        for (; i <= (w < weekIndex1 ? 6 : date1.i % 7); i++) {
          let day = weeks[w].dates[i];
          if (day.isWeekend || day.holiday) continue;
          count++;

        }
        i = 0;
      }
      return count;

    }
    return date1.i - date2.i + 1;


  }

  const locateCurSch = (event) =>{

    console.log('locateCurSch',event);
    if(moveType.value)return;
    let title = event.target.classList.contains('sch');
    if (title) {
      let rowEl = event.target.closest('.row');
      let plantime = rowEl.querySelector('.plantime');
      if (plantime)
        rowEl.closest('#mainContent').scrollLeft = plantime.offsetLeft;
    }
  }
  const dblclickHandle = (event)=>{
    if(event.target.classList.contains('num')){

      const rowIndex = parseInt(event.target.closest('.row').dataset.rowIndex);
      let row = flatRows[rowIndex];
      row._lock=!row._lock;


    }
  }

  const downloadSch = ()=>{
    let titleCol = config.cols.filter(e => e.show && e.cp == 'ColTitle');
    let row = flatRows[useDataRowsStore().curRowIndex];
    console.log(row)
    let titleProp = 'c'+titleCol[0].fn;
    let fileName = row[titleProp].replace(/<.*?>/g,'').trim();
    let dataList  = useDataRowsStore().getRowRows(row);
      // Create a download link
      console.log(dataList);
      const csvContent = dataList.map(e=>['" '.repeat(e._level-row._level)+`${e[titleProp].replace(/<.*?>/g,'').trim()}"`]).map(e => e.join(',')).join('\n');

      const downloadLink = document.createElement('a');
      downloadLink.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
      downloadLink.setAttribute('download', `${fileName}.csv`);

      // Append the link to the document and click it
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
  }

  return {
    dragOver,
    handleMouseDown,
    handleMouseCellsMove,
    handleMouseUp,
    weeks,
    isSelected,
    cellClass,
    dragstart,
    drop,getCacWidth,handleKeyDown,
    selectRowSch,
    selectStartRef,
    calculateDaysBetweenDates,
    isDrag,curRowIndex,moveType,locateCurSch,dragMode,dblclickHandle,getDate,
    inDragRang,downloadSch
  };
}
