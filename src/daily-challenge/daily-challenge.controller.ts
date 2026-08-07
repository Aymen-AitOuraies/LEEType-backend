import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DailyChallengeService } from './daily-challenge.service';
import { CreateDailyChallengeDto } from './dto/create-daily-challenge.dto';
import { UpdateDailyChallengeDto } from './dto/update-daily-challenge.dto';

@Controller('daily-challenge')
export class DailyChallengeController {
  constructor(private readonly dailyChallengeService: DailyChallengeService) {}

  @Post()
  create(@Body() createDailyChallengeDto: CreateDailyChallengeDto) {
    return this.dailyChallengeService.create(createDailyChallengeDto);
  }

  @Get()
  findAll() {
    return this.dailyChallengeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dailyChallengeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDailyChallengeDto: UpdateDailyChallengeDto) {
    return this.dailyChallengeService.update(+id, updateDailyChallengeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dailyChallengeService.remove(+id);
  }
}
