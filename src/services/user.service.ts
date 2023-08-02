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
import { UserDto } from '../dto/user.dto';



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
      
      return { isVerified:token.verified , isLogined:false , token:token.token};

    }catch(error){
      throw new UnauthorizedException(error);
      
    }
  }

  private _createToken(newUser,verified){
    
    if (verified) {
      const token = this.jwtService.sign({
        id:newUser.id,
        firstName:newUser.firstName,
        lastName:newUser.lastName,
        email:newUser.email,
        userName:newUser.userName,
        password:newUser.password,
        isVerified:newUser.isVerified,
        isLogined:newUser.isLogined
      })
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
      isVerified: user.isVerified,
      isLogined: user.isLogined,
    }));
  }

  
  async getSingleUser( userDto: UserDto) {
    const { token } = userDto;
    await this.checkToken(token);
    const user = await this.findUser(token);
    
    
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userName: user.userName,
      password: user.password,
      isVerfied: user.isVerified,
      isLogined: user.isLogined,
    };
  }

  private async findUser(token:string): Promise<User> {
    //Convert token to field of user
    let user;
    try {
      user = await JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    } catch (error) {
      throw new UnauthorizedException('Could convert token to user value.');
    }
    
    return user;
  }

  private async checkToken(token:string): Promise<any>{
    //Check Token is empty.
    if (!token || token=="") {
      throw new HttpException('Please enter your Token.', HttpStatus.UNAUTHORIZED)
    }

    //Check Token is expired.
    await this.isExpired(token);
  }

  private  async isExpired(token:string): Promise<any>{
    const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
    const result = Math.floor((new Date).getTime() / 1000) >= expiry;
    
    if (result) {
      throw new HttpException('Expired your token.', HttpStatus.FORBIDDEN)
    }
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
    
    user.isLogined = true;
    user.save();
    const token = this._createToken(user,true)
    
    return { isVerified:user.isVerified, isLogined:user.isLogined, token:token.token };
  }
  async logout(logoutDto: LogoutDto) {
    const { email } = logoutDto;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Invalid email!...');
    }

    if (!user.isVerified) {
      user.isVerified = true;
    }
    user.isLogined = false;
    user.save();
    return {isVerified:user.isVerified, isLogined:user.isLogined, token:"" };
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