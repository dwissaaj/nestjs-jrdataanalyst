import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SignInDto } from './dto/read-user.dto';
import { JwtGuard } from './guard';
import { GetUser } from './decorator';
import { User } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @HttpCode(HttpStatus.OK)
  @Post('signup')
  signUp(@Body() createUserDto: CreateUserDto) {
    console.log(createUserDto);
    return this.usersService.signUp(createUserDto);
  }

  @Post('signin')
  signIn(@Body() signInDto: SignInDto) {
    console.log(signInDto);
    return this.usersService.signIn(signInDto);
  }

  @UseGuards(JwtGuard)
  @Get('me')
  getInfo(@GetUser() user: User) {
    return user;
  }
}
