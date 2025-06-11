export function getRowFromDepth(root, depth) {
  if (depth == undefined) return;
  const stack = depth.split('.');
  stack.shift();
  let obj = root;
  let index = 0;
  while (stack.length > 0) {
    index = stack.shift()
    obj = obj._childs[parseInt(index)];
  }
  return obj;
}
export function getParentDepth(depth){
  return  depth?.replace(/\.\d+$/, '');
}
export function appendNodeNextTo(rootTree,depth,node){
      let parent  = getParentNode(rootTree, depth);
      
      let parentChilds = parent._childs;
         let index = parseInt(depth.split('.').pop());
        parentChilds.splice(index+1, 0, deepCopyObject(node));
}
export function getParentNode(rootTree, depth) {
  let parentDepth = depth.replace(/\.\d+$/, '');
  let parentNode = getRowFromDepth(rootTree, parentDepth);
  return parentNode;
}
export function deleteNode(rootTree, depth) {
  let parentNode = getParentNode(rootTree, depth);
  let index = parseInt(depth.split('.').pop());
  return parentNode._childs.splice(index, 1);

}
function deepCopyObject(obj) {
  return JSON.parse(JSON.stringify(obj));
}
export function copyNode(rootTree, depth) {
  let parentDepth = depth.replace(/\.\d+$/, '');
  let parentNode = getRowFromDepth(rootTree, parentDepth);
  let parentChilds = parentNode._childs;
  let index = parseInt(depth.split('.').pop());
  parentChilds.splice(index, 0, deepCopyObject(parentChilds[index]));

}
export function moveNode(rootTree, selectDepths, selectDetphEnd, event, dragStartClientX) {
  let targetNode = getRowFromDepth(rootTree, selectDetphEnd);
  let xDiff = event.clientX - dragStartClientX;

  for (let depth of selectDepths.sort((a, b) => b.localeCompare(a))) {
    let srcNode = deleteNode(rootTree, depth);

    if (xDiff > 50) {
      // Make srcNode a child of targetNode
      if (!targetNode._childs) targetNode._childs = [];
      targetNode._childs.push(...srcNode);
    } else {
      // Move srcNode next to targetNode at same level

      let targetParentDepth = selectDetphEnd.replace(/\.\d+$/, '');
      let targetParent = getRowFromDepth(rootTree, targetParentDepth);
      let parentChilds = targetParent._childs;
      let targetIndex = parentChilds.findIndex(node => node === targetNode);
      parentChilds.splice(targetIndex + (xDiff < 0 ? 0 : 1), 0, ...srcNode);
    }
  }
}

export function getRows(rootRow,level,depth) {
  let list = [];
  list.push({level:level,row:rootRow,depth:depth});
  if (rootRow._childs) {
    for (let i=0;i<rootRow._childs.length;i++) {
      let  row =rootRow._childs[i]
      list.push(...getRows(row,level+1,depth+"."+(i+1)));
    }
  }
  return list;
}

export function filterChildDepths(depths) {
  return depths.filter(item => {
    // Split the item into segments to check parent paths
    const segments = item.split('.');
    // Generate all possible parent paths by reducing segments
    for (let i = 1; i < segments.length; i++) {
      const parent = segments.slice(0, i).join('.');
      if (depths.includes(parent)) {
        return false; // Exclude item if its parent is in the array
      }
    }
    return true; // Include item if no parent is found
  });
}