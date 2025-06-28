import { v4 as uuidv4 } from 'uuid';
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
         let newNode  = deepCopyObject(node);
         newNode.id = uuidv4();

        parentChilds.splice(index+1, 0, newNode);
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

function relocateTreeNodes(nodesToMove, targetParent, treeRoot, isBrother = false) {
  // Validate inputs
  if (!Array.isArray(nodesToMove) || !targetParent || !treeRoot) {
    throw new Error('Invalid input: nodesToMove must be an array, and targetParent and treeRoot must be defined');
  }

  // Find the parent of targetParent if isBrother is true
  let newParent = targetParent;
  if (isBrother) {
    // Helper function to find the parent of targetParent
    function findParent(currentNode, target) {
      if (!currentNode._childs) return null;
      if (currentNode._childs.includes(target)) return currentNode;
      for (let child of currentNode._childs) {
        const found = findParent(child, target);
        if (found) return found;
      }
      return null;
    }

    newParent = findParent(treeRoot, targetParent);
    if (!newParent) {
      throw new Error('Target parent has no parent in the tree; cannot relocate as brother');
    }
  }

  // Ensure _childs property exists on newParent
  if (!newParent._childs) {
    newParent._childs = [];
  }

  // Helper function to remove a node from its parent's _childs
  function removeNodeFromParent(node, currentNode) {
    if (!currentNode._childs) return false;
    
    const index = currentNode._childs.indexOf(node);
    if (index !== -1) {
      currentNode._childs.splice(index, 1);
      return true;
    }
    
    // Recursively search in children
    return currentNode._childs.some(child => removeNodeFromParent(node, child));
  }

  // Process each node to move
  nodesToMove.forEach(node => {
    if (!node) return; // Skip invalid nodes
    
    // Remove node from its current parent's _childs
    if (node !== treeRoot) { // Avoid removing root if it's in nodesToMove
      removeNodeFromParent(node, treeRoot);
    }
    
    // Add node to newParent's _childs
    if (!newParent._childs.includes(node)) {
      newParent._childs.push(node);
    }
  });

  return treeRoot; // Return the modified tree
}

export function moveNode(rootTree, selectDepths, selectDetphEnd, event, dragStartClientX) {
  let xDiff = event.clientX - dragStartClientX;

  let nodes = selectDepths.map(depth=>getRowFromDepth(rootTree, depth));
  const targetParent = getRowFromDepth(rootTree, selectDetphEnd);
  relocateTreeNodes(nodes,targetParent,rootTree,xDiff<50)
 
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

export function loopTree(tree, callback) {
  if (tree.id) {
    callback(tree);
  }
  
  if (tree._childs && Array.isArray(tree._childs)) {
    tree._childs.forEach(child => loopTree(child, callback));
  }
}