import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { LeaderboardService } from './leaderboard.service';

describe('LeaderboardService', () => {
  let service: LeaderboardService;

  const prismaMock = {
    dailyChallenge: {
      findUnique: jest.fn(),
    },
    attempt: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaderboardService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get(LeaderboardService);
  });

  it('returns attempts with sequential ranks', async () => {
    const challenge = {
      id: 1,
      date: new Date('2026-08-08'),
      text: 'Typing passage',
    };

    prismaMock.dailyChallenge.findUnique.mockResolvedValue(challenge);

    prismaMock.attempt.findMany.mockResolvedValue([
      {
        userId: 1,
        wpm: 90,
        accuracy: 95.5,
        attemptsUsed: 2,
        user: {
          id: 1,
          login: 'first',
          campus: 'Rabat',
          avatarUrl: 'first.png',
          points: 100,
        },
      },
      {
        userId: 2,
        wpm: 80,
        accuracy: 98,
        attemptsUsed: 1,
        user: {
          id: 2,
          login: 'second',
          campus: 'Khouribga',
          avatarUrl: 'second.png',
          points: 70,
        },
      },
    ]);

    const result = await service.findToday();

    expect(result.leaderboard).toHaveLength(2);
    expect(result.leaderboard[0].rank).toBe(1);
    expect(result.leaderboard[0].user.login).toBe('first');
    expect(result.leaderboard[1].rank).toBe(2);
  });

  it('requests WPM and accuracy descending order', async () => {
    prismaMock.dailyChallenge.findUnique.mockResolvedValue({
      id: 1,
      date: new Date('2026-08-08'),
      text: 'Typing passage',
    });

    prismaMock.attempt.findMany.mockResolvedValue([]);

    await service.findToday();

    expect(prismaMock.attempt.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ wpm: 'desc' }, { accuracy: 'desc' }],
      }),
    );
  });

  it('returns an empty leaderboard when there are no attempts', async () => {
    prismaMock.dailyChallenge.findUnique.mockResolvedValue({
      id: 1,
      date: new Date('2026-08-08'),
      text: 'Typing passage',
    });

    prismaMock.attempt.findMany.mockResolvedValue([]);

    const result = await service.findToday();

    expect(result.leaderboard).toEqual([]);
  });

  it('throws when today has no challenge', async () => {
    prismaMock.dailyChallenge.findUnique.mockResolvedValue(null);

    await expect(service.findToday()).rejects.toThrow(NotFoundException);
    expect(prismaMock.attempt.findMany).not.toHaveBeenCalled();
  });
});
