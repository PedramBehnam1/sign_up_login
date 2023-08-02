import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Res,
  HttpException,
  HttpStatus,
  BadRequestException,
  Put,
} from '@nestjs/common';

import { UserService } from '../services/user.service';
import { SignUpDto } from '../dto/signup.dto';
import { LoginDto } from '../dto/login.dto';
import { LogoutDto } from '../dto/logout.dto';
import { HttpService } from '@nestjs/axios';
import { UserDto } from '../dto/user.dto';

@Controller('auth')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private httpService: HttpService,
  ) {}

  @Post('/sign_up')
  async addUser(@Body() signUpDto: SignUpDto, @Res() res) {
    try {
      const token = await this.userService.signUp(signUpDto);

      return res.status(200).json({
        isVerified: token.isVerified,
        isLogined: token.isLogined,
        token: token.token,
      });
    } catch (err) {
      await this.notFoundApi(err);
    }
  }

  @Put('/login')
  async login(@Body() loginDto: LoginDto) {
    try {
      return this.userService.login(loginDto);
    } catch (err) {
      await this.notFoundApi(err);
    }
  }

  @Put('/logout')
  async logout(@Body() logoutDto: LogoutDto) {
    try {
      return this.userService.logout(logoutDto);
    } catch (err) {
      await this.notFoundApi(err);
    }
  }

  @Get('/users')
  async getAllUsers(@Res() res) {
    const users = await this.userService.getUsers();
    try {
      return res.status(200).json({ users });
    } catch (err) {
      await this.notFoundApi(err);
    }
  }

  @Get('/users/:id')
  async getUser(@Body() getUserDto: UserDto) {
    try {
      return this.userService.getSingleUser(getUserDto);
    } catch (err) {
      await this.notFoundApi(err);
    }
  }

  private async notFoundApi(err) {
    throw new HttpException(
      {
        status: HttpStatus.UNAUTHORIZED,
        error: err.message.split(':')[0],
      },
      HttpStatus.UNAUTHORIZED,
      {
        cause: err,
      },
    );
  }
}
