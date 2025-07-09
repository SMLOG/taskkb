import { ref, watch, onUnmounted } from "vue";
import { useAppStore } from "@/stores/appStore";
import { moveNode } from "@/lib/treelib";
import Sortable, { MultiDrag, Swap } from 'sortablejs';

import {
  selectDepths,
  isDraggable,
  dragStartClientX,
  selectDetphEnd,
  resetSelectDepths
} from "./context";

Sortable.mount(new MultiDrag(), new Swap());

export function useRowDrag(el, options) {
  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const sortable = ref(null);
  const startingDrag = ref(false);
  const touchStartX = ref(0);
  const touchStartY = ref(0);
  const touchElement = ref(null);

  // Common function to handle drag start
  const handleDragStartCommon = (element, clientX) => {
    if (element && isDraggable.value) {
      dragStartClientX.value = clientX;
    }
    element.classList.add('dragging');
    startingDrag.value = true;
  };

  // Common function to handle drop
  const handleDropCommon = (element, clientX) => {
    startingDrag.value = false;
    if (!element) {
      return;
    }
    
    selectDetphEnd.value = element.dataset.depth;
    if (selectDepths.indexOf(selectDetphEnd) > -1) return;
    
    const rootTree = useAppStore().treeRef;
    moveNode(rootTree, selectDepths, selectDetphEnd.value, { clientX }, dragStartClientX.value);
    
    resetSelectDepths();
    element.classList.remove('drop-highlight');
  };

  // Touch event handlers
  const handleTouchStart = (event) => {
    const touch = event.touches[0];
    touchStartX.value = touch.clientX;
    touchStartY.value = touch.clientY;
    touchElement.value = event.target.closest(".row");
    
    if (touchElement.value && isDraggable.value) {
      // Prevent scrolling when dragging
      event.preventDefault();
      handleDragStartCommon(touchElement.value, touch.clientX);
    }
  };

  const handleTouchMove = (event) => {
    if (!startingDrag.value) return;
    
    const touch = event.touches[0];
    const xDiff = touch.clientX - dragStartClientX.value;
    document.body.style.setProperty('--the-child-left', xDiff >= 50 ? '50px' : '0px');
    
    // Find the element under the touch point
    const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);
    const rowElement = elementUnderTouch?.closest('.row');
    
    if (rowElement && !rowElement.classList.contains('dragging')) {
      // Highlight potential drop target
      document.querySelectorAll('.row.drop-highlight').forEach(el => el.classList.remove('drop-highlight'));
      rowElement.classList.add('drop-highlight');
    }
    
    // Prevent scrolling when dragging
    event.preventDefault();
  };

  const handleTouchEnd = (event) => {
    if (!startingDrag.value) return;
    
    const touch = event.changedTouches[0];
    const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);
    const rowElement = elementUnderTouch?.closest('.row');
    
    if (rowElement) {
      handleDropCommon(rowElement, touch.clientX);
    }
    
    // Clean up
    document.querySelectorAll('.row.drop-highlight').forEach(el => el.classList.remove('drop-highlight'));
    document.querySelectorAll('.row.dragging').forEach(el => el.classList.remove('dragging'));
    document.body.style.setProperty('--the-child-left', '0px');
    startingDrag.value = false;
  };

  // Mouse event handlers
  const handleDragstart = (event) => {
    const interceptor = event.target.closest(".row");
    handleDragStartCommon(interceptor, event.clientX);
  };

  const handleDrop = (event) => {
    const interceptor = event.target.closest(".row");
    handleDropCommon(interceptor, event.clientX);
  };

  function handleDragenter(e) {
    if (!startingDrag.value) return;
    const target = e.target.closest('.row');
    if (target && !target.classList.contains('dragging')) {
      target.classList.add('drop-highlight');
    }
  }

  function handleDragleave(e) {
    const target = e.target.closest('.row');
    if (!target) return;
    
    const relatedTarget = e.relatedTarget;
    if (relatedTarget && target.contains(relatedTarget)) {
      return;
    }
    
    target.classList.remove('drop-highlight');
    document.body.style.setProperty('--the-child-left', '0px');
  }

  function handleDrag(e) {
    const target = e.target?.closest('.row');
    if (!target) return;
    
    let xDiff = e.clientX - dragStartClientX.value;
    document.body.style.setProperty('--the-child-left', xDiff >= 50 ? '50px' : '0px');
  }

  const addEventListeners = () => {
    if (!el?.value) return;
    
    // Mouse events
    el.value.addEventListener('dragstart', handleDragstart);
    el.value.addEventListener('dragover', handleDragOver);
    el.value.addEventListener('drag', handleDrag);
    el.value.addEventListener('dragenter', handleDragenter);
    el.value.addEventListener('dragleave', handleDragleave);
    el.value.addEventListener('drop', handleDrop);
    
    // Touch events
    el.value.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.value.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.value.addEventListener('touchend', handleTouchEnd);
    el.value.addEventListener('touchcancel', handleTouchEnd);
  };

  const removeEventListeners = () => {
    if (!el?.value) return;
    
    // Mouse events
    el.value.removeEventListener('dragstart', handleDragstart);
    el.value.removeEventListener('dragover', handleDragOver);
    el.value.removeEventListener('drag', handleDrag);
    el.value.removeEventListener('dragenter', handleDragenter);
    el.value.removeEventListener('dragleave', handleDragleave);
    el.value.removeEventListener('drop', handleDrop);
    
    // Touch events
    el.value.removeEventListener('touchstart', handleTouchStart);
    el.value.removeEventListener('touchmove', handleTouchMove);
    el.value.removeEventListener('touchend', handleTouchEnd);
    el.value.removeEventListener('touchcancel', handleTouchEnd);
  };

  watch(
    () => el?.value,
    () => {
      removeEventListeners();
      addEventListeners();
    },
    { deep: true }
  );

  onUnmounted(() => {
    removeEventListeners();
  });

  return {};
}