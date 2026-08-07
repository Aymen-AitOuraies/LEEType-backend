import { Injectable, Post, UseInterceptors } from '@nestjs/common';
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
  // findUserById(id: number) {
  //   const user: User | undefined = this.users.find((user) => user.id === id);
  //   if (user === undefined) {
  //     throw new NotFoundException('User not found');
  //   }
  //   return user;
  // }
  // Patch the user's bestWpm
  // updateUserBestWpm(id: number, newWpn: number) {
  //   const user = this.users.find((user) => user.id === id);
  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }
  //   if (user) {
  //     user.bestWpm = newWpn;
  //   }
  // }

}
