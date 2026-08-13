import { getTodayDate } from './get-today-date';

describe('getTodayDate', () => {
  const previousTimeZone = process.env.APP_TIME_ZONE;

  afterEach(() => {
    if (previousTimeZone === undefined) {
      delete process.env.APP_TIME_ZONE;
    } else {
      process.env.APP_TIME_ZONE = previousTimeZone;
    }
  });

  it('uses the Casablanca business date around UTC midnight', () => {
    process.env.APP_TIME_ZONE = 'Africa/Casablanca';

    expect(getTodayDate(new Date('2026-08-11T23:30:00.000Z'))).toEqual(
      new Date('2026-08-12T00:00:00.000Z'),
    );
  });

  it('supports an explicit application time zone', () => {
    process.env.APP_TIME_ZONE = 'America/New_York';

    expect(getTodayDate(new Date('2026-08-12T02:00:00.000Z'))).toEqual(
      new Date('2026-08-11T00:00:00.000Z'),
    );
  });
});
