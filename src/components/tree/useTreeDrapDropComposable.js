import { ref } from "vue";
import { useTreeRowsStore } from "@/stores/treeRows";
import { useConfigStore } from "@/stores/config";
import { getRowFromDepth } from './treelib'
import { addDatePeriod, deepCopy} from './schedule'
const weeksRef = ref([]);
const weeks = weeksRef.value;
const selectDepthsRef = ref([]);
const selectDepths = selectDepthsRef.value;
let selectStartRef = ref(null);

const isDrag = ref(false);
const dragMode = ref(false);




function getDate(i) {
  return weeks[parseInt(i / 7)].dates[i % 7];

}
function plusWorkDays(startIndex, days) {
  let start = startIndex;
  let k = 0;
  let total = Math.abs(days);
  let inc = days > 0 ? 1 : -1;
  if (days == 0) return getDate(start);
  for (; true;) {
    start += inc;
    let date = getDate(start);
    if (date.isWeekend && config.allowOptions && config.allowOptions.indexOf('W') == -1 || date.holiday && config.allowOptions && config.allowOptions.indexOf('H') == -1) continue;
    k++;
    if (k == total) return getDate(start);
  }

}


let config;
let dragStartClientX;

export function useDrapDropComposable() {
  const rootObj = useTreeRowsStore().dataRows;
  config = useConfigStore().config;
  let isMouseDown;
  let selectDetphStart;
  let selectDetphEnd;
  let moveType = ref(null);
  let resizeColumn;

  const dragOver = (event) => {
    event.preventDefault();
  };

  const selectRowSch = (row, event) => {
    if (!moveType.value && (!selectStartRef.value || selectStartRef.value.type != 2)) {
      selectStartRef.value = { type: 1, row: row, start: row._tl.start, end: row._tl.end };
    }

  }

  const handleMouseDown = (event) => {

    let rowEl = event.target.closest(".row");
    if (rowEl) {
      isMouseDown = true;
      let depth = rowEl.dataset.depth;

      if (event.target.classList.contains("num")) {
        if (selectDepths.indexOf(depth) > -1) {
          //drag
          isDrag.value = true;
        } else {

          selectDepths.push(depth);
          selectDetphStart = depth;
        }
      } else {
        selectDepths.length = 0;
        selectDetphStart = selectDetphEnd = null;

        let row = getRowFromDepth(rootObj, rowEl.dataset.depth);
        if (row && row._tl && row._tl.start && selectStartRef.value && selectStartRef.value.row == row) {
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
            } else {
              selectRowSch(row, event);
            }

          }
        }
      }
    }

    const cell = event.target.closest("div.col");
    if (!cell || resizeColumn) {
      return null;
    }
    const activeElement = document.activeElement;

    if (cell.querySelector("[contenteditable=true]")) return;
    if (activeElement) {
      activeElement.blur();
    }
    isMouseDown = true;
    event.preventDefault();

  };

  const handleMouseCellsMove = (event) => {
    let rowEl = event.target.closest(".row");
    if (rowEl) {
      if (isMouseDown) {
        if (!isDrag.value && selectDepths.length) {
          selectDepths.length = 0;
          selectDetphEnd = rowEl.dataset.depth;
          let rowsDepth = Array.from(document.querySelectorAll('.row')).map(e => e?.dataset?.depth ?? null);

          let rowsDepthIndexMap = rowsDepth.reduce((acc, depth, index) => {
            acc[depth] = index; // Store the latest index
            return acc;
          }, {});

          let startIndex = rowsDepthIndexMap[selectDetphStart];
          let endIndex = rowsDepthIndexMap[selectDetphEnd];
          selectDepths.push(
            ...Array.from(
              { length: Math.abs(startIndex - endIndex) + 1 },
              (_, i) => Math.min(startIndex, endIndex) + i
            ).map(e => rowsDepth[e])
          );
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
              index = plusWorkDays(moveType.value._tl.start.i, moveUnits).i;

              selectStartRef.value.start = weeks[parseInt(index / 7)].dates[index % 7];

              index = plusWorkDays(moveType.value._tl.end.i, moveUnits).i;

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
      selectDepths.length = 0;
    }
    isDrag.value = isMouseDown = false;
    if (moveType.value) {
      event.stopPropagation();

      selectStartRef.value.row._tl.start = selectStartRef.value.start;
      selectStartRef.value.row._tl.end = selectStartRef.value.end;


      moveType.value = null;

    } else {
      locateCurSch(event);
    }
  };
  const dragIndexRang = ref([]);
  const inDragRang = (rowIndex) => {
    return dragIndexRang.value.indexOf(rowIndex) > -1;
  };


  const cellClass = (rowIndex, cellIndex, col) => {
    return {
      sticky: col.sticky,
    };
  };

  const dragstart = (event) => {
    let interceptor = event.target.closest(".row");
    if (interceptor && isDrag.value) {
      dragStartClientX = event.clientX;
      console.log('dragStartClientX', dragStartClientX);
    }
  };


  function moveNode(rootTree, selectDepths, selectDetphEnd, event, dragStartClientX) {
    let targetNode = getRowFromDepth(rootTree, selectDetphEnd);
    let xDiff = event.clientX - dragStartClientX;

    for (let depth of selectDepths.sort((a, b) => b.localeCompare(a))) {
      let srcNode = getRowFromDepth(rootTree, depth);
      let index = parseInt(depth.split('.').pop());

      // Remove srcNode from its current parent's children
      srcNode._p._childs.splice(index, 1);

      if (xDiff > 50) {
        // Make srcNode a child of targetNode
        if (!targetNode._childs) targetNode._childs = [];
        targetNode._childs.push(srcNode);
        srcNode._p = targetNode; // Update srcNode's parent
      } else {
        // Move srcNode next to targetNode at same level
        let parentChilds = targetNode._p._childs;
        let targetIndex = parentChilds.findIndex(node => node === targetNode);
        parentChilds.splice(targetIndex + (xDiff < 0 ? 0 : 1), 0, srcNode);
        srcNode._p = targetNode._p; // Update srcNode's parent to target's parent
      }
    }
  }

  const drop = (event) => {
    let interceptor = event.target.closest(".row");
    if (!interceptor) {
      return;
    }
    selectDetphEnd = interceptor.dataset.depth;
    if (selectDepths.indexOf(selectDetphEnd) > -1) return;
    const rootTree = useTreeRowsStore().dataRows;
    moveNode(rootTree, selectDepths, selectDetphEnd, event, dragStartClientX);
    selectDepths.length = 0;
    isDrag.value = false;
  };

  const getCacWidth = () => {
    return (calculateDaysBetweenDates(selectStartRef.value.end, selectStartRef.value.start)) * 100 + '%';
  }

  const handleKeyDown = (event) => {
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

  const calculateDaysBetweenDates = (d1, d2, exclusiveHolidayWeeken) => {


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

  const locateCurSch = (event) => {

    if (moveType.value) return;
    let title = event.target.classList.contains('sch');
    if (title) {
      let rowEl = event.target.closest('.row');
      let plantime = rowEl.querySelector('.plantime');
      if (plantime)
        rowEl.closest('#mainContent').scrollLeft = plantime.offsetLeft;
    }
  }
  const dblclickHandle = (event) => {
    if (event.target.classList.contains('num')) {
      let row = getRowFromDepth(rootObj, event.target.dataset.depth);
      row._lock = !row._lock;
    }
  }

 
  const calDiffDates = (firstDay) => {
    return (calculateDaysBetweenDates(selectStartRef.value.start.n < selectStartRef.value.end.n ? selectStartRef.value.start : selectStartRef.value.end, firstDay) - 1);
  }
  return {
    calDiffDates,
    dragOver,
    handleMouseDown,
    handleMouseCellsMove,
    handleMouseUp,
    weeks,
    cellClass,
    dragstart,
    drop, getCacWidth, handleKeyDown,
    selectRowSch,
    selectStartRef,
    calculateDaysBetweenDates,
    isDrag, moveType, locateCurSch, dragMode, dblclickHandle,
    inDragRang, selectDepths
  };
}
