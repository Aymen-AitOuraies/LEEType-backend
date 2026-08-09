import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import Strategy from 'passport-42';
import { AuthService } from '../auth/auth.service';
import { FortyTwoProfile } from '../types/forty-two-profile.type';
@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy as any, '42') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.FORTYTWO_CLIENT_ID!,
      clientSecret: process.env.FORTYTWO_CLIENT_SECRET!,
      callbackURL: process.env.FORTYTWO_CALLBACK_URL!,
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: FortyTwoProfile,
  ) {
    return this.authService.validate42user(accessToken, refreshToken, profile);
  }
}
