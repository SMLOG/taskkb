export function jsonToMarkdown(json, level = 0) {
    let markdown = '';
    const indent = '  '.repeat(Math.max(level-1,0));
    
    if (typeof json === 'object' && json !== null) {
      if( level>0)
      for (const [key, value] of Object.entries(json)) {
        if (typeof value === 'object' && value !== null) {
          if(key==='rows')continue;
          markdown += `${indent}- **${key}**:\n${jsonToMarkdown(value, level + 1)}`;
        } else {
          markdown += `${indent}- **${key}**: ${value}\n`;
        }
      }
      if( json.rows instanceof Array)
        for(const value of json.rows) {
          if (typeof value === 'object' && value !== null) {
             markdown += '\n\n'+jsonToMarkdown(value, level + 1)
          }
        }
      

    }
    
    return markdown.trim();
  }
  
 export function markdownToJson(markdown) {
    const lines = markdown.split('\n');
    const result = {};
    let currentKey = null;
    let nestedObj = null;
    
    for (const line of lines) {
      // Handle list items with keys
      const listItemMatch = line.match(/^- \*\*([^:]+)\*\*: (.*)/);
      if (listItemMatch) {
        const [, key, value] = listItemMatch;
        if (value.trim() === '') {
          // Start a nested object
          currentKey = key;
          nestedObj = {};
        } else {
          result[key] = value.trim();
        }
      } 
      // Handle nested items
      else if (currentKey && line.match(new RegExp(`^  - \\*\\*([^:]+)\\*\\*: (.*)`))) {
        const nestedMatch = line.match(/^  - \*\*([^:]+)\*\*: (.*)/);
        if (nestedMatch) {
          const [, nestedKey, nestedValue] = nestedMatch;
          nestedObj[nestedKey] = nestedValue.trim();
        }
      }
    }
    
    if (currentKey) {
      result[currentKey] = nestedObj;
    }
    
    return result;
  }
 