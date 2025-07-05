import { ref,watch } from "vue";
import { useAppStore } from "@/stores/appStore";
import { moveNode } from "@/lib/treelib";
import Sortable, { MultiDrag, Swap } from 'sortablejs';

import {
  selectDepths,
  isDraggable,
  dragStartClientX,
  selectDetphEnd,resetSelectDepths
} from "./context";

Sortable.mount(new MultiDrag(), new Swap());

export function useRowDrag(el,options) {
  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };
const sortable = ref(null);
  watch(
    () => el?.value,
    () => {
      if (!el?.value) return
      el.value.addEventListener('dragstart', handleDragstart);
      el.value.addEventListener('dragover', handleDragOver);
      el.value.addEventListener('drag', handleDrag);
      el.value.addEventListener('dragenter', handleDragenter);
      el.value.addEventListener('dragleave', handleDragleave);
      el.value.addEventListener('drop', handleDrop);

     // sortable.value = new Sortable(el.value,options);
    },
    { deep: true }
  );

 /* watch(
    () => selectDepths?.length,
    () => {
      if (!sortable?.value) return
      sortable.value.option("disabled", !selectDepths?.length);
      setTimeout(()=>document.querySelector('.selected')&&Array.from(document.querySelectorAll('.selected')).map(e=>Sortable.utils.select(e)),10);
      console.log( selectDepths?.value?.length,sortable.value.option("disabled"))
    },
    { deep: true }
  );*/


  const handleDragstart = (event) => {
    let interceptor = event.target.closest(".row");
    if (interceptor && isDraggable.value) {
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
    
    resetSelectDepths();
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
  };
}