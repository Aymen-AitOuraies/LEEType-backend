import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AttemptModule } from './attempt/attempt.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { DailyChallengeModule } from './daily-challenge/daily-challenge.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    AttemptModule,
    LeaderboardModule,
    DailyChallengeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
