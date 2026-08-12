import { DailyChallengeController } from './daily-challenge.controller';
import { DailyChallengeService } from './daily-challenge.service';

describe('DailyChallengeController', () => {
  it('is created with its service dependency', () => {
    const service = {} as DailyChallengeService;

    expect(new DailyChallengeController(service)).toBeDefined();
  });
});
