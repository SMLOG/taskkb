import { useAppStore } from "@/stores/appStore";
import { ref, onBeforeUnmount, watch } from 'vue';
import {
  getRowFromDepth,
} from "@/lib/treelib";
import {
  addDatePeriod,
  deepCopy,
  calcDaysBetween,
  getPreviousWeekDate,
  generateWeeks, getDateInfo
} from "@/lib/schedule";
import { debounce } from "lodash";
import {
  weeksRef,
  dragMode,
  moveType
} from "./context";

const selectStartRef = ref(null);


function getDate(i) {
  const weekIndex = Math.floor(i / 7);
  return weeksRef.value[weekIndex].dates[i % 7];
}
function plusWorkDays(startIndex, days) {
  if (days === 0) return getDate(startIndex);

  const total = Math.abs(days);
  const inc = days > 0 ? 1 : -1;
  let currentIndex = startIndex;

  for (let k = 0; k < total; k++) {
    currentIndex += inc;
  }

  return getDate(currentIndex);
}



export function useSchedule(el) {

  function selectRowSch(row, event) {
    if (
      row?._tl?.start && row?._tl?.end

    ) {

      selectStartRef.value = {
        type: 1,
        row: row,
        start: getDateInfo(row._tl.start, getFirstDay()),
        end: getDateInfo(row._tl.end, getFirstDay()),
      };
    }
  };
  function handleMouseDown(event) {
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

  function handleMouseUp(event) {

    const rowEl = event.target.closest(".row");
    if (!rowEl) return;


    if (moveType.value) {
      event.stopPropagation();

      selectStartRef.value.row._tl.start = (selectStartRef.value.end.n > selectStartRef.value.start.n ? selectStartRef.value.start : selectStartRef.value.end).date;
      selectStartRef.value.row._tl.end = (selectStartRef.value.start.n > selectStartRef.value.end.n ? selectStartRef.value.start : selectStartRef.value.end).date;

      moveType.value = null;
    } else {
      jumpToPlanTime(event);
    }
  };

  function setMoveType(row, target, event) {
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

  function handleScheduleClick(row, target, event) {
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

  function getFirstDay() {
    return weeksRef.value[0].dates[0].date;
  }
  function handleMouseMove(event) {
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

        let dateInfo = getDateInfo(moveType.value._tl[
          moveType.value.type === "rightDrag" ? "end" : "start"
        ], getFirstDay());

        let newIndex = dateInfo.i + Math.floor(ox / unitWidth);

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


            const startInfo = getDateInfo(moveType.value._tl.start, getFirstDay());
            const endInfo = getDateInfo(moveType.value._tl.end, getFirstDay());
            autoExpanedWeeksIfNeed([Math.max(startInfo.i, endInfo.i) + moveUnits]);

            const startIndex = plusWorkDays(
              startInfo.i,
              moveUnits
            ).i;
            const endIndex = plusWorkDays(
              endInfo.i,
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



  function getCacWidth() {
    return (
      calculateDaysBetweenDates(
        selectStartRef.value.end,
        selectStartRef.value.start
      ) *
      100 +
      "%"
    );
  };

  function handleKeyDown(event) {
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

  function calculateDaysBetweenDates(d1, d2, exclusiveHolidayWeeken) {
    return calcDaysBetween(weeksRef.value, d1, d2, exclusiveHolidayWeeken);
  };
  function calculateDaysBetweenDates2(d1, d2, exclusiveHolidayWeeken, row) {
    return calcDaysBetween(weeksRef.value, d1, d2, exclusiveHolidayWeeken);
  };
  function jumpToPlanTime(event) {
    // Get the target elements
    const schElement = event.target.closest(".sch");
    if (!schElement) return;

    const rowEl = schElement.closest(".row");
    if (!rowEl) return;

    const plantime = rowEl.querySelector(".plantime");
    if (!plantime) return;

    const mainContent = document.getElementById("mainContent");
    if (!mainContent) return;

    // Get all measurements
    const containerRect = mainContent.getBoundingClientRect();
    const elementRect = plantime.getBoundingClientRect();
    const containerScrollLeft = mainContent.scrollLeft;

    // Calculate desired scroll position
    const elementCenter = elementRect.left - containerRect.left + containerScrollLeft;
    const containerCenter = containerRect.width / 2;
    const scrollTo = elementCenter - containerCenter + (elementRect.width / 2);

    // Apply boundaries
    const maxScroll = mainContent.scrollWidth - containerRect.width;
    const boundedScroll = Math.max(0, Math.min(scrollTo, maxScroll));

    // Scroll with polyfill for smooth behavior
    const scrollOptions = {
      left: boundedScroll,
      behavior: 'smooth'
    };

    if ('scrollBehavior' in document.documentElement.style) {
      mainContent.scrollTo(scrollOptions);
    } else {
      // Fallback for browsers without smooth scroll
      mainContent.scrollLeft = boundedScroll;
    }


  }
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
    dragMode, calculateDaysBetweenDates2
  };
}
