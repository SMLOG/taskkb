export function jsonParse(jsonString){
    return JSON.parse(jsonString, (key, value) => {
        if (typeof value === "string"  && value.length ===24 && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*Z$/.test(value)) {
          return new Date(value);
        }
        return value;
      });
}
export const parseHash = (hash) => {
  let file = ''
  let tab = ''

  if (!hash || !hash.startsWith('#/')) {
    return { file, tab }
  }

  const pattern = /^#\/file-([^/]+)\/tab-([^/]+)(?:[/?/]+)?$/
  const match = hash.match(pattern)

  if (match) {
    file = match[1]
    tab = match[2]
  } else {
    console.warn(`Invalid hash format: "${hash}". Expected: #/file-xxx/tab-xxx[?/]`)
  }

  return { file, tab }
}