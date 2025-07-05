import {
    selectDepths,
    isDrag,
    enableSelectionTimeout,
    enableDragTimeout,
  } from "./context";
  
  function handleMouseDown(event) {
    // ... other code ...
    if (rowEl) {
      const { depth } = rowEl.dataset;
      const target = event.target;
  
      const schDrag = target.closest('.selectStartRef');
  
      if (!schDrag) {
        if (selectDepths.length > 0) {
          if (selectDepths.includes(depth)) {
            isDrag.value = true;
          } else {
            selectDepths.length = 0;
            isDrag.value = false;
          }
          return;
        } else {
          enableSelectionTimeout.value = setTimeout(() => {
            if (selectDepths.indexOf(depth) == -1) {
              selectDepths.push(depth);
              selectDetphStart = depth;
            }
          }, 300);
        }
      }
  
      // Clear selection if not a number cell
      selectDepths.length = 0;
      selectDetphStart = selectDetphEnd = null;
      // ... other code ...
    }
  }
  
  function handleMouseUp(event) {
    isMouseDown = false;
    clearTimeout(enableSelectionTimeout.value);
    clearTimeout(enableDragTimeout.value);
  
    const rowEl = event.target.closest(".row");
    if (!rowEl) return;
  
    isDrag.value = false;
    // ... other code ...
  }
  
  function handleMouseMove(event) {
    const rowEl = event.target.closest(".row");
    const sch = event.target.closest(".sch");
  
    if (rowEl && isMouseDown && !isDrag.value && selectDepths.length) {
      handleSelection(rowEl);
    }
  
    clearTimeout(enableDragTimeout.value);
    // ... other code ...
  }
  
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