import { IsInt, IsString, Min } from 'class-validator';

export class FinishAttemptDto {
  @IsInt()
  @Min(1)
  attemptId!: number;

  @IsString()
  typedText!: string;
}
