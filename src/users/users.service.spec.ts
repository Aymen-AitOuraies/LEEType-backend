import { PrismaService } from '../prisma/prisma.service';
import { UserService } from './users.service';

describe('UserService', () => {
  it('is created with its Prisma dependency', () => {
    const prisma = {} as PrismaService;

    expect(new UserService(prisma)).toBeDefined();
  });
});
