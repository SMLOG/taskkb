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