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
function findTheDateInWeeks(weeks, date) {

  //return weeks[(date.w-weeks[0].w)][wi];
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0); // Set to midnight
  const dateTime = normalizedDate.getTime();
  
  // Check for valid date
  if (isNaN(dateTime)) return null; // Invalid date

  // Calculate approximate week index
  const startOfFirstWeek = new Date(weeks[0].start);
  startOfFirstWeek.setHours(0, 0, 0, 0); // Set to midnight to avoid time issues
  const startDateTime = startOfFirstWeek.getTime();
  const daysDiff = (dateTime - startDateTime) / 86400000; // msPerDay
  const estimatedWeekIndex = Math.floor(daysDiff / 7);

  // Check estimated week
  if (estimatedWeekIndex >= 0 && estimatedWeekIndex < weeks.length) {
    const week = weeks[estimatedWeekIndex];
    
    // Normalize week start and end to midnight
    const weekStart = new Date(week.start);
    weekStart.setHours(0, 0, 0, 0); // Normalize to midnight
    const weekEnd = new Date(week.end);
    weekEnd.setHours(0, 0, 0, 0); // Normalize to midnight

    if (dateTime >= weekStart.getTime() && dateTime <= weekEnd.getTime()) {
      let n = getDateAsInteger(date);
      const foundDate = week.dates.find(d => d.n === n);
      return foundDate || null; // Return null if not found
    }
  }

  return null; // No matching week found
}

export function getPreviousWeekDate(date) {
  // Create a new Date object to avoid modifying the original
  const result = new Date(date);
  // Subtract 7 days
  result.setDate(date.getDate() - 7);
  return result;
}
  export function calcDaysBetween  (weeks,d1, d2, exclusiveHolidayWeeken)  {

    let date1 = d1.n > d2.n ? findTheDateInWeeks(weeks,d1.date) : findTheDateInWeeks(weeks,d2.date);
    let date2 = d1.n > d2.n ? findTheDateInWeeks(weeks,d2.date) : findTheDateInWeeks(weeks,d1.date);
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
  export function formatDate2(date) {
  const year = date.getFullYear(); // Get last two digits of the year
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[date.getMonth()]; // Get month abbreviation
  const day = String(date.getDate()).padStart(2, '0'); // Ensure two-digit day

  return `${day}-${month}-${year}`;
}


function getDateAsInteger  (dateObj)  {
  let year = dateObj.getFullYear();
  let month = String(dateObj.getMonth() + 1).padStart(2, '0');
  let day = String(dateObj.getDate()).padStart(2, '0');
  return parseInt(`${year}${month}${day}`, 10);
};

export function generateWeeks(startDate, n) {
  const weeks = [];
  const startOfWeek = new Date(startDate);
  const startDayOfWeek = (startOfWeek.getDay() + 6) % 7; // Adjust for Monday start
  startOfWeek.setDate(startOfWeek.getDate() - startDayOfWeek);
  const msPerDay = 86400000; // Cache milliseconds per day
  const msPerWeek = msPerDay * 7; // Cache milliseconds per week

  // Cache first day of year for initial week number calculation
  const year = startOfWeek.getFullYear();
  const firstDayOfYear = new Date(year, 0, 1);
  const firstDayOffset = firstDayOfYear.getDay();

  for (let i = 0; i < n; i++) {
    const weekStartTime = startOfWeek.getTime();
    const month = startOfWeek.getMonth() + 1;

    // Approximate week number using precomputed offset
    const daysSinceYearStart = (weekStartTime - firstDayOfYear) / msPerDay;
    const weekNumber = Math.floor((daysSinceYearStart + firstDayOffset + 1) / 7) + 1;

    weeks.push({
      start: new Date(weekStartTime), // Direct reference (assumes immutability not required)
      end: new Date(weekStartTime + msPerDay * 6),
      i,
      label: formatDate(startOfWeek, { month: "short", year: "2-digit" }),
      dates: getDatesBetween(startOfWeek, new Date(weekStartTime + msPerDay * 6), i,year,month,weekNumber),
      y:year,
      w:weekNumber
    });

    startOfWeek.setTime(weekStartTime + msPerWeek); // Advance by one week
  }

  return weeks;
}

const isWeekend = (date) => {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
};


const isToday = (date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const formatDate = (date, format) => {
  return date.toLocaleDateString("en-US", { ...format });
};

const getDatesBetween = (startDate, endDate, weekIndex,year,weekNumber) => {
  const dates = [];
  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);
  let i = 0;
  while (currentDate <= lastDate) {
    let n = getDateAsInteger(currentDate);
    let holiday = holidays.filter(e => e.n == n);
    let dateWrap = {
      date: new Date(currentDate),
      n: n,
      i: weekIndex * 7 + i,
      wi:i,
      isCur: isToday(currentDate),
      isWeekend: isWeekend(currentDate),
      label: formatDate(currentDate, { day: "2-digit" }),
      h: holiday.length && holiday[0],
      y:year,w:weekNumber
    };
    i++;
    dates.push(dateWrap);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};

// Holidays data
const holidays = [
  { date: '2025-01-01', n: 20250101, name: 'New Year\'s Day' },
  { date: '2025-01-29', n: 20250129, name: 'Lunar New Year\'s Day' },
  { date: '2025-01-30', n: 20250130, name: 'Lunar New Year Holiday' },
  { date: '2025-01-31', n: 20250131, name: 'Lunar New Year Holiday' },
  { date: '2025-02-01', n: 20250201, name: 'Lunar New Year Holiday' },
  { date: '2025-02-02', n: 20250202, name: 'Lunar New Year Holiday' },
  { date: '2025-04-04', n: 20250404, name: 'Ching Ming Festival' },
  { date: '2025-04-18', n: 20250418, name: 'Good Friday' },
  { date: '2025-04-19', n: 20250419, name: 'Holy Saturday' },
  { date: '2025-04-21', n: 20250421, name: 'Easter Monday' },
  { date: '2025-05-01', n: 20250501, name: 'Labour Day' },
  { date: '2025-05-30', n: 20250530, name: 'Tuen Ng Festival' },
  { date: '2025-07-01', n: 20250701, name: 'Hong Kong Special Administrative Region Establishment Day' },
  { date: '2025-09-29', n: 20250929, name: 'National Day' },
  { date: '2025-10-01', n: 20251001, name: 'National Day Holiday' },
  { date: '2025-10-14', n: 20251014, name: 'Chung Yeung Festival' },
  { date: '2025-12-25', n: 20251225, name: 'Christmas Day' },
  { date: '2025-12-26', n: 20251226, name: 'Boxing Day' }
];


// Methods
export function isBetween (a, b, c) {
  return (a <= c && c <= b) || (b <= c && c <= a);
};