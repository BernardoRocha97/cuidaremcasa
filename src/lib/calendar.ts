export function buildMonthGrid(year: number, month: number): Date[][] {
  // month: 1-12
  const firstOfMonth = new Date(year, month - 1, 1);
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7; // 0 = Monday

  const start = new Date(firstOfMonth);
  start.setDate(start.getDate() - firstWeekday);

  const weeks: Date[][] = [];
  const cursor = new Date(start);

  for (let week = 0; week < 6; week++) {
    const days: Date[] = [];
    for (let day = 0; day < 7; day++) {
      days.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(days);
    if (cursor.getMonth() !== month - 1 && cursor > firstOfMonth) break;
  }

  return weeks;
}

export function dateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
