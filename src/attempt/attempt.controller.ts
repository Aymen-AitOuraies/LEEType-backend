import { Controller, Post, Body } from '@nestjs/common';
import { AttemptService } from './attempt.service';
import { SubmitAttemptDto } from './dto/submit-attempt.dto';

@Controller('attempts')
export class AttemptController {
  constructor(private readonly attemptService: AttemptService) {}

  @Post()
  submit(@Body() submitAttemptDto: SubmitAttemptDto) {
    return this.attemptService.submit(submitAttemptDto);
  }
}
