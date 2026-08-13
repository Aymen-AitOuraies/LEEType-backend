import { PrismaService } from '../prisma/prisma.service';
import { DailyChallengeService } from './daily-challenge.service';

describe('DailyChallengeService', () => {
  it('is created with its Prisma dependency', () => {
    const prisma = {} as PrismaService;

    expect(new DailyChallengeService(prisma)).toBeDefined();
  });
});
