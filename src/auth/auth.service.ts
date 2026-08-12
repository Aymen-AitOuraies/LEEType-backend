import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FortyTwoProfile } from '../types/forty-two-profile.type';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  async validate42user(
    accessToken: string,
    refreshToken: string,
    profile: FortyTwoProfile,
  ) {
    const user = await this.prisma.user.upsert({
      where: { id: Number(profile.id) },
      update: {},
      create: {
        id: Number(profile.id),
        login: profile.username,
        bestWpm: 0,
        points: 0,
        campus: '1337',
        avatarUrl: profile.profileUrl,
      },
    });
    return user;
  }

  async devSignIn() {
    const enabled =
      process.env.NODE_ENV !== 'production' &&
      process.env.ALLOW_DEV_LOGIN === 'true';

    if (!enabled) {
      throw new ForbiddenException('Development login is disabled');
    }

    const user = await this.prisma.user.upsert({
      where: { login: 'dev-user' },
      update: {},
      create: {
        login: 'dev-user',
        campus: 'local',
        avatarUrl: '',
        points: 0,
        bestWpm: 0,
      },
    });

    return this.signIn(user.id);
  }

  signIn(userId: number) {
    return {
      accessToken: this.jwtService.sign({ sub: userId }),
    };
  }
}
