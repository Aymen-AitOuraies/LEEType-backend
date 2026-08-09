import { PartialType } from '@nestjs/mapped-types';
import { CreateDailyChallengeDto } from './create-daily-challenge.dto';

export class UpdateDailyChallengeDto extends PartialType(
  CreateDailyChallengeDto,
) {}
