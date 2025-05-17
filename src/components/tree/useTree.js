import { ref } from "vue";
import { useTreeRowsStore } from "@/stores/treeRows";
import { useConfigStore } from "@/stores/config";
import { getRowFromDepth,moveNode,deleteNode,copyNode } from './treelib'
import { addDatePeriod, deepCopy, calcDaysBetween } from './schedule';


const weeksRef = ref([]);
const weeks = weeksRef.value;
const selectDepthsRef = ref([]);
const selectDepths = selectDepthsRef.value;
const selectStartRef = ref(null);
const isDrag = ref(false);
const isDraging = ref(false);
const dragMode = ref(false);
const moveType = ref(null);




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

export function useTree() {
  const rootObj = useTreeRowsStore().dataRows;
  config = useConfigStore().config;
  let isMouseDown;
  let selectDetphStart;
  let selectDetphEnd;

  const dragOver = (event) => {
    event.preventDefault();
  };

  const selectRowSch = (row, event) => {
    if (!moveType.value && (!selectStartRef.value || selectStartRef.value.type != 2)) {
      selectStartRef.value = { type: 1, row: row, start: row._tl.start, end: row._tl.end };
    }

  }
const handleMouseDown = (event) => {
  const rowEl = event.target.closest(".row");
  const cell = event.target.closest("div.col");
  
  // Early exit if neither row nor cell is found
  if (!rowEl && !cell) return;

  // Prevent default and blur active element
//  event.preventDefault();
  if (document.activeElement && !cell?.querySelector("[contenteditable=true]")) {
    document.activeElement.blur();
  }

  isMouseDown = true;

  // Handle row-specific logic
  if (rowEl) {
    const { depth } = rowEl.dataset;
    const target = event.target;

    // Handle number cell click
    if (target.classList.contains("num")) {
      console.log('handleNumClick')
      handleNumClick(depth);
      return;
    }

    // Clear selection if not a number cell
    selectDepths.length = 0;
    selectDetphStart = selectDetphEnd = null;

    const row = getRowFromDepth(rootObj, depth);
    if (!row || !row._tl?.start || !selectStartRef.value || selectStartRef.value.row !== row) {
      handleScheduleClick(row, target, event);
      return;
    }

    // Handle move or drag operations
    handleSchMoveOrDrag(row, target, event);
  }
};

// Helper function for number cell click
const handleNumClick = (depth) => {
  if (selectDepths.includes(depth)) {
    isDrag.value = true;
  } else {
    selectDepths.length=0;
    selectDepths.push(depth);
        selectDetphStart = depth;

  }
};

  const handleMouseUp = (event) => {

    if(isDraging.value){
      isDraging.value=false;
      return;
    }
    const rowEl = event.target.closest(".row");
    const { depth } = rowEl.dataset;
    if (isDrag.value) {
      selectDepths.length = 0;
      selectDepths.push(depth);
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
  
const handleSchMoveOrDrag = (row, target, event) => {
  const { clientX } = event;
  let moveTypeConfig;

  // Find the matching class
  const className = ["selectStartRef", "rightDrag", "leftDrag"].find(cls => 
    target.classList.contains(cls)
  );

  switch (className) {
    case "selectStartRef":
      moveTypeConfig = {
        type: "move",
        x: clientX,
        _tl: deepCopy(row._tl),
      };
      break;
    case "rightDrag":
      moveTypeConfig = {
        type: "rightDrag",
        x: clientX,
        initValue: deepCopy(row._tl.end),
        _tl: deepCopy(row._tl),
      };
      break;
    case "leftDrag":
      moveTypeConfig = {
        type: "leftDrag",
        x: clientX,
        initValue: deepCopy(row._tl.start),
        _tl: deepCopy(row._tl),
      };
      break;
    default:
      // No matching class, moveTypeConfig remains undefined
      break;
  }

  if (moveTypeConfig) {
    moveType.value = moveTypeConfig;
  }
};

const handleScheduleClick = (row, target, event) => {
  const schEl = target.closest(".sch");
  if (!schEl) return;

  const { left, width: totalWidth } = schEl.getBoundingClientRect();
  const x = event.clientX - left;
  const index = Math.floor((x / totalWidth) * config.weekCount * 7);
  const date = weeks[Math.floor(index / 7)].dates[index % 7];

  if (!row._tl?.start) {
    if (!selectStartRef.value) {
      selectStartRef.value = { type: 2, row, start: date, end: date };
    } else if (selectStartRef.value.row === row && selectStartRef.value.start) {
      console.log("update");
      row._tl = addDatePeriod({
        start: selectStartRef.value.start,
        end: date,
      });
    } else {
      selectStartRef.value = null;
      console.log("delete selectStart");
    }
  } else {
    if (selectStartRef.value && row !== selectStartRef.value.row) {
      selectStartRef.value = null;
      console.log("delete selectStart");
    } else {
      selectRowSch(row, event);
    }
  }
};

const handleMouseCellsMove = (event) => {
  const rowEl = event.target.closest(".row");
  if (rowEl && isMouseDown && !isDrag.value && selectDepths.length) {
    selectDepths.length = 0;
    selectDetphEnd = rowEl.dataset.depth;
    
    const rows = document.querySelectorAll('.row');
    const rowsDepthIndexMap = new Map();
    rows.forEach((el, index) => {
      if (el.dataset?.depth) rowsDepthIndexMap.set(el.dataset.depth, index);
    });

    const startIndex = rowsDepthIndexMap.get(selectDetphStart);
    const endIndex = rowsDepthIndexMap.get(selectDetphEnd);
    
    if (startIndex !== undefined && endIndex !== undefined) {
      const minIndex = Math.min(startIndex, endIndex);
      const length = Math.abs(startIndex - endIndex) + 1;
      selectDepths.push(
        ...Array.from({ length }, (_, i) => rows[minIndex + i].dataset.depth)
      );
    }
  }

  const sch = event.target.closest(".sch");
  if (sch) {
    const { left, width: totalWidth } = sch.getBoundingClientRect();
    const x = event.clientX - left;
    const index = Math.floor((x / totalWidth) * config.weekCount * 7);
    const date = weeks[Math.floor(index / 7)]?.dates[index % 7];

    if (selectStartRef.value && date) {
      if (!selectStartRef.value.row._tl) {
        selectStartRef.value.end = date;
        return;
      }

      if (moveType.value) {
        const unitWidth = totalWidth / (config.weekCount * 7);
        const ox = event.clientX - moveType.value.x;
        let newIndex = moveType.value._tl[moveType.value.type === "rightDrag" ? "end" : "start"].i +
          Math.floor(ox / unitWidth);
        
        const newDate = weeks[Math.floor(newIndex / 7)]?.dates[newIndex % 7];
        if (!newDate) return;

        switch (moveType.value.type) {
          case "rightDrag":
            selectStartRef.value.end = newDate;
            break;
          case "leftDrag":
            selectStartRef.value.start = newDate;
            break;
          default: {
            const moveUnits = Math.floor(ox / unitWidth);
            const startIndex = plusWorkDays(moveType.value._tl.start.i, moveUnits).i;
            const endIndex = plusWorkDays(moveType.value._tl.end.i, moveUnits).i;

            selectStartRef.value.start = weeks[Math.floor(startIndex / 7)]?.dates[startIndex % 7];
            selectStartRef.value.end = weeks[Math.floor(endIndex / 7)]?.dates[endIndex % 7];
            console.log("moveUnits", moveUnits);
          }
        }
      }
    }
  }
};




  const cellClass = ( col) => {
    return {
      sticky: col.sticky,
    };
  };

  const dragstart = (event) => {
    console.log('dragstart')
    let interceptor = event.target.closest(".row");
    if (interceptor && isDrag.value) {
      dragStartClientX = event.clientX;
      console.log('dragStartClientX', dragStartClientX);
    }

    isDraging.value=true;
  };




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

    return calcDaysBetween(weeks, d1, d2, exclusiveHolidayWeeken);


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
  const insertNode=(node)=>{
    let parent = rootObj;
    if(selectDepths.length>0){
      parent = getRowFromDepth(rootObj, selectDepths[0]);
    }
    if(!parent._childs)parent._childs=[]
    parent._childs.push(node)
  }
  const delSelectedNode = ()=>{
      for(let depth of selectDepths){
          deleteNode(rootObj,depth);
      }
  }
  const copySelectedNode = ()=>{
      if(selectDepths.length==1){
        copyNode(rootObj,selectDepths[0]);
      }
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
     selectDepths,rootObj,insertNode,delSelectedNode,copySelectedNode
  };
}
