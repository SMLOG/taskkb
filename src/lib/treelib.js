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

function removeChildNodes(tree, nodesArray) {
  // Input validation
  if (!tree || typeof tree !== 'object' || !Array.isArray(tree._childs)) {
      throw new TypeError('Tree must be an object with a _childs array');
  }
  if (!Array.isArray(nodesArray)) {
      throw new TypeError('nodesArray must be an array');
  }

  // Create a set of nodes to remove for efficient lookup
  const nodesToRemove = new Set(nodesArray.filter(node => node && typeof node === 'object'));
  let removedCount = 0;

  // Map to store parent references
  const parentMap = new Map();

  // Helper function to find parents by traversing the tree
  function findParents(currentNode, parent = null) {
      if (!currentNode || !Array.isArray(currentNode._childs)) return;

      // Map each child to its parent
      currentNode._childs.forEach(child => {
          if (nodesToRemove.has(child)) {
              parentMap.set(child, currentNode);
          }
          findParents(child, currentNode);
      });
  }

  // Find parents for all nodes in nodesToRemove
  findParents(tree);

  // Remove nodes from their parents' _childs arrays
  for (const node of nodesToRemove) {
      const parent = parentMap.get(node);
      if (parent && Array.isArray(parent._childs)) {
          const initialLength = parent._childs.length;
          parent._childs = parent._childs.filter(child => child !== node);
          removedCount += initialLength - parent._childs.length;
      }
  }

  return removedCount;
}

export function deleteNodes(rootTree,depts){
  const nodes = depts.map(depth=>getRowFromDepth(rootTree, depth));

  return removeChildNodes(rootTree,nodes);
}



function relocateTreeNodes(nodesToMove, targetParent, treeRoot, isBrother = false) {
  // Validate inputs
  if (!Array.isArray(nodesToMove) || !targetParent || !treeRoot) {
    throw new Error('Invalid input: nodesToMove must be an array, and targetParent and treeRoot must be defined');
  }

  // Find the parent of targetParent if isBrother is true
  let newParent = targetParent;
  let targetIndex = -1;
  if (isBrother) {
    // Helper function to find the parent of targetParent and its index
    function findParentAndIndex(currentNode, target) {
      if (!currentNode._childs) return null;
      const index = currentNode._childs.indexOf(target);
      if (index !== -1) return { parent: currentNode, index };
      for (let child of currentNode._childs) {
        const found = findParentAndIndex(child, target);
        if (found) return found;
      }
      return null;
    }

    const result = findParentAndIndex(treeRoot, targetParent);
    if (!result) {
      throw new Error('Target parent has no parent in the tree; cannot relocate as brother');
    }
    newParent = result.parent;
    targetIndex = result.index;
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
      if (isBrother && targetIndex !== -1) {
        // Insert after targetParent
        newParent._childs.splice(targetIndex + 1, 0, node);
        targetIndex++; // Increment index to maintain order for subsequent insertions
      } else {
        // Add as child or at end if not a brother
        newParent._childs.push(node);
      }
    }
  });

  return treeRoot; // Return the modified tree
}

export function moveNode(rootTree, selectDepths, selectDetphEnd, event, dragStartClientX) {
  let xDiff = event.clientX - dragStartClientX;

  let nodes = selectDepths.filter(depth=>selectDetphEnd!==depth && selectDetphEnd.indexOf(depth)!=0).map(depth=>getRowFromDepth(rootTree, depth));
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

export function treeToList(tree) {
  const result = [];
  
  function traverse(node) {
      // Add current node to result
      result.push(node);
      
      // If node has _childs and it's an array, traverse each child
      if (node._childs && Array.isArray(node._childs)) {
          node._childs.forEach(child => traverse(child));
      }
  }
  
  // Handle case where input is a single node or an array of nodes
  if (Array.isArray(tree)) {
      tree.forEach(node => traverse(node));
  } else if (tree) {
      traverse(tree);
  }
  
  return result;
}