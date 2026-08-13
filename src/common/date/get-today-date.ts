const DEFAULT_TIME_ZONE = 'Africa/Casablanca';

export function getTodayDate(now = new Date()): Date {
  const timeZone = process.env.APP_TIME_ZONE ?? DEFAULT_TIME_ZONE;
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return new Date(
    Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day)),
  );
}
