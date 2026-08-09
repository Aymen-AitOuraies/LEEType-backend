import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FortyTwoAuthGuard } from './guards/forty-two-auth.guard';
import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserService } from '../users/users.service';
type AuthenticatedRequest = {
  user: {
    id: number;
  };
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Get('42')
  @UseGuards(FortyTwoAuthGuard)
  login() {}

  @Get('42/callback')
  @UseGuards(FortyTwoAuthGuard)
  callback(@Req() req: AuthenticatedRequest) {
    if (!req.user) {
      throw new UnauthorizedException('Authentication failed');
    }
    // In a real app you'd issue a JWT or set a session here.
    return this.authService.signIn(Number(req.user.id));
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: AuthenticatedRequest) {
    return this.userService.findUserById(req.user.id);
  }
}
