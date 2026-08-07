import { Test, TestingModule } from '@nestjs/testing';
import { DailyChallengeController } from './daily-challenge.controller';
import { DailyChallengeService } from './daily-challenge.service';

describe('DailyChallengeController', () => {
  let controller: DailyChallengeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DailyChallengeController],
      providers: [DailyChallengeService],
    }).compile();

    controller = module.get<DailyChallengeController>(DailyChallengeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
