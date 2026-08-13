# LEEType backend

NestJS and Prisma API for daily typing challenges, authenticated attempts, and
leaderboards.

## Local setup

```bash
npm install
docker compose up -d
npx prisma migrate status
npx dotenv -e .env -- npm run start:dev
```

The API listens on `http://localhost:3000` by default. Copy `.env.example` to
`.env` and provide the local database, JWT, and 42 OAuth values before starting.

## Main routes

- `GET /daily-challenge/today` — today’s challenge
- `POST /daily-challenge` — create a dated challenge
- `GET /leaderboard/today` — today’s ranking
- `GET /auth/42` and `GET /auth/42/callback` — 42 OAuth
- `GET /auth/me` — authenticated profile
- `POST /attempts/start` — start and count an authenticated attempt
- `POST /attempts/finish` — finish or abandon an owned attempt

## Attempt lifecycle

Starting returns an `attemptId`, `startedAt`, `expiresAt`, the configured
duration, and the remaining attempt count. Finishing accepts only server-owned
attempt identity and the text typed by the user:

```json
{
  "attemptId": 42,
  "typedText": "The completed typing prompt"
}
```

The server calculates WPM and accuracy from the stored challenge text and its
own timestamps. The default test duration is 30 seconds, configured with
`ATTEMPT_DURATION_SECONDS`. A partial passage is scored only after that timer
expires; completing the whole passage can score early. Early partial finishes
close the attempt with a zero score, preventing short burst submissions.

Attempt writes use serializable transactions with retry handling. A started
attempt counts immediately. `ATTEMPT_SUBMISSION_GRACE_SECONDS` (5 seconds by
default) allows an automatic submission to arrive after the deadline; scoring
time is still capped at the configured duration. After that window, an
unfinished attempt is expired and can be recovered by starting another try.
Starting again while the same attempt is still active resumes it without
consuming another try, which lets a refreshed frontend recover its attempt ID.

Daily challenge selection uses `APP_TIME_ZONE` (`Africa/Casablanca` by default).
Scores above `MAX_VERIFIED_WPM` (350 by default) are rejected.

## Verification

```bash
npm run build
npm test -- --runInBand
npx dotenv -e .env -- npm run test:e2e -- --runInBand
npx eslint "{src,test}/**/*.ts"
npx prisma validate
npx prisma migrate status
```

The E2E route tests use mocked attempt persistence and do not write attempt data
to the configured database.

## Production

```bash
npm run build
npx dotenv -e .env -- npm run start:prod
```
