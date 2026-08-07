import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Patch,
  ParseIntPipe,
  Delete,
} from "@nestjs/common";
import { UserService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import type { User, PrismaPromise } from "@prisma/client";
import { UpdateWpmDto } from "./dto/update-wpm.dto";
import { UpdatePointsDto } from "./dto/update-points.dto";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Create user
  @Post()
  createUser(@Body() user: CreateUserDto) {
    return this.userService.create(user);
  }

  // Get all users
  @Get()
  getUsersController(): PrismaPromise<User[]> {
    return this.userService.getUsers();
  }

  // Get user by ID
  @Get("/:id")
  getUserById(@Param("id") id: number) {
    return this.userService.findUserById(Number(id));
  }

  // Patch user best-wpm
  @Patch("/bestWpm/:id")
  updateWpm(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateWpmDto: UpdateWpmDto,
  ) {
    return this.userService.updateUserBestWpm(id, updateWpmDto.bestWpm);
  }

  // Patch user best-wpm
  @Patch("/points/:id")
  updatePoints(
    @Param("id", ParseIntPipe) id: number,
    @Body() updatePointsDto: UpdatePointsDto,
  ) {
    return this.userService.updateUserPoints(id, updatePointsDto.points);
  }
}
