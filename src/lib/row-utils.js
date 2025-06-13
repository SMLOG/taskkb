export function loopToSetDate(row) {
  if (row._tl) {
    let peroid = row._tl;
    if (!peroid.start || !peroid.end) {
      peroid.start = peroid.end = null;
    } else {
      peroid.start.date = new Date(peroid.start.date);
      peroid.end.date = new Date(peroid.end.date);
    }
  }
  if (row._childs) {
    for (let ch of row._childs) {
      loopToSetDate(ch);
    }
  }
}

export function forEachTree(node,childsName,callback) {
  callback(node);
  let childs = row[childsName];
  if (childs) {
    for (let ch of childs) {
      forEachTree(ch,childsName,callback);
    }
  }
}
