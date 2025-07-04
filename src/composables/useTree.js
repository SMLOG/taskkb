import { useAppStore } from "@/stores/appStore";
import { v4 as uuidv4 } from 'uuid';

import {
  getRowFromDepth,
  deleteNodes,
  copyNode,
  getRows,
  appendNodeNextTo,
  filterChildDepths,
} from "@/lib/treelib";
import {
  addDatePeriod,
  deepCopy,
  calcDaysBetween,
  formatDate2,
  getPreviousWeekDate,
  generateWeeks,
} from "@/lib/schedule";
import { debounce } from "lodash";
import {
  weeksRef,
  selectDepths,
  selectStartRef,
  isDrag,
  dragMode,
  moveType,
  enableSelectionTimeout,
  enableDragTimeout,
  config,
} from "./context";


function getDate(i) {
  const weekIndex = parseInt(i / 7);

  return weeksRef.value[weekIndex].dates[i % 7];
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
    if (
      (date.isWeekend &&
        config.allowOptions &&
        config.allowOptions.indexOf("W") == -1) ||
      (date.holiday &&
        config.allowOptions &&
        config.allowOptions.indexOf("H") == -1)
    )
      continue;
    k++;
    if (k == total) return getDate(start);
  }
}



export function useTree() {
  let isMouseDown;
  let selectDetphStart;
  let selectDetphEnd;



  const selectRowSch = (row, event) => {
    if (
      row?._tl?.start && row?._tl?.end

    ) {
      selectStartRef.value = {
        type: 1,
        row: row,
        start: row._tl.start,
        end: row._tl.end,
      };
    }
  };
  const handleMouseDown = (event) => {
    isMouseDown = true;
    const rowEl = event.target.closest(".row");
    const cell = event.target.closest("div.col");

    // Early exit if neither row nor cell is found
    if (!rowEl && !cell) return;

    // Prevent default and blur active element
    //  event.preventDefault();
    if (
      document.activeElement &&
      !cell?.querySelector("[contenteditable=true]")
    ) {
      document.activeElement.blur();
    }



    // Handle row-specific logic
    if (rowEl) {
      const { depth } = rowEl.dataset;
      const target = event.target;

      // Handle number cell click
      const schDrag = target.closest('.selectStartRef');

      if (!schDrag) {
        if (selectDepths.length > 0) {
          if (selectDepths.includes(depth)) {
            isDrag.value = true;
          } else {
            selectDepths.length = 0;
            isDrag.value = false;


          }
          // handleNumClick(depth);
          return;
        } else {
          enableSelectionTimeout.value = setTimeout(() => {
            if (selectDepths.indexOf(depth) == -1) {
              selectDepths.push(depth);
              selectDetphStart = depth;
              /* enableDragTimeout.value = setTimeout(()=>{
                 isDrag.value =true;
               },300);*/
            }
            //handleNumClick(depth);
          }, 300);
        }
      }


      // Clear selection if not a number cell
      selectDepths.length = 0;
      selectDetphStart = selectDetphEnd = null;

      const row = getRowFromDepth(useAppStore().treeRef, depth);
      if (
        !row ||
        !row._tl?.start ||
        !selectStartRef.value ||
        selectStartRef.value.row !== row
      ) {
        handleScheduleClick(row, target, event);
        return;
      }
      const schEl = target.closest(".sch");
      if (!schEl) {
        selectStartRef.value = null;
      }

      // Handle move or drag operations
      setMoveType(row, target, event);
    }
  };


  const handleMouseUp = (event) => {




    isMouseDown = false;

    clearTimeout(enableSelectionTimeout.value);
    clearTimeout(enableDragTimeout.value);

    const rowEl = event.target.closest(".row");
    if (!rowEl) return;
    const { depth } = rowEl.dataset;


    isDrag.value = false;
    if (moveType.value) {
      event.stopPropagation();

      selectStartRef.value.row._tl.start = selectStartRef.value.end.n > selectStartRef.value.start.n ? selectStartRef.value.start : selectStartRef.value.end;
      selectStartRef.value.row._tl.end = selectStartRef.value.start.n > selectStartRef.value.end.n ? selectStartRef.value.start : selectStartRef.value.end;;

      moveType.value = null;
    } else {
      locateCurSch(event);
    }
  };

  const setMoveType = (row, target, event) => {
    const { clientX } = event;
    let moveTypeConfig;

    // Find the matching class
    const className = ["selectStartRef", "rightDrag", "leftDrag"].find((cls) =>
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
    if (!schEl) {
      selectStartRef.value = null;
      return;
    }

    const { left, width: totalWidth } = schEl.getBoundingClientRect();
    const x = event.clientX - left;
    const index = Math.floor((x / totalWidth) * useAppStore().configRef.weekCount * 7);
    const date = weeksRef.value[Math.floor(index / 7)].dates[index % 7];

    if (!row._tl?.start) {
      if (!selectStartRef.value) {
        selectStartRef.value = { type: 2, row, start: date, end: date };
      } else if (
        selectStartRef.value.row === row &&
        selectStartRef.value.start
      ) {
        row._tl = addDatePeriod({
          start: selectStartRef.value.start,
          end: date,
        });
        console.log(row._tl)
      } else {
        selectStartRef.value = null;
      }
    } else {
      selectRowSch(row, event);
    }
  };

  const handleMouseMove = (event) => {
    const rowEl = event.target.closest(".row");
    const sch = event.target.closest(".sch");

    if (rowEl && isMouseDown && !isDrag.value && selectDepths.length) {
      handleSelection(rowEl);
    }

    clearTimeout(enableDragTimeout.value);

    if (sch) {
      const { left, width: totalWidth } = sch.getBoundingClientRect();
      const x = event.clientX - left;
      const index = Math.floor((x / totalWidth) * useAppStore().configRef.weekCount * 7);
      const date = weeksRef.value[Math.floor(index / 7)]?.dates[index % 7];

      if (selectStartRef.value && date) {
        if (!selectStartRef.value.row._tl) {
          selectStartRef.value.end = date;
          autoExpanedWeeksIfNeed([date.i])
          return;
        }

        if (moveType.value) {
          const unitWidth = totalWidth / (useAppStore().configRef.weekCount * 7);
          const ox = event.clientX - moveType.value.x;

          let newIndex =
            moveType.value._tl[
              moveType.value.type === "rightDrag" ? "end" : "start"
            ].i + Math.floor(ox / unitWidth);

          const newDate =
            weeksRef.value[Math.floor(newIndex / 7)]?.dates[newIndex % 7];
          if (!newDate) {
            debouncedIncreaseWeeks(ox < 0);

            return;
          }
          autoExpanedWeeksIfNeed([newDate.i]);

          switch (moveType.value.type) {
            case "rightDrag":
              selectStartRef.value.end = newDate;
              break;
            case "leftDrag":
              selectStartRef.value.start = newDate;
              break;
            default: {
              const moveUnits = Math.floor(ox / unitWidth);



              autoExpanedWeeksIfNeed([Math.max(moveType.value._tl.start.i, moveType.value._tl.end.i) + moveUnits]);

              const startIndex = plusWorkDays(
                moveType.value._tl.start.i,
                moveUnits
              ).i;
              const endIndex = plusWorkDays(
                moveType.value._tl.end.i,
                moveUnits
              ).i;

              selectStartRef.value.start =
                weeksRef.value[Math.floor(startIndex / 7)]?.dates[
                startIndex % 7
                ];
              selectStartRef.value.end =
                weeksRef.value[Math.floor(endIndex / 7)]?.dates[endIndex % 7];
            }
          }
        }
      }
    }
  };

  function autoExpanedWeeksIfNeed(indexs) {
    for (let i = 0; i < indexs.length; i++) {
      let weekIndex = parseInt((indexs[i] + 1) / 7);

      if (weeksRef.value.length <= weekIndex) {
        useAppStore().configRef.weekCount = weekIndex + 1;

        weeksRef.value = generateWeeks(
          useAppStore().configRef.startDate,
          weekIndex + 1
        );
      }
    }

  }

  const debouncedIncreaseWeeks = debounce((backwalk) => {
    if (backwalk) {
      useAppStore().configRef.startDate = getPreviousWeekDate(
        new Date(useAppStore().configRef.startDate)
      );
      selectStartRef.value.start.i += 7;
      selectStartRef.value.end.i += 7;
    }

    useAppStore().configRef.weekCount++;

    weeksRef.value = generateWeeks(
      useAppStore().configRef.startDate,
      useAppStore().configRef.weekCount
    );
  }, 600);

  const cellClass = (col) => {
    return {
      sticky: col.sticky,
    };
  };


  const getCacWidth = () => {
    return (
      calculateDaysBetweenDates(
        selectStartRef.value.end,
        selectStartRef.value.start
      ) *
      100 +
      "%"
    );
  };

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
  };

  const calculateDaysBetweenDates = (d1, d2, exclusiveHolidayWeeken) => {
    return calcDaysBetween(weeksRef.value, d1, d2, exclusiveHolidayWeeken);
  };

  const locateCurSch = (event) => {
    let title = event.target.classList.contains("sch");
    if (title) {
      let rowEl = event.target.closest(".row");
      let plantime = rowEl.querySelector(".plantime");
      if (plantime)
        rowEl.closest("#mainContent").scrollLeft = plantime.offsetLeft;
    }
  };
  const dblclickHandle = (event) => { };

  const calDiffDates = (firstDay) => {
    return (
      calculateDaysBetweenDates(
        selectStartRef.value.start.n < selectStartRef.value.end.n
          ? selectStartRef.value.start
          : selectStartRef.value.end,
        firstDay
      ) - 1
    );
  };
  const insertNode = (node) => {
    let rootObj = useAppStore().treeRef;
    node.id = uuidv4();
    let parentNode = rootObj;
    if (selectDepths.length) {
      let lastDepth = selectDepths[selectDepths.length - 1];
      selectDepths.forEach(() => appendNodeNextTo(rootObj, lastDepth, node));
    } else {
      if (!parentNode._childs) parentNode._childs = [];
      parentNode._childs.push(node);
    }
  };
  const delSelectedNode = () => {
    let rootObj = useAppStore().treeRef;
    deleteNodes(rootObj, selectDepths);
    selectDepths.length = 0;
  };
  const copySelectedNode = () => {
    let rootObj = useAppStore().treeRef;

    if (selectDepths.length == 1) {
      copyNode(rootObj, selectDepths[0]);
    }
  };

  function handleSelection(rowEl) {
    selectDepths.length = 0;
    selectDetphEnd = rowEl.dataset.depth;

    const rows = document.querySelectorAll(".row");
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

  function exportCSV(config, onlyText = false, colSeperator = ",") {
    let rootObj = useAppStore().treeRef;



    let items = [];

    let j = 0;
    if (selectDepths.length) {

      for (let depth of filterChildDepths(selectDepths)) {
        let item = getRowFromDepth(rootObj, depth);
        items.push(...getRows(item, 0, ++j));
      }
    } else {

      for (let item of rootObj._childs) {
        items.push(...getRows(item, 0, ++j));
      }

    }

    let cols = config.cols.filter((col) => col.show && col.cp != "ColSeq");
    let rows = items.map((item, rowIndex) => {
      let row = item.row;
      return cols
        .map(
          (col, i) =>
            (i == 0 ? "  ".repeat(item.level) + item.depth + "." + " " : "") +
            (row["c" + col.fn] ? row["c" + col.fn] : "")
        )
        .concat(config.showSch ? [
          row._tl ? formatDate2(row._tl.start.date) : "",
          row._tl ? formatDate2(row._tl.end.date) : "",
        ] : []);
    });
    let headers = cols.map((c) => c.name);
    if (config.showSch) headers = headers.concat(["Start Date", "End Date"]);
    rows.unshift(headers);

    let text = rows
      .map((row) =>
        row
          .map(
            (d) =>
              `${(d &&
                d
                  .replace(/"/g, '""')
                  .replace(/<.*?>/g, "")
                  .replace(/&lt;/g, "<")
                  .replace(/&gt;/g, ">")
                  .replace(/&amp;/g, "&")
                  .replace(/&nbsp;/g, " ")
                  .replace(/\\n/g, "\\n")) ||
              ""
              }`
          )
          .map((d, i) => (onlyText ? `\`${d}\`` : `"${d}"`))
          .join(colSeperator)
      )
      .join("\n");
    return text;
  }



  return {
    calDiffDates,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    weeksRef,
    cellClass,

    getCacWidth,
    handleKeyDown,
    selectRowSch,
    selectStartRef,
    calculateDaysBetweenDates,
    moveType,
    locateCurSch,
    dragMode,
    dblclickHandle,
    selectDepths,
    insertNode,
    delSelectedNode,
    copySelectedNode,
    exportCSV,
  };
}
