import {
  selectDepthsRef,
  isDraggable,
  enableSelectionTimeout,
  enableDragTimeout, 
  selectDetphStart, 
  selectDetphEnd,
  isDragging,
  resetSelectDepths
} from "./context";
import { watch } from 'vue';

export function useContextHandler(elRef) {
  let isMouseDown = false;
  let isTouchActive = false;
  
  function handleStart(event) {
    // For touch events, prevent default to avoid scrolling and other browser behaviors
    if (event.type === 'touchstart') {
      event.preventDefault();
      isTouchActive = true;
    }
    
    const rowEl = event.target.closest(".row");
    isMouseDown = true;
    const schDrag = event.target.closest('.selectStartRef');
    if (schDrag) return;

    if (rowEl) {
      const { depth } = rowEl.dataset;

      if (selectDepthsRef.value.length > 0) {
        if (selectDepthsRef.value.includes(depth)) {
          isDraggable.value = true;
        } else {
          resetSelectDepths()
          isDraggable.value = false;
        }
        return;
      } else {
        enableSelectionTimeout.value = setTimeout(() => {
          if (selectDepthsRef.value.indexOf(depth) == -1) {
            selectDepthsRef.value.push(depth);
            selectDetphStart.value = depth;
            isDragging.value = true;
          }
        }, 300);
      }

      resetSelectDepths();
      selectDetphStart.value = null;
      selectDetphEnd.value = null;
    }
  }

  function handleEnd(event) {
    isMouseDown = false;
    isTouchActive = false;
    clearTimeout(enableSelectionTimeout.value);
    clearTimeout(enableDragTimeout.value);

    if (isDraggable.value) {
      resetSelectDepths();
    }
    isDraggable.value = false;
    isDragging.value = false;
    
    const rowEl = event.target.closest(".row");
    if (!rowEl) return;
    console.log(isDraggable.value);
  }

  function handleMove(event) {
    // For touch events, prevent default to avoid scrolling
    if (event.type === 'touchmove') {
      event.preventDefault();
    }
    
    let target;
    if (event.type === 'touchmove') {
      const touch = event.touches[0] || event.changedTouches[0];
      target = document.elementFromPoint(touch.clientX, touch.clientY);
    } else {
      target = event.target;
    }
    
    const rowEl = target.closest(".row");
    const sch = target.closest(".sch");

    if (isMouseDown || isTouchActive) {
      isDragging.value = true;
    }
    if (sch) return;

    if (rowEl && isDragging.value && isDraggable.value == false) {
      handleRangeSelection(rowEl);
    }

    clearTimeout(enableDragTimeout.value);
  }

  function handleRangeSelection(rowEl) {
    console.log('handleRangeSelection');
    resetSelectDepths();
    selectDetphEnd.value = rowEl.dataset.depth;

    const rows = document.querySelectorAll(".row");
    const rowsDepthIndexMap = new Map();
    rows.forEach((el, index) => {
      if (el.dataset?.depth) rowsDepthIndexMap.set(el.dataset.depth, index);
    });

    const startIndex = rowsDepthIndexMap.get(selectDetphStart.value);
    const endIndex = rowsDepthIndexMap.get(selectDetphEnd.value);

    if (startIndex !== undefined && endIndex !== undefined) {
      const minIndex = Math.min(startIndex, endIndex);
      const length = Math.abs(startIndex - endIndex) + 1;
      selectDepthsRef.value.push(
        ...Array.from({ length }, (_, i) => rows[minIndex + i].dataset.depth)
      );
    }
  }

  function addEventListeners(el) {
    // Mouse events
    el.addEventListener('mousedown', handleStart);
    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseup', handleEnd);
    el.addEventListener('dragend', handleEnd);
    
    // Touch events
    el.addEventListener('touchstart', handleStart, { passive: false });
    el.addEventListener('touchmove', handleMove, { passive: false });
    el.addEventListener('touchend', handleEnd);
    el.addEventListener('touchcancel', handleEnd);
  }

  function removeEventListeners(el) {
    if (!el) return;
    // Mouse events
    el.removeEventListener('mousedown', handleStart);
    el.removeEventListener('mousemove', handleMove);
    el.removeEventListener('mouseup', handleEnd);
    el.removeEventListener('dragend', handleEnd);
    
    // Touch events
    el.removeEventListener('touchstart', handleStart);
    el.removeEventListener('touchmove', handleMove);
    el.removeEventListener('touchend', handleEnd);
    el.removeEventListener('touchcancel', handleEnd);
  }

  watch(() => elRef?.value, (newValue, oldValue) => {
    if (oldValue) {
      removeEventListeners(oldValue);
    }
    if (newValue) {
      addEventListeners(newValue);
    }
  }, { immediate: true });

  return {
    // Return any cleanup function if needed
    cleanup: () => {
      if (elRef?.value) {
        removeEventListeners(elRef.value);
      }
    }
  }
}