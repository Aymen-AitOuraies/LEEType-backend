import { attemptDurationMs, isExpiredActiveAttempt } from './attempt-policy';

describe('attempt policy', () => {
  beforeEach(() => {
    delete process.env.ATTEMPT_DURATION_SECONDS;
    delete process.env.ATTEMPT_SUBMISSION_GRACE_SECONDS;
  });

  it('uses a 30-second attempt by default', () => {
    expect(attemptDurationMs()).toBe(30_000);
  });

  it('allows the submission grace window before expiring an attempt', () => {
    const attempt = {
      startedAt: new Date('2026-08-12T12:00:00.000Z'),
      finishedAt: null,
    };

    expect(
      isExpiredActiveAttempt(attempt, new Date('2026-08-12T12:00:34.999Z')),
    ).toBe(false);
    expect(
      isExpiredActiveAttempt(attempt, new Date('2026-08-12T12:00:35.000Z')),
    ).toBe(true);
  });

  it('does not expire an attempt that is already finished', () => {
    const finishedAt = new Date('2026-08-12T12:00:10.000Z');

    expect(
      isExpiredActiveAttempt(
        {
          startedAt: new Date('2026-08-12T12:00:00.000Z'),
          finishedAt,
        },
        new Date('2026-08-12T12:01:00.000Z'),
      ),
    ).toBe(false);
  });
});
