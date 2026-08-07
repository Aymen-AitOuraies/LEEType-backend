import { Injectable } from '@nestjs/common';
import { CreateDailyChallengeDto } from './dto/create-daily-challenge.dto';
import { UpdateDailyChallengeDto } from './dto/update-daily-challenge.dto';

@Injectable()
export class DailyChallengeService {
  create(createDailyChallengeDto: CreateDailyChallengeDto) {
    return 'This action adds a new dailyChallenge';
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
