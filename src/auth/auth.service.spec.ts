import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('is created with its Prisma and JWT dependencies', () => {
    const prisma = {} as PrismaService;
    const jwt = {} as JwtService;

    expect(new AuthService(prisma, jwt)).toBeDefined();
  });
});
