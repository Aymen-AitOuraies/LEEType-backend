import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AttemptService } from './attempt.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FinishAttemptDto } from './dto/finish-attempt.dto';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request.type';

@Controller('attempts')
@UseGuards(JwtAuthGuard)
export class AttemptController {
  constructor(private readonly attemptService: AttemptService) {}

  @Post('start')
  start(@Req() req: AuthenticatedRequest) {
    return this.attemptService.start(req.user.id);
  }

  @Post('finish')
  finish(@Req() req: AuthenticatedRequest, @Body() dto: FinishAttemptDto) {
    return this.attemptService.finish(req.user.id, dto);
  }
}
