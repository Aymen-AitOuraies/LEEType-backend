import { ConflictException, Injectable } from '@nestjs/common';
import { CreateDailyChallengeDto } from './dto/create-daily-challenge.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class DailyChallengeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDailyChallengeDto: CreateDailyChallengeDto) {
    // return 'This action adds a new dailyChallenge';
    try {
      return await this.prisma.dailyChallenge.create({
        data: {
          text: createDailyChallengeDto.text,
          date: new Date(createDailyChallengeDto.date),
          maxAttempts: createDailyChallengeDto.maxAttempts,
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code == 'P2002'
      )
        throw new ConflictException(
          'A daily challenge already exists for this date',
        );
      throw error;
    }
  }

  findToday() {
    const today = new Date();

    today.setUTCHours(0, 0, 0, 0);

    return this.prisma.dailyChallenge.findUnique({
      where: {
        date: today,
      },
    });
  }
}
