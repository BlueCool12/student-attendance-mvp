export function calculatePassedDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  let passedDaysInRange = 0;
  const tempDate = new Date(start);
  while (tempDate <= end) {
    if (tempDate <= today) passedDaysInRange++;
    tempDate.setDate(tempDate.getDate() + 1);
  }
  return passedDaysInRange === 0 ? 1 : passedDaysInRange;
}

export function getDatesInRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  const curr = new Date(start);
  while (curr <= end) {
    dates.push(curr.toISOString().split('T')[0]);
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
}
