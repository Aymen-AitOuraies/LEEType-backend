import { IsInt, Max, Min } from 'class-validator';

export class SubmitAttemptDto {
  @IsInt()
  @Min(1)
  userId: number;

  @IsInt()
  @Min(1)
  challengeId: number;

  @IsInt()
  @Min(0)
  wpm: number;

  @IsInt()
  @Min(0)
  @Max(100)
  accuracy: number;
}
