export function jsonParse(jsonString){
    return JSON.parse(jsonString, (key, value) => {
        if (typeof value === "string"  && value.length ===24 && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*Z$/.test(value)) {
          return new Date(value);
        }
        return value;
      });
}
export   const parseHash = (hash) => {
  let file = ''
  let tab = ''
  let storageType = ''

  if (!hash || !hash.includes('#/')) {
    return { file, tab }
  }

  const pattern = /\/([A-Z])-([^/]+)\/([^/?]+)/
  const match = hash.match(pattern)

  if (match) {
    storageType = match[1]
    file = decodeURIComponent(match[2])
    tab = match[3]
    console.log(storageType,file,tab)
  } else if (hash) {
    console.warn(`Invalid hash format: "${hash}". Expected: contains #/file-xxx/tab-xxx`)
  }

  return { file, tab,storageType }
}

export function deepClone(obj) {
  return jsonParse(JSON.stringify(obj));
}

export function downloadJSON(jsonData, filename = 'data.json') {
  const jsonString = JSON.stringify(jsonData);
  const encodedJsonString = encodeURIComponent(jsonString);
  const downloadLink = document.createElement("a");
  downloadLink.setAttribute("href", "data:application/json;charset=utf-8," + encodedJsonString);
  downloadLink.setAttribute("download", filename);
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}