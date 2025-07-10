class EnhancedJSON {
    static stringify(obj) {
      const typeMarkers = {
        '[object Date]': '__DATE__',
        '[object RegExp]': '__REGEXP__',
        '[object BigInt]': '__BIGINT__',
        '[object Map]': '__MAP__',
        '[object Set]': '__SET__',
        '[object Undefined]': '__UNDEFINED__'
      };
  
      function replacer(key, value) {
        const original = this[key];
        
        // Handle special types
        if (typeof original === 'bigint') {
          return { [typeMarkers['[object BigInt]']]: original.toString() };
        }
        
        if (original instanceof RegExp) {
          return { 
            [typeMarkers['[object RegExp]']]: {
              source: original.source,
              flags: original.flags
            }
          };
        }
        
        if (original instanceof Date) {
          return { [typeMarkers['[object Date]']]: original.toISOString() };
        }
        
        if (original instanceof Map) {
          return { 
            [typeMarkers['[object Map]']]: Array.from(original.entries()) 
          };
        }
        
        if (original instanceof Set) {
          return { 
            [typeMarkers['[object Set]']]: Array.from(original.values()) 
          };
        }
        
        if (typeof original === 'undefined') {
          return { [typeMarkers['[object Undefined]']]: true };
        }
        
        return value;
      }
  
      return JSON.stringify(obj, replacer);
    }
  
    static parse(jsonStr) {
      const typeMarkers = {
        '__DATE__': (value) => new Date(value),
        '__REGEXP__': (value) => new RegExp(value.source, value.flags),
        '__BIGINT__': (value) => BigInt(value),
        '__MAP__': (value) => new Map(value),
        '__SET__': (value) => new Set(value),
        '__UNDEFINED__': () => undefined
      };
  
      function reviver(key, value) {
        if (value && typeof value === 'object') {
          const marker = Object.keys(typeMarkers).find(m => m in value);
          if (marker) {
            return typeMarkers[marker](value[marker]);
          }
        }
        return value;
      }
  
      return JSON.parse(jsonStr, reviver);
    }
  }

export default EnhancedJSON;