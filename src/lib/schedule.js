
function getDateAsInteger  (dateObj)  {
  let year = dateObj.getFullYear();
  let month = String(dateObj.getMonth() + 1).padStart(2, '0');
  let day = String(dateObj.getDate()).padStart(2, '0');
  return parseInt(`${year}${month}${day}`, 10);
};

export function generateWeeks  (startDate, n)  {
  const weeks1 = [];
  let startOfWeek = new Date(startDate);
  const startDayOfWeek = (startOfWeek.getDay() + 6) % 7;
  startOfWeek.setDate(startOfWeek.getDate() - startDayOfWeek);

  for (let i = 0; i < n; i++) {
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    weeks1.push({
      start: new Date(startOfWeek),
      end: new Date(endOfWeek),
      i: i,
      startn: getDateAsInteger(startOfWeek),
      endn: getDateAsInteger(endOfWeek),
      label: formatDate(startOfWeek, {
        month: "short",
        year: "2-digit",
      }),
      dates: getDatesBetween(startOfWeek, endOfWeek, i)
    });

    startOfWeek.setDate(startOfWeek.getDate() + 7);
  }

  return weeks1;
};
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

const getDatesBetween = (startDate, endDate, weekIndex) => {
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
      i: weekIndex * 7 + i++,
      isCur: isToday(currentDate),
      isWeekend: isWeekend(currentDate),
      label: formatDate(currentDate, { day: "2-digit" }),
      holiday: holiday.length && holiday[0]
    };
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