import { Body, Controller, Get, Post, Param, Patch } from '@nestjs/common';
import { UpdateUser } from './dto/update-user.dto';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import type { User, PrismaPromise } from '@prisma/client';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  createUser(@Body() user: CreateUserDto) {
    return this.userService.create(user);
  }

  // Get users
  @Get()
  getUsersController(): PrismaPromise<User[]> {
    return this.userService.getUsers();
  }
  // Get user by ID
  // @Get('/:id')
  // getUserById(@Param('id') id: number): User {
  //   return this.userService.findUserById(Number(id));
  // }

  // Patch user best-wpm
  // @Patch('/:id')
  // update(@Param('id') id: number, @Body('bestWo') updateUserDto: UpdateUser) {
  //   return this.userService.updateUserBestWpm(id, updateUserDto.newWpm);
  // }
}
