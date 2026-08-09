import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AttemptModule } from './attempt/attempt.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';

@Module({
  imports: [UserModule, PrismaModule, AuthModule, AttemptModule, LeaderboardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
