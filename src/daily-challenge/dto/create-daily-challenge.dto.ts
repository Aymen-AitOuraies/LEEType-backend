import { IsDateString, IsInt, IsNotEmpty, IsString, Min } from "class-validator";

export class CreateDailyChallengeDto {
	@IsString()
	@IsNotEmpty()
	text!: string;

	@IsDateString()
	date!: string;

	@IsInt()
	@Min(1)
	maxAttempts!: number;
}
