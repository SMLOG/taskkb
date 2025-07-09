import { useAppStore } from "@/stores/appStore";
import { ref, onBeforeUnmount, watch, nextTick } from 'vue';
import {
  getRowFromDepth,
} from "@/lib/treelib";
import {
  addDatePeriod,
  deepCopy,
  calcDaysBetween,
  getPreviousWeekDate,
  generateWeeks, 
  getDateInfo
} from "@/lib/schedule";
import { debounce } from "lodash";
import {
  weeksRef,
  dragMode,
  moveType
} from "./context";

const selectStartRef = ref(null);
let pressTimer = null;

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
  function linkRowToSelectStartRef(row, event) {
    if (row?._tl?.start && row?._tl?.end) {
      selectStartRef.value = {
        type: 1,
        row: row,
        start: getDateInfo(row._tl.start, getFirstDay()),
        end: getDateInfo(row._tl.end, getFirstDay()),
        el: event.target.closest(".row"),
      };
    }
  }

  function handleMouseDown(event) {
    const rowEl = event.target.closest(".row");
    const cell = event.target.closest("div.col");
    
    if (!rowEl && !cell) return;

    if (document.activeElement && !cell?.querySelector("[contenteditable=true]")) {
      document.activeElement.blur();
    }

    if (rowEl) {
      const { depth } = rowEl.dataset;
      const target = event.target;
      const schEl = target.closest(".sch");
      const row = getRowFromDepth(useAppStore().treeRef, depth);

      if (!schEl) {
        selectStartRef.value = null;
        return;
      }
      
      if (!row || !row._tl?.start || !selectStartRef.value || selectStartRef.value.row !== row) {
        startRowSchedule(row, target, event);
      } else {
        setMoveType(row, target, event);
      }
    }
  }

  function handleTouchStart(event) {
    event.preventDefault();
    clearTimeout(pressTimer);
    
    const touch = event.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    
    pressTimer = setTimeout(() => {
      handleLongPress(touch, target);
    }, 500);

    const mouseEvent = {
      clientX: touch.clientX,
      clientY: touch.clientY,
      target: target,
      preventDefault: () => event.preventDefault(),
      stopPropagation: () => event.stopPropagation()
    };
    
    handleMouseDown(mouseEvent);
  }

  function handleLongPress(touch, target) {
    // Implement long-press behavior if needed
    // For example, show context menu or trigger special action
    console.log("Long press detected");
  }

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
  }

  function handleTouchEnd(event) {
    event.preventDefault();
    clearTimeout(pressTimer);
    
    if (event.changedTouches.length > 0) {
      const touch = event.changedTouches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      
      const mouseEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        target: target,
        preventDefault: () => event.preventDefault(),
        stopPropagation: () => event.stopPropagation()
      };
      
      handleMouseUp(mouseEvent);
    }
  }

  function handleMouseMove(event) {
    if (!selectStartRef.value) return;

    const rowEl = event.target.closest(".row");
    if (!rowEl && selectStartRef.value.el !== rowEl) return;
    
    const sch = rowEl.querySelector(".sch");
    if (!sch) return;
    
    const { left, width: totalWidth } = sch.getBoundingClientRect();
    const x = event.clientX - left;
    const dayWidth = totalWidth / (useAppStore().configRef.weekCount * 7);
    const dayIndex = Math.floor(x / dayWidth);
    
    autoExpanedWeeksIfNeed(dayIndex);

    const dateInfo = weeksRef.value[Math.floor(dayIndex / 7)]?.dates[dayIndex % 7];

    if (selectStartRef.value && dateInfo) {
      if (!selectStartRef.value.row._tl) {
        selectStartRef.value.end = dateInfo;
        return;
      }

      if (moveType.value) {
        const unitWidth = totalWidth / (useAppStore().configRef.weekCount * 7);
        const ox = event.clientX - moveType.value.x;

        let dateInfo = getDateInfo(moveType.value._tl[
          moveType.value.type === "rightDrag" ? "end" : "start"
        ], getFirstDay());

        let newIndex = dateInfo.i + Math.floor(ox / unitWidth);

        const newDate = weeksRef.value[Math.floor(newIndex / 7)]?.dates[newIndex % 7];
        if (!newDate) {
          debouncedIncreaseWeeks(ox < 0);
          return;
        }
        autoExpanedWeeksIfNeed(newDate.i);

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
            autoExpanedWeeksIfNeed(Math.max(startInfo.i, endInfo.i) + moveUnits);

            const startIndex = plusWorkDays(startInfo.i, moveUnits).i;
            const endIndex = plusWorkDays(endInfo.i, moveUnits).i;

            selectStartRef.value.start = weeksRef.value[Math.floor(startIndex / 7)]?.dates[startIndex % 7];
            selectStartRef.value.end = weeksRef.value[Math.floor(endIndex / 7)]?.dates[endIndex % 7];
          }
        }
      }
    }
  }

  function handleTouchMove(event) {
    event.preventDefault();
    const touch = event.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    
    const mouseEvent = {
      clientX: touch.clientX,
      clientY: touch.clientY,
      target: target,
      preventDefault: () => event.preventDefault(),
      stopPropagation: () => event.stopPropagation()
    };
    
    handleMouseMove(mouseEvent);
  }

  function setMoveType(row, target, event) {
    const { clientX } = event;
    let moveTypeConfig;

    const className = ["selectStartRef", "rightDrag", "leftDrag"].find((cls) =>
      target.classList.contains(cls)
    );
    
    switch (className) {
      case "selectStartRef":
        moveTypeConfig = { type: "move", x: clientX, _tl: deepCopy(row._tl) };
        break;
      case "rightDrag":
        moveTypeConfig = { type: "rightDrag", x: clientX, initValue: deepCopy(row._tl.end), _tl: deepCopy(row._tl) };
        break;
      case "leftDrag":
        moveTypeConfig = { type: "leftDrag", x: clientX, initValue: deepCopy(row._tl.start), _tl: deepCopy(row._tl) };
        break;
    }
    
    if (moveTypeConfig) {
      moveType.value = moveTypeConfig;
    }
  }

  function startRowSchedule(row, target, event) {
    if (!row._tl?.start) {
      const schEl = target.closest(".sch");
      const { left, width: totalWidth } = schEl.getBoundingClientRect();
      const x = event.clientX - left;
      const index = Math.floor((x / totalWidth) * useAppStore().configRef.weekCount * 7);
      const date = weeksRef.value[Math.floor(index / 7)].dates[index % 7];
      
      if (!selectStartRef.value) {
        selectStartRef.value = { type: 2, row, start: date, end: date, el: event.target.closest(".row") };
      } else if (selectStartRef.value.row === row && selectStartRef.value.start) {
        row._tl = addDatePeriod({ start: selectStartRef.value.start, end: date });
      } else {
        selectStartRef.value = null;
      }
    } else {
      linkRowToSelectStartRef(row, event);
    }
  }

  function getFirstDay() {
    return weeksRef.value[0].dates[0].date;
  }

  async function expandSchToDate(date) {
    const dateInfo = getDateInfo(date, getFirstDay());
    autoExpanedWeeksIfNeed(dateInfo.i);
    await nextTick();
    jumpToDate(date);
  }

  function autoExpanedWeeksIfNeed(dateIndex) {
    const appStore = useAppStore();
  
    if (dateIndex < 0) {
      const newStartDate = new Date(getFirstDay());
      newStartDate.setDate(newStartDate.getDate() + dateIndex);
      appStore.configRef.startDate = newStartDate;
      const weeksToAdd = Math.ceil(Math.abs(dateIndex) / 7);
      appStore.configRef.weekCount += weeksToAdd;
      weeksRef.value = generateWeeks(newStartDate, appStore.configRef.weekCount);
      return;
    }
  
    const weekIndex = Math.floor(dateIndex / 7);
    if (weeksRef.value.length <= weekIndex) {
      appStore.configRef.weekCount = weekIndex + 1;
      weeksRef.value = generateWeeks(appStore.configRef.startDate, weekIndex + 1);
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
    if (!selectStartRef?.value) return '0%';
    const { start, end } = selectStartRef.value;
    if (!start || !end || start.n === undefined || end.n === undefined) return '0%';
    
    const laterDate = start.n > end.n ? start : end;
    const earlierDate = start.n > end.n ? end : start;
    const daysBetween = calculateDaysBetweenDates(laterDate, earlierDate);
    
    return `${daysBetween * 100}%`;
  }

  function handleKeyDown(event) {
    if (["Delete", "Backspace"].includes(event.key) || 
        ["Delete", "Backspace"].includes(event.code)) {
      if (selectStartRef.value) {
        delete selectStartRef.value.row._tl;
        selectStartRef.value = null;
      }
    }
  }

  function calculateDaysBetweenDates(d1, d2, exclusiveHolidayWeeken) {
    return calcDaysBetween(weeksRef.value, d1, d2, exclusiveHolidayWeeken);
  }

  function calculateDaysBetweenDates2(d1, d2, exclusiveHolidayWeeken, row) {
    return calcDaysBetween(weeksRef.value, d1, d2, exclusiveHolidayWeeken);
  }

  function jumpToDate(date) {
    const dateInfo = getDateInfo(date, getFirstDay());
    const dayEl = document.querySelector('.header')?.querySelectorAll(".day")[dateInfo.i];
    if (!dayEl) return;

    const mainContent = dayEl.closest(".absolute") || document.getElementById("mainContent");
    if (!mainContent) return;

    const containerRect = mainContent.getBoundingClientRect();
    const elementRect = dayEl.getBoundingClientRect();
    const containerScrollLeft = mainContent.scrollLeft;
    const elementCenter = elementRect.left - containerRect.left + containerScrollLeft;
    const containerCenter = containerRect.width / 2;
    const scrollTo = elementCenter - containerCenter + (elementRect.width / 2);
    const maxScroll = mainContent.scrollWidth - containerRect.width;
    const boundedScroll = Math.max(0, Math.min(scrollTo, maxScroll));

    const scrollOptions = { left: boundedScroll, behavior: 'smooth' };
    if ('scrollBehavior' in document.documentElement.style) {
      mainContent.scrollTo(scrollOptions);
    } else {
      mainContent.scrollLeft = boundedScroll;
    }
  }

  function jumpToPlanTime(event) {
    const schElement = event.target.closest(".sch");
    if (!schElement) return;

    const rowEl = schElement.closest(".row");
    if (!rowEl) return;

    const plantime = rowEl.querySelector(".plantime");
    if (!plantime) return;

    const mainContent = el.value?.closest(".absolute") || document.getElementById("mainContent");
    if (!mainContent) return;

    const containerRect = mainContent.getBoundingClientRect();
    const elementRect = plantime.getBoundingClientRect();
    const containerScrollLeft = mainContent.scrollLeft;
    const elementCenter = elementRect.left - containerRect.left + containerScrollLeft;
    const containerCenter = containerRect.width / 2;
    const scrollTo = elementCenter - containerCenter + (elementRect.width / 2);
    const maxScroll = mainContent.scrollWidth - containerRect.width;
    const boundedScroll = Math.max(0, Math.min(scrollTo, maxScroll));

    const scrollOptions = { left: boundedScroll, behavior: 'smooth' };
    if ('scrollBehavior' in document.documentElement.style) {
      mainContent.scrollTo(scrollOptions);
    } else {
      mainContent.scrollLeft = boundedScroll;
    }
  }

  const dblclickHandle = (event) => { };

  function calDiffDates(firstDay) {
    const { start, end } = selectStartRef.value;
    const earlierDate = start.n < end.n ? start : end;
    return calculateDaysBetweenDates(earlierDate, firstDay) - 1;
  }

  watch(
    () => el?.value,
    () => {
      if (!el?.value) return;
      
      // Mouse events
      el.value.addEventListener('mousedown', handleMouseDown);
      el.value.addEventListener('mousemove', handleMouseMove);
      el.value.addEventListener('mouseup', handleMouseUp);
      el.value.addEventListener('dblclick', dblclickHandle);
      
      // Touch events
      el.value.addEventListener('touchstart', handleTouchStart, { passive: false });
      el.value.addEventListener('touchmove', handleTouchMove, { passive: false });
      el.value.addEventListener('touchend', handleTouchEnd, { passive: false });
      
      document.addEventListener('keydown', handleKeyDown);
    },
    { deep: true }
  );

  onBeforeUnmount(() => {
    if (el?.value) {
      el.value.removeEventListener('touchstart', handleTouchStart);
      el.value.removeEventListener('touchmove', handleTouchMove);
      el.value.removeEventListener('touchend', handleTouchEnd);
    }
    document.removeEventListener('keydown', handleKeyDown);
    clearTimeout(pressTimer);
  });

  return {
    calDiffDates,
    weeksRef,
    getCacWidth,
    selectStartRef,
    calculateDaysBetweenDates,
    moveType,
    dragMode, 
    calculateDaysBetweenDates2,
    expandSchToDate
  };
}