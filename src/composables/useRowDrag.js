import { ref } from "vue";
import { useAppStore } from "@/stores/appStore";
import { moveNode } from "@/lib/treelib";

import {
  selectDepths,
  isDrag,
  dragStartClientX,
  selectDetphEnd
} from "./context";

export function useRowDrag() {
  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDragstart = (event) => {
    let interceptor = event.target.closest(".row");
    if (interceptor && isDrag.value) {
      dragStartClientX.value = event.clientX;
    }
    interceptor.classList.add('dragging');
  };

  const handleDrop = (event) => {
    let interceptor = event.target.closest(".row");
    if (!interceptor) {
      return;
    }
    selectDetphEnd.value  = interceptor.dataset.depth;
    if (selectDepths.indexOf(selectDetphEnd) > -1) return;
    const rootTree = useAppStore().treeRef;
    moveNode(rootTree, selectDepths , selectDetphEnd.value , event, dragStartClientX.value );
    selectDepths.length = 0;
    isDrag.value = false;
    interceptor.classList.remove('drop-highlight');
  };

  function handleDragenter(e) {
    const target = e.target.closest('.row');
    if (!target) return;
    const { depth } = target.dataset;
    console.log('handledragenter', depth);
    if (target && !target.classList.contains('dragging')) {
      target.classList.add('drop-highlight');
    }
  }

  function handleDragleave(e) {
    const target = e.target.closest('.row');
    if (!target) return;
    const { depth } = target.dataset;
    console.log('handleDragleave', depth);
    const relatedTarget = e.relatedTarget;
    const element = document.body;
    let xDiff = e.clientX - dragStartClientX;
    console.log(xDiff);
    element.style.setProperty('--the-child-left', xDiff >= 50 ? '50px' : '0px');
    if (relatedTarget && target.contains(relatedTarget)) {
      return;
    }
    target.classList.remove('drop-highlight');
    element.style.setProperty('--the-child-left', '0px');
  }

  function handleDrag(e) {
    const target = e.target?.closest('.row');
    if (!target) return;
    const { depth } = target.dataset;
    console.log('handleDragleave', depth);
    const element = document.body;
    let xDiff = e.clientX - dragStartClientX.value;
    console.log(xDiff);
    element.style.setProperty('--the-child-left', xDiff >= 50 ? '50px' : '0px');
  }

  return {
    handleDragstart,
    handleDragOver,
    handleDragenter,
    handleDragleave,
    handleDrag,
    handleDrop,
    isDrag,
  };
}