/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/models/user.model';
import * as bcrypt from 'bcryptjs'
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from '../dto/signup.dto';
import { LoginDto } from '../dto/login.dto';
import { LogoutDto } from '../dto/logout.dto';



@Injectable()
export class UserService {
  private users: User[] = [];

  constructor(@InjectModel('User') private readonly userModel: Model<User>, private jwtService: JwtService) {}


  async signUp(signUpDto: SignUpDto){
    try{
      const { firstName, lastName, email, userName, password } = signUpDto;

      
      //hash password
      const hashedPassword = await bcrypt.hash(password,10)
  
      //get all users
      const users = this.userModel.find().exec();
      
      const newUser = new this.userModel({
        id:(await users).length+1,
        firstName,
        lastName,
        email,
        userName,
        password:hashedPassword
      });
      
      
      await newUser.save();
      
      const token = this._createToken(newUser,false)
      
      return { verified:token.verified , token:token.token};

    }catch(error){
      throw new UnauthorizedException(error);
      
    }
  }

  private _createToken({email},verified){
    const token = this.jwtService.sign({email})
    if (verified) {
      return({verified,token})
    }else{
      return({verified,token:""})
    }
  }


    
  async getUsers() {
    const users = await this.userModel.find().exec();
    return users.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName,
      password: user.password,
    }));
  }

  
  async getSingleUser(userId: string) {
    const user = await this.findUser(userId);
    
    
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userName: user.userName,
      password: user.password,
      isVerfied: user.isVerified
    };
  }

  private async findUser(id: string): Promise<User> {
    let user;
    try {
        user = await this.userModel.findOne({id}).exec();
    } catch (error) {
      throw new NotFoundException('Could not find user.');
    }
    if (!user) {
      throw new NotFoundException('Could not find user.');
    }
    return user;
  }

  
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Invalid email!...');
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid password!...');
    }
    user.isVerified = true;
    user.save();
    const token = this._createToken(user,true)
    
    return { token };
  }
  async logout(logoutDto: LogoutDto) {
    const { email } = logoutDto;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Invalid email!...');
    }

    user.isVerified = false;
    user.save();
    return { token:"", isVerified:false };
  }

  
  async validateUser({ email }) {
    const user = this.findByEmail(email)
    if (!user) {
      throw new HttpException('Invalid Token.', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }
  private async findByEmail(email){

    return await this.userModel.find(email).exec(); 
  }
  
} 