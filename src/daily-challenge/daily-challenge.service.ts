import { Injectable } from '@nestjs/common';
import { CreateDailyChallengeDto } from './dto/create-daily-challenge.dto';
import { UpdateDailyChallengeDto } from './dto/update-daily-challenge.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DailyChallengeService {
  constructor(private readonly prisma: PrismaService) {}

  create(createDailyChallengeDto: CreateDailyChallengeDto) {
    // return 'This action adds a new dailyChallenge';
    return this.prisma.dailyChallenge.create({
      data: {
        text: createDailyChallengeDto.text,
        date: new Date(createDailyChallengeDto.date),
        maxAttempts: createDailyChallengeDto.maxAttempts
      }
    })
  }

  findAll() {
    return `This action returns all dailyChallenge`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dailyChallenge`;
  }

  update(id: number, updateDailyChallengeDto: UpdateDailyChallengeDto) {
    return `This action updates a #${id} dailyChallenge`;
  }

  remove(id: number) {
    return `This action removes a #${id} dailyChallenge`;
  }
}
