import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'Please enter email' })
  @IsEmail({}, { message: 'Please enter correct email' })
  readonly email: string;

  @IsNotEmpty({ message: 'Please enter password' })
  @IsString()
  @MinLength(6)
  readonly password: string;
}
