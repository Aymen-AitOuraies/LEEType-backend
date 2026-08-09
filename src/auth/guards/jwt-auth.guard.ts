import { Injectable } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Passport } from 'passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
