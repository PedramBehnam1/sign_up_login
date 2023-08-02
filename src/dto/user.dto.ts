import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UserDto {
  @IsNotEmpty({ message: 'Please enter token.' })
  @IsString()
  readonly token: string;
}
