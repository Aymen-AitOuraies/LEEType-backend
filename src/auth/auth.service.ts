import { Injectable } from '@nestjs/common';
import { Profile } from 'passport';
import { PrismaService } from '../prisma/prisma.service';
import { FortyTwoProfile } from '../types/forty-two-profile.type';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
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

  signIn(userId: number) {
    const tokenPayload = {
      sub: userId,
    };
    const accessToken = this.jwtService.sign(tokenPayload);
    return { accessToken };
  }
}
