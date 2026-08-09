import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';

import { DailyChallengeService } from './daily-challenge.service';
import { CreateDailyChallengeDto } from './dto/create-daily-challenge.dto';
import { UpdateDailyChallengeDto } from './dto/update-daily-challenge.dto';

@Controller('daily-challenge')
export class DailyChallengeController {
  constructor(
    private readonly dailyChallengeService: DailyChallengeService,
  ) {}

  @Post()
  create(@Body() createDailyChallengeDto: CreateDailyChallengeDto) {
    return this.dailyChallengeService.create(createDailyChallengeDto);
  }

  @Get('today')
  async findToday() {
    const challenge = await this.dailyChallengeService.findToday();

    if (!challenge) {
      throw new NotFoundException(
        'No daily challenge exists for today',
      );
    }

    return challenge;
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDailyChallengeDto: UpdateDailyChallengeDto,
  ) {
    return this.dailyChallengeService.update(
      +id,
      updateDailyChallengeDto,
    );
  }
}