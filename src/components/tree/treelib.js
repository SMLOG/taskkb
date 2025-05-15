export function getRowFromDepth(root,depth){
  const stack = depth.split('.');
  stack.shift();
  let obj = root;
  let index=0;
  while(stack.length>0){
     index=stack.shift()
   obj= obj._childs[parseInt(index)];
  }
  return obj;
}

  export function moveNode(rootTree, selectDepths, selectDetphEnd, event, dragStartClientX) {
    let targetNode = getRowFromDepth(rootTree, selectDetphEnd);
    let xDiff = event.clientX - dragStartClientX;

    for (let depth of selectDepths.sort((a, b) => b.localeCompare(a))) {
      let srcNode = getRowFromDepth(rootTree, depth);
      let index = parseInt(depth.split('.').pop());

      // Remove srcNode from its current parent's children
      srcNode._p._childs.splice(index, 1);

      if (xDiff > 50) {
        // Make srcNode a child of targetNode
        if (!targetNode._childs) targetNode._childs = [];
        targetNode._childs.push(srcNode);
        srcNode._p = targetNode; // Update srcNode's parent
      } else {
        // Move srcNode next to targetNode at same level
        let parentChilds = targetNode._p._childs;
        let targetIndex = parentChilds.findIndex(node => node === targetNode);
        parentChilds.splice(targetIndex + (xDiff < 0 ? 0 : 1), 0, srcNode);
        srcNode._p = targetNode._p; // Update srcNode's parent to target's parent
      }
    }
  }