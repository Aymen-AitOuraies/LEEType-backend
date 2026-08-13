const DEFAULT_ATTEMPT_DURATION_SECONDS = 30;
const DEFAULT_SUBMISSION_GRACE_SECONDS = 5;
const DEFAULT_MAX_VERIFIED_WPM = 350;

type AttemptState = {
  startedAt: Date | null;
  finishedAt: Date | null;
};

export function isActiveAttempt(attempt: AttemptState | null): boolean {
  return Boolean(attempt?.startedAt && !attempt.finishedAt);
}

export function isExpiredActiveAttempt(
  attempt: AttemptState | null,
  now: Date,
): boolean {
  if (!isActiveAttempt(attempt)) {
    return false;
  }

  return (
    now.getTime() - attempt!.startedAt!.getTime() >=
    attemptDurationMs() + submissionGraceMs()
  );
}

export function attemptDurationMs(): number {
  return (
    readPositiveNumber(
      process.env.ATTEMPT_DURATION_SECONDS,
      DEFAULT_ATTEMPT_DURATION_SECONDS,
    ) * 1000
  );
}

export function maxVerifiedWpm(): number {
  return readPositiveNumber(
    process.env.MAX_VERIFIED_WPM,
    DEFAULT_MAX_VERIFIED_WPM,
  );
}

function submissionGraceMs(): number {
  return (
    readPositiveNumber(
      process.env.ATTEMPT_SUBMISSION_GRACE_SECONDS,
      DEFAULT_SUBMISSION_GRACE_SECONDS,
    ) * 1000
  );
}

function readPositiveNumber(
  value: string | undefined,
  fallback: number,
): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
