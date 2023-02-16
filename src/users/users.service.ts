import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { SignInDto } from './dto/read-user.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async signUp(createUserDto: CreateUserDto) {
    const hash = await argon.hash(createUserDto.password);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: createUserDto.email,
          hash: hash,
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
        },
      });
      return this.signToken(user.id, user.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Email Have been used');
        }
      }
    }
  }

  async signIn(signInDto: SignInDto) {
    console.log(signInDto.email);
    const user = await this.prisma.user.findUnique({
      where: {
        email: signInDto.email,
      },
    });
    console.log('work2');
    if (!user) throw new ForbiddenException('No account detected');

    const passMatched = await argon.verify(user.hash, signInDto.password);

    if (!passMatched) {
      throw new ForbiddenException('Wrong Password');
    }
    return this.signToken(user.id, user.email);
  }
  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const secret = this.config.get('JWT_SECERET');
    const payload = {
      sub: userId,
      email,
    };
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '10m',
      secret: secret,
    });
    return {
      access_token: token,
    };
  }
}
