import {
  selectDepthsRef,
    isDrag,
    enableSelectionTimeout,
    enableDragTimeout,selectDetphStart,selectDetphEnd
  } from "./context";
  import {watch} from 'vue';

  export function useContextHandler(elRef){
    let isMouseDown = false;
    function handleMouseDown(event) {
      // ... other code ...
      const rowEl = event.target.closest(".row");
      isMouseDown=true;
      if (rowEl) {
        const { depth } = rowEl.dataset;
        const target = event.target;
    
        const schDrag = target.closest('.selectStartRef');
    
        if (!schDrag) {
          if (selectDepthsRef.value.length > 0) {
            if (selectDepthsRef.value.includes(depth)) {
              isDrag.value = true;
            } else {
              selectDepthsRef.value.length = 0;
              isDrag.value = false;
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
        }
    
        // Clear selection if not a number cell
        selectDepthsRef.value.length = 0;
        selectDetphStart.value=null;
        selectDetphEnd.value = null;
        // ... other code ...
      }
    }
    
     function handleMouseUp(event) {
      isMouseDown = false;
      clearTimeout(enableSelectionTimeout.value);
      clearTimeout(enableDragTimeout.value);
      isMouseDown=false;
      const rowEl = event.target.closest(".row");
      if (!rowEl) return;
    
      isDrag.value = false;
      // ... other code ...
    }
    
     function handleMouseMove(event) {
      const rowEl = event.target.closest(".row");
      const sch = event.target.closest(".sch");
    
      if (rowEl && isMouseDown && !isDrag.value && selectDepthsRef.value.length) {
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



    watch(()=>elRef?.value, (newValue) => {
        if(elRef?.value){
          elRef.value.addEventListener('mousedown',handleMouseDown)
          elRef.value.addEventListener('mousemove',handleMouseMove);
          elRef.value.addEventListener('handleMouseUp',handleMouseUp);
          
        
      }
    },{immediate:true});
    return {}
  }
