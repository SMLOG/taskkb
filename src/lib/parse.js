export function jsonParse(jsonString){
    return JSON.parse(jsonString, (key, value) => {
        if (typeof value === "string"  && value.length ===24 && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*Z$/.test(value)) {
          return new Date(value);
        }
        return value;
      });
}
