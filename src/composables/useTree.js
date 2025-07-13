import { useAppStore } from "@/stores/appStore";
import { v4 as uuidv4 } from 'uuid';

import {
  getRowFromDepth,
  deleteNodes,
  copyNode,
  getRows,
  appendNodeNextTo,
  filterChildDepths,
} from "@/lib/treelib";
import {
  formatDate2,
} from "@/lib/schedule";
import {
  selectDepths,

} from "./context";


export function useTree() {

  const insertNode = (node) => {
    let rootObj = useAppStore().treeRef;
    node.id = uuidv4();
    let parentNode = rootObj;
    if (selectDepths.length) {
      let lastDepth = selectDepths[selectDepths.length - 1];
      selectDepths.forEach(() => appendNodeNextTo(rootObj, lastDepth, node));
    } else {
      if (!parentNode.rows) parentNode.rows = [];
      parentNode.rows.push(node);
    }
  };
  const delSelectedNode = () => {
    let rootObj = useAppStore().treeRef;
    deleteNodes(rootObj, selectDepths);
    selectDepths.length = 0;
  };
  const copySelectedNode = () => {
    let rootObj = useAppStore().treeRef;

    if (selectDepths.length == 1) {
      copyNode(rootObj, selectDepths[0]);
    }
  };

  function exportCSV(config, onlyText = false, colSeperator = ",") {
    let rootObj = useAppStore().treeRef;



    let items = [];

    let j = 0;
    if (selectDepths.length) {

      for (let depth of filterChildDepths(selectDepths)) {
        let item = getRowFromDepth(rootObj, depth);
        items.push(...getRows(item, 0, ++j));
      }
    } else {

      for (let item of rootObj.rows) {
        items.push(...getRows(item, 0, ++j));
      }

    }

    let cols = config.cols.filter((col) => col.show && col.cp != "ColSeq");
    let rows = items.map((item, rowIndex) => {
      let row = item.row;
      return cols
        .map(
          (col, i) =>
            (i == 0 ? "  ".repeat(item.level) + item.depth + "." + " " : "") +
            (row["c" + col.fn] ? row["c" + col.fn] : "")
        )
        .concat(config.showSch ? [
          row._tl ? formatDate2(row._tl.start.date) : "",
          row._tl ? formatDate2(row._tl.end.date) : "",
        ] : []);
    });
    let headers = cols.map((c) => c.name);
    if (config.showSch) headers = headers.concat(["Start Date", "End Date"]);
    rows.unshift(headers);

    let text = rows
      .map((row) =>
        row
          .map(
            (d) =>
              `${(d &&
                d
                  .replace(/"/g, '""')
                  .replace(/<.*?>/g, "")
                  .replace(/&lt;/g, "<")
                  .replace(/&gt;/g, ">")
                  .replace(/&amp;/g, "&")
                  .replace(/&nbsp;/g, " ")
                  .replace(/\\n/g, "\\n")) ||
              ""
              }`
          )
          .map((d, i) => (onlyText ? `\`${d}\`` : `"${d}"`))
          .join(colSeperator)
      )
      .join("\n");
    return text;
  }



  return {
    insertNode,
    delSelectedNode,
    copySelectedNode,
    exportCSV,
  };
}
