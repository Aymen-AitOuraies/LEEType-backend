import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import type { User, PrismaPromise } from '@prisma/client';

// export interface User {
//   id: number;
//   login: string;
//   avatar: string;
//   bestWpm: number;
//   campus: string;
// }

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  // Post a user
  create(user: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        id: Number(user.id),
        login: user.login,
        campus: user.campus,
        avatarUrl: user.avatarUrl,
        points: Number(user.points),
      },
    });
  }

  // Get users
  getUsers(): PrismaPromise<User[]> {
    return this.prisma.user.findMany();
  }

  // Get the user by ID
  async findUserById(userId: number) {
    const user: User | null = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // Patch the user's bestWpm
  async updateUserBestWpm(userId: number, newWpm: number) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        bestWpm: newWpm,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // Patch the user's Points
  async updateUserPoints(userId: number, points: number) {
    const user: User | null = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    const result: number = user!.points + points;
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        points: result,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return updatedUser;
  }

  // Delete user by ID
  async deleteUser(userId: number) {
    return await this.prisma.user.delete({
      where: { id: userId },
    });
  }
}
