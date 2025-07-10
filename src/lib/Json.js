import EnhancedJSON from './EnhancedJSON';


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
  return EnhancedJSON.parse(EnhancedJSON.stringify(obj));
}

export function downloadJSON(jsonData, filename = 'data.json') {
  const jsonString = EnhancedJSON.stringify(jsonData);
  const encodedJsonString = encodeURIComponent(jsonString);
  const downloadLink = document.createElement("a");
  downloadLink.setAttribute("href", "data:application/json;charset=utf-8," + encodedJsonString);
  downloadLink.setAttribute("download", filename);
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}
export function stringify(obj){
  return EnhancedJSON.stringify(obj);
}
export function parse(jsonString){
  return  EnhancedJSON.parse(jsonString);
}
export default {parse,stringify,deepClone};