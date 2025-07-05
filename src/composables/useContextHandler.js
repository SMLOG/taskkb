import {
  selectDepthsRef,
  isDraggable,
  enableSelectionTimeout,
  enableDragTimeout, selectDetphStart, selectDetphEnd,isDragging
} from "./context";
import { watch } from 'vue';

export function useContextHandler(elRef) {
  let isMouseDown = false;
  function handleMouseDown(event) {
    // ... other code ...
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
          selectDepthsRef.value.length = 0;
          isDraggable.value = false;
        }
        return;
      } else {
        enableSelectionTimeout.value = setTimeout(() => {
          if (selectDepthsRef.value.indexOf(depth) == -1) {
            selectDepthsRef.value.push(depth);
            selectDetphStart.value = depth;
          }
        }, 300);
      }


      // Clear selection if not a number cell
      selectDepthsRef.value.length = 0;
      selectDetphStart.value = null;
      selectDetphEnd.value = null;
      // ... other code ...
    }
  }

  function handleMouseUp(event) {
    isMouseDown = false;
    clearTimeout(enableSelectionTimeout.value);
    clearTimeout(enableDragTimeout.value);
    isMouseDown = false;

    isDraggable.value = false;
    const rowEl = event.target.closest(".row");
    if (!rowEl) return;
    console.log(isDraggable.value)

    // ... other code ...
  }

  function handleMouseMove(event) {
    const rowEl = event.target.closest(".row");
    const sch = event.target.closest(".sch");

    if(isMouseDown){
        isDragging.value = true;
    }
    if(sch)return;

    if (rowEl && isMouseDown && !isDraggable.value && selectDepthsRef.value.length) {
      handleSelection(rowEl);
    }

    clearTimeout(enableDragTimeout.value);
    // ... other code ...
  }

  function handleSelection(rowEl) {
    selectDepthsRef.value.length = 0;
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



  watch(() => elRef?.value, (newValue) => {
    if (elRef?.value) {
      elRef.value.addEventListener('mousedown', handleMouseDown)
      elRef.value.addEventListener('mousemove', handleMouseMove);
      elRef.value.addEventListener('mouseup', handleMouseUp);


    }
  }, { immediate: true });
  return {}
}
