import {
  BadRequestException,
  GoneException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { getTodayDate } from '../common/date/get-today-date';
import { runSerializable } from '../prisma/run-serializable';
import { PrismaService } from '../prisma/prisma.service';
import {
  attemptDurationMs,
  isActiveAttempt,
  isExpiredActiveAttempt,
} from './attempt-policy';
import { calculateVerifiedScore } from './attempt-score';
import { FinishAttemptDto } from './dto/finish-attempt.dto';

@Injectable()
export class AttemptService {
  constructor(private readonly prisma: PrismaService) {}

  start(userId: number) {
    return runSerializable(this.prisma, async (tx) => {
      const now = new Date();
      const challenge = await this.findTodayChallenge(tx);
      const attempt = await this.findChallengeAttempt(tx, userId, challenge.id);
      const recoveredExpiredAttempt = isExpiredActiveAttempt(attempt, now);

      if (isActiveAttempt(attempt) && !recoveredExpiredAttempt) {
        return this.createStartResponse(
          attempt!,
          challenge.maxAttempts,
          false,
          true,
        );
      }

      if (attempt && attempt.attemptsUsed >= challenge.maxAttempts) {
        throw new BadRequestException(
          'Maximum number of attempts has been reached',
        );
      }

      const startedAttempt = await tx.attempt.upsert({
        where: {
          userId_challengeId: { userId, challengeId: challenge.id },
        },
        create: {
          userId,
          challengeId: challenge.id,
          attemptsUsed: 1,
          startedAt: now,
        },
        update: {
          attemptsUsed: { increment: 1 },
          startedAt: now,
          finishedAt: null,
        },
      });
      return this.createStartResponse(
        startedAttempt,
        challenge.maxAttempts,
        recoveredExpiredAttempt,
        false,
      );
    });
  }

  finish(userId: number, dto: FinishAttemptDto) {
    return runSerializable(this.prisma, async (tx) => {
      const now = new Date();
      const attempt = await this.findOwnedAttempt(tx, userId, dto.attemptId);

      if (!attempt) {
        throw new NotFoundException('Attempt not found');
      }

      if (!isActiveAttempt(attempt)) {
        throw new BadRequestException('No active attempt was found');
      }

      if (isExpiredActiveAttempt(attempt, now)) {
        throw new GoneException('Attempt has expired. Start a new attempt');
      }

      if (dto.typedText.length > attempt.challenge.text.length) {
        throw new BadRequestException(
          'Typed text cannot be longer than the challenge text',
        );
      }

      const elapsedMs = now.getTime() - attempt.startedAt!.getTime();
      const durationMs = Math.min(elapsedMs, attemptDurationMs());
      const completedText =
        dto.typedText.length === attempt.challenge.text.length;
      const timerExpired = elapsedMs >= attemptDurationMs();
      const scoreIsVerified = completedText || timerExpired;
      const score = scoreIsVerified
        ? calculateVerifiedScore(
            attempt.challenge.text,
            dto.typedText,
            durationMs,
          )
        : { wpm: 0, accuracy: 0 };
      const isBetterScore =
        scoreIsVerified &&
        (score.wpm > attempt.wpm ||
          (score.wpm === attempt.wpm && score.accuracy > attempt.accuracy));

      const finishedAttempt = await tx.attempt.update({
        where: { id: attempt.id },
        data: {
          finishedAt: now,
          ...(isBetterScore && score),
        },
      });

      return {
        completed: scoreIsVerified,
        completedText,
        timerExpired,
        durationMs,
        wpm: score.wpm,
        accuracy: score.accuracy,
        bestWpm: finishedAttempt.wpm,
        bestAccuracy: finishedAttempt.accuracy,
        attemptsUsed: finishedAttempt.attemptsUsed,
        attemptsRemaining:
          attempt.challenge.maxAttempts - finishedAttempt.attemptsUsed,
      };
    });
  }

  private findTodayChallenge(tx: Prisma.TransactionClient) {
    return tx.dailyChallenge
      .findUnique({
        where: { date: getTodayDate() },
        select: { id: true, maxAttempts: true },
      })
      .then((challenge) => {
        if (!challenge) {
          throw new NotFoundException('No daily challenge exists for today');
        }
        return challenge;
      });
  }

  private createStartResponse(
    attempt: { id: number; startedAt: Date | null; attemptsUsed: number },
    maxAttempts: number,
    recoveredExpiredAttempt: boolean,
    resumedActiveAttempt: boolean,
  ) {
    const durationMs = attemptDurationMs();

    return {
      attemptId: attempt.id,
      startedAt: attempt.startedAt,
      expiresAt: new Date(attempt.startedAt!.getTime() + durationMs),
      durationSeconds: durationMs / 1000,
      attemptsRemaining: maxAttempts - attempt.attemptsUsed,
      recoveredExpiredAttempt,
      resumedActiveAttempt,
    };
  }

  private findChallengeAttempt(
    tx: Prisma.TransactionClient,
    userId: number,
    challengeId: number,
  ) {
    return tx.attempt.findUnique({
      where: {
        userId_challengeId: { userId, challengeId },
      },
    });
  }

  private findOwnedAttempt(
    tx: Prisma.TransactionClient,
    userId: number,
    attemptId: number,
  ) {
    return tx.attempt.findFirst({
      where: { id: attemptId, userId },
      include: {
        challenge: {
          select: { text: true, maxAttempts: true },
        },
      },
    });
  }
}
