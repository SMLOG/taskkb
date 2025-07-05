import { useAppStore } from "@/stores/appStore";
import { ref,onBeforeUnmount,watch } from 'vue';
import {
  getRowFromDepth,
} from "@/lib/treelib";
import {
  addDatePeriod,
  deepCopy,
  calcDaysBetween,
  getPreviousWeekDate,
  generateWeeks,
} from "@/lib/schedule";
import { debounce } from "lodash";
import {
  weeksRef,
  dragMode,
  moveType,
  config,
} from "./context";

const selectStartRef = ref(null);


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
    k++;
    if (k == total) return getDate(start);
  }
}



export function useSchedule(el) {

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
    const rowEl = event.target.closest(".row");
    const cell = event.target.closest("div.col");

    if (!rowEl && !cell) return;

    if (
      document.activeElement &&
      !cell?.querySelector("[contenteditable=true]")
    ) {
      document.activeElement.blur();
    }

    if (rowEl) {
      const { depth } = rowEl.dataset;
      const target = event.target;


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

    const rowEl = event.target.closest(".row");
    if (!rowEl) return;


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
    const sch = event.target.closest(".sch");
    if (!sch) return;
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



  watch(
    () => el?.value,
    () => {
      if (!el?.value) return
      el.value.addEventListener('mousedown', handleMouseDown);
      el.value.addEventListener('mousemove', handleMouseMove);
      el.value.addEventListener('mouseup', handleMouseUp);
      el.value.addEventListener('dblclick', dblclickHandle);
      document.addEventListener('keydown', handleKeyDown);

    },
    { deep: true }
  );


onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown);
});

  return {
    calDiffDates,
    weeksRef,
    getCacWidth,
    selectStartRef,
    calculateDaysBetweenDates,
    moveType,
    dragMode,
  };
}
