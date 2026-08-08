import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async findToday() {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const challenge = await this.prisma.dailyChallenge.findUnique({
      where: { date: today },
      select: {
        id: true,
        date: true,
        text: true,
      },
    });

    if (!challenge)
      throw new NotFoundException('No daily challenge exists for today');

    const attempts = await this.prisma.attempt.findMany({
      where: {
        challengeId: challenge.id,
      },
      orderBy: [{ wpm: 'desc' }, { accuracy: 'desc' }],
      select: {
        userId: true,
        wpm: true,
        accuracy: true,
        attemptsUsed: true,
        user: {
          select: {
            id: true,
            login: true,
            campus: true,
            avatarUrl: true,
            points: true,
          },
        },
      },
    });
    return {
      challenge,
      leaderboard: attempts.map((attempt, index) => ({
        rank: index + 1,
        user: attempt.user,
        wpm: attempt.wpm,
        accuracy: attempt.accuracy,
        attemptsUsed: attempt.attemptsUsed,
      })),
    };
  }
}
