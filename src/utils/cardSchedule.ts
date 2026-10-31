export function previewCardSchedule(
  date: string,
  closingDay: number,
  dueDay: number,
  count: number,
  total: number,
) {
  const parsed = new Date(date + 'T00:00:00Z'),
    cents = Math.round(total * 100);
  if (
    !Number.isFinite(parsed.getTime()) ||
    !Number.isFinite(cents) ||
    !Number.isInteger(count) ||
    count < 1 ||
    count > 36 ||
    cents < count
  )
    return [];
  const day = (y: number, m: number, d: number) =>
      new Date(
        Date.UTC(
          y,
          m,
          Math.min(d, new Date(Date.UTC(y, m + 1, 0)).getUTCDate()),
        ),
      ),
    y = parsed.getUTCFullYear(),
    m = parsed.getUTCMonth(),
    first = m + (parsed >= day(y, m, closingDay) ? 1 : 0),
    base = Math.floor(cents / count),
    extra = cents % count;
  return Array.from({ length: count }, (_, index) => {
    const anchor = new Date(Date.UTC(y, first + index, 1)),
      year = anchor.getUTCFullYear(),
      month = anchor.getUTCMonth();
    return {
      number: index + 1,
      amount: (base + (index < extra ? 1 : 0)) / 100,
      closingDate: day(year, month, closingDay).toISOString(),
      dueDate: day(
        year,
        month + (dueDay <= closingDay ? 1 : 0),
        dueDay,
      ).toISOString(),
    };
  });
}
