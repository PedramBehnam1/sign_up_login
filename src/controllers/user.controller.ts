import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Res,
  HttpStatus,
  BadRequestException,
  Put,
} from '@nestjs/common';

import { UserService } from '../services/user.service';
import { SignUpDto } from '../dto/signup.dto';
import { LoginDto } from '../dto/login.dto';
import { LogoutDto } from '../dto/logout.dto';
import { HttpService } from '@nestjs/axios';

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

      return res.status(200).json({ token: token });
    } catch (error) {
      return res.status(400).json(error);
    }
  }

  @Put('/login')
  login(@Body() loginDto: LoginDto) {
    return this.userService.login(loginDto);
  }

  @Put('/logout')
  logout(@Body() logoutDto: LogoutDto) {
    return this.userService.logout(logoutDto);
  }

  @Get('/users')
  async getAllUsers(@Res() res) {
    const users = await this.userService.getUsers();
    return res.status(200).json({ users });
  }

  @Get('/users/:id')
  getUser(@Param('id') userId: string) {
    return this.userService.getSingleUser(userId);
  }
}
