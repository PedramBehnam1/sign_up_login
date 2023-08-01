import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignUpDto {
  @IsString()
  readonly firstName: string;

  @IsString()
  readonly lastName: string;

  @IsNotEmpty({ message: 'Please enter email' })
  @IsEmail({}, { message: 'Please enter correct email' })
  readonly email: string;

  @IsNotEmpty({ message: 'Please enter username' })
  @IsEmail({}, { message: 'Please enter correct username' })
  readonly userName: string;

  @IsNotEmpty({ message: 'Please enter password' })
  @IsString()
  @MinLength(6)
  readonly password: string;
}
