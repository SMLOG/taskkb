export function addDatePeriod(addPeriod) {
  if (addPeriod) {
    let newPeriod = {
      start:
        addPeriod.start.n > addPeriod.end.n ? addPeriod.end : addPeriod.start,
      end:
        addPeriod.start.n < addPeriod.end.n ? addPeriod.end : addPeriod.start,
    };
    return newPeriod;
  }
}
export function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

  export function calcDaysBetween  (weeks,d1, d2, exclusiveHolidayWeeken)  {


    let date1 = d1.i > d2.i ? d1 : d2;
    let date2 = d1.i > d2.i ? d2 : d1;
    if (exclusiveHolidayWeeken) {
      let weekIndex1 = parseInt(date1.i / 7);
      let weekIndex2 = parseInt(date2.i / 7);

      let i = date2.i % 7;
      let count = 0;
      for (let w = weekIndex2; w <= weekIndex1; w++) {

        for (; i <= (w < weekIndex1 ? 6 : date1.i % 7); i++) {
          let day = weeks[w].dates[i];
          if (day.isWeekend || day.holiday) continue;
          count++;

        }
        i = 0;
      }
      return count;

    }
    return date1.i - date2.i + 1;


  }