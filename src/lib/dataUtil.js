export function formatDateToYyyyMMdd(date) {
    if (!(date instanceof Date) || isNaN(date)) {
        return null; // or throw new Error("Invalid date");
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}
export function dateFromYYYYMMDD(yyyymmdd) {
    const year = yyyymmdd.substring(0, 4);
    const month = yyyymmdd.substring(4, 6);
    const day = yyyymmdd.substring(6, 8);
    
    return new Date(year, month - 1, day);
  }
  
