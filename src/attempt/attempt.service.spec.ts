import { BadRequestException, GoneException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AttemptService } from './attempt.service';

describe('AttemptService', () => {
  const now = new Date('2026-08-12T12:00:00.000Z');
  const challenge = { id: 10, maxAttempts: 3 };
  const transactionClient = {
    dailyChallenge: {
      findUnique: jest.fn(),
    },
    attempt: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
  };
  const prismaMock = {
    $transaction: jest.fn(),
  };
  let service: AttemptService;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(now);
    jest.clearAllMocks();
    delete process.env.ATTEMPT_DURATION_SECONDS;
    delete process.env.ATTEMPT_SUBMISSION_GRACE_SECONDS;
    delete process.env.MAX_VERIFIED_WPM;

    prismaMock.$transaction.mockImplementation(
      async <T>(
        operation: (tx: typeof transactionClient) => Promise<T>,
      ): Promise<T> => operation(transactionClient),
    );
    transactionClient.dailyChallenge.findUnique.mockResolvedValue(challenge);
    service = new AttemptService(prismaMock as unknown as PrismaService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts and counts the first attempt atomically', async () => {
    transactionClient.attempt.findUnique.mockResolvedValue(null);
    transactionClient.attempt.upsert.mockResolvedValue({
      id: 20,
      startedAt: now,
      attemptsUsed: 1,
    });

    await expect(service.start(1)).resolves.toEqual({
      attemptId: 20,
      startedAt: now,
      expiresAt: new Date(now.getTime() + 30_000),
      durationSeconds: 30,
      attemptsRemaining: 2,
      recoveredExpiredAttempt: false,
      resumedActiveAttempt: false,
    });
    expect(transactionClient.attempt.upsert).toHaveBeenCalledWith({
      where: {
        userId_challengeId: { userId: 1, challengeId: challenge.id },
      },
      create: {
        userId: 1,
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
    expect(prismaMock.$transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  });

  it('resumes an active attempt without consuming another try', async () => {
    transactionClient.attempt.findUnique.mockResolvedValue({
      id: 20,
      startedAt: new Date(now.getTime() - 30_000),
      finishedAt: null,
      attemptsUsed: 3,
    });

    await expect(service.start(1)).resolves.toEqual({
      attemptId: 20,
      startedAt: new Date(now.getTime() - 30_000),
      expiresAt: now,
      durationSeconds: 30,
      attemptsRemaining: 0,
      recoveredExpiredAttempt: false,
      resumedActiveAttempt: true,
    });
    expect(transactionClient.attempt.upsert).not.toHaveBeenCalled();
  });

  it('recovers an expired attempt when another try remains', async () => {
    transactionClient.attempt.findUnique.mockResolvedValue({
      startedAt: new Date(now.getTime() - 36_000),
      finishedAt: null,
      attemptsUsed: 1,
    });
    transactionClient.attempt.upsert.mockResolvedValue({
      id: 20,
      startedAt: now,
      attemptsUsed: 2,
    });

    const result = await service.start(1);

    expect(result.recoveredExpiredAttempt).toBe(true);
    expect(result.attemptsRemaining).toBe(1);
    expect(transactionClient.attempt.upsert).toHaveBeenCalledWith({
      where: {
        userId_challengeId: { userId: 1, challengeId: challenge.id },
      },
      create: {
        userId: 1,
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
  });

  it('enforces the maximum attempt count at start', async () => {
    transactionClient.attempt.findUnique.mockResolvedValue({
      startedAt: new Date(now.getTime() - 36_000),
      finishedAt: null,
      attemptsUsed: 3,
    });

    await expect(service.start(1)).rejects.toThrow(BadRequestException);
    expect(transactionClient.attempt.upsert).not.toHaveBeenCalled();
  });

  it('calculates WPM and accuracy from server time and typed text', async () => {
    transactionClient.attempt.findFirst.mockResolvedValue({
      id: 20,
      userId: 1,
      wpm: 0,
      accuracy: 0,
      attemptsUsed: 1,
      startedAt: new Date(now.getTime() - 30_000),
      finishedAt: null,
      challenge: { text: 'hello', maxAttempts: 3 },
    });
    transactionClient.attempt.update.mockResolvedValue({
      wpm: 2,
      accuracy: 80,
      attemptsUsed: 1,
    });

    await expect(
      service.finish(1, { attemptId: 20, typedText: 'hallo' }),
    ).resolves.toMatchObject({
      completed: true,
      completedText: true,
      timerExpired: true,
      durationMs: 30_000,
      wpm: 2,
      accuracy: 80,
      attemptsUsed: 1,
      attemptsRemaining: 2,
    });
    expect(transactionClient.attempt.update).toHaveBeenCalledWith({
      where: { id: 20 },
      data: { finishedAt: now, wpm: 2, accuracy: 80 },
    });
  });

  it('finishes partial text without replacing the best score', async () => {
    transactionClient.attempt.findFirst.mockResolvedValue({
      id: 20,
      userId: 1,
      wpm: 80,
      accuracy: 95,
      attemptsUsed: 2,
      startedAt: new Date(now.getTime() - 20_000),
      finishedAt: null,
      challenge: { text: 'hello', maxAttempts: 3 },
    });
    transactionClient.attempt.update.mockResolvedValue({
      wpm: 80,
      accuracy: 95,
      attemptsUsed: 2,
    });

    const result = await service.finish(1, {
      attemptId: 20,
      typedText: 'hel',
    });

    expect(result).toMatchObject({ completed: false, wpm: 0, accuracy: 0 });
    expect(transactionClient.attempt.update).toHaveBeenCalledWith({
      where: { id: 20 },
      data: { finishedAt: now },
    });
  });

  it('scores partial text when the timer expires', async () => {
    transactionClient.attempt.findFirst.mockResolvedValue({
      id: 20,
      userId: 1,
      wpm: 0,
      accuracy: 0,
      attemptsUsed: 1,
      startedAt: new Date(now.getTime() - 30_000),
      finishedAt: null,
      challenge: { text: 'hello world', maxAttempts: 3 },
    });
    transactionClient.attempt.update.mockResolvedValue({
      wpm: 2,
      accuracy: 100,
      attemptsUsed: 1,
    });

    await expect(
      service.finish(1, { attemptId: 20, typedText: 'hello' }),
    ).resolves.toMatchObject({
      completed: true,
      completedText: false,
      timerExpired: true,
      durationMs: 30_000,
      wpm: 2,
      accuracy: 100,
    });
    expect(transactionClient.attempt.update).toHaveBeenCalledWith({
      where: { id: 20 },
      data: { finishedAt: now, wpm: 2, accuracy: 100 },
    });
  });

  it('rejects finishing an expired attempt', async () => {
    transactionClient.attempt.findFirst.mockResolvedValue({
      id: 20,
      startedAt: new Date(now.getTime() - 36_000),
      finishedAt: null,
      challenge: { text: 'hello', maxAttempts: 3 },
    });

    await expect(
      service.finish(1, { attemptId: 20, typedText: 'hello' }),
    ).rejects.toThrow(GoneException);
    expect(transactionClient.attempt.update).not.toHaveBeenCalled();
  });

  it('rejects a score above the configured verification limit', async () => {
    transactionClient.attempt.findFirst.mockResolvedValue({
      id: 20,
      wpm: 0,
      accuracy: 0,
      attemptsUsed: 1,
      startedAt: new Date(now.getTime() - 1000),
      finishedAt: null,
      challenge: {
        text: 'a'.repeat(30),
        maxAttempts: 3,
      },
    });

    await expect(
      service.finish(1, { attemptId: 20, typedText: 'a'.repeat(30) }),
    ).rejects.toThrow('Calculated WPM exceeds the maximum of 350');
  });

  it('retries serializable write conflicts', async () => {
    const conflict = new Prisma.PrismaClientKnownRequestError('conflict', {
      code: 'P2034',
      clientVersion: 'test',
    });
    prismaMock.$transaction
      .mockRejectedValueOnce(conflict)
      .mockImplementationOnce(
        async <T>(
          operation: (tx: typeof transactionClient) => Promise<T>,
        ): Promise<T> => operation(transactionClient),
      );
    transactionClient.attempt.findUnique.mockResolvedValue(null);
    transactionClient.attempt.upsert.mockResolvedValue({
      id: 20,
      startedAt: now,
      attemptsUsed: 1,
    });

    await service.start(1);

    expect(prismaMock.$transaction).toHaveBeenCalledTimes(2);
  });
});
