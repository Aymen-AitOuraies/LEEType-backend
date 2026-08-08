import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SubmitAttemptDto } from './dto/submit-attempt.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttemptService {
  constructor(private readonly prisma: PrismaService) {}

  submit(dto : SubmitAttemptDto)
  {
     return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: dto.userId },
        select: { id: true },
      });

      if (!user) {
        throw new NotFoundException(
          `User with ID ${dto.userId} was not found`,
        );
      }

      const challenge = await tx.dailyChallenge.findUnique({
        where: { id: dto.challengeId },
        select: {
          id: true,
          maxAttempts: true,
        },
      });

      if (!challenge) {
        throw new NotFoundException(
          `Daily challenge with ID ${dto.challengeId} was not found`,
        );
      }

      const existingAttempt = await tx.attempt.findUnique({
        where: {
          userId_challengeId: {
            userId: dto.userId,
            challengeId: dto.challengeId,
          },
        },
      });

      if (
        existingAttempt &&
        existingAttempt.attemptsUsed >= challenge.maxAttempts
      ) {
        throw new BadRequestException(
          'Maximum number of attempts has been reached',
        );
      }

      return tx.attempt.upsert({
        where: {
          userId_challengeId: {
            userId: dto.userId,
            challengeId: dto.challengeId,
          },
        },
        create: {
          userId: dto.userId,
          challengeId: dto.challengeId,
          wpm: dto.wpm,
          accuracy: dto.accuracy,
          attemptsUsed: 1,
        },
        update: {
          wpm: dto.wpm,
          accuracy: dto.accuracy,
          attemptsUsed: {
            increment: 1,
          },
        },
      });
    });
  }
}
