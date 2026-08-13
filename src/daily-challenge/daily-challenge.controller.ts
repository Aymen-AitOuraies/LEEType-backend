import { Controller, Get, Post, Body, NotFoundException } from '@nestjs/common';

import { DailyChallengeService } from './daily-challenge.service';
import { CreateDailyChallengeDto } from './dto/create-daily-challenge.dto';

@Controller('daily-challenge')
export class DailyChallengeController {
  constructor(private readonly dailyChallengeService: DailyChallengeService) {}

  @Post()
  create(@Body() createDailyChallengeDto: CreateDailyChallengeDto) {
    return this.dailyChallengeService.create(createDailyChallengeDto);
  }

  @Get('today')
  async findToday() {
    const challenge = await this.dailyChallengeService.findToday();

    if (!challenge) {
      throw new NotFoundException('No daily challenge exists for today');
    }

    return challenge;
  }
}
