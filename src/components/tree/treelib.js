export function getRowFromDepth(root,depth){
  if(depth==undefined)return;
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

  export function deleteNode(rootTree,depth){
          let parentDepth = depth.replace(/\.\d+$/,'');
        let parentNode = getRowFromDepth(rootTree, parentDepth);
        if(parentNode==undefined)return;
         let index = parseInt(depth.split('.').pop());
        return parentNode._childs.splice(index, 1);

  }
  function deepCopyObject(obj){
  return JSON.parse(JSON.stringify(obj));
}
  export function copyNode(rootTree,depth){
              let parentDepth = depth.replace(/\.\d+$/,'');
        let parentNode = getRowFromDepth(rootTree, parentDepth);
        let parentChilds = parentNode._childs;
         let index = parseInt(depth.split('.').pop());
          parentChilds.splice(index, 0, deepCopyObject(parentChilds[index]));

  }
  export function moveNode(rootTree, selectDepths, selectDetphEnd, event, dragStartClientX) {
    console.log('movenode')
    let targetNode = getRowFromDepth(rootTree, selectDetphEnd);
    let xDiff = event.clientX - dragStartClientX;

    for (let depth of selectDepths.sort((a, b) => b.localeCompare(a))) {
      let srcNode =  deleteNode(rootTree,depth);

      if (xDiff > 50) {
        // Make srcNode a child of targetNode
        if (!targetNode._childs) targetNode._childs = [];
        targetNode._childs.push(...srcNode);
      } else {
        // Move srcNode next to targetNode at same level
        
              let targetParentDepth = selectDetphEnd.replace(/\.\d+$/,'');
        let targetParent = getRowFromDepth(rootTree, targetParentDepth);
        let parentChilds = targetParent._childs;
        let targetIndex = parentChilds.findIndex(node => node === targetNode);
        parentChilds.splice(targetIndex + (xDiff < 0 ? 0 : 1), 0, ...srcNode);
      }
    }
  }

  export function getRows(rootRow) {
  let list = [];

  list.push(rootRow);
  if (rootRow._childs) {
    for (let row of rootRow._childs) {
      list.push(...getRows(row));
    }
  }
  return list;
}