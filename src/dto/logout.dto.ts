import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LogoutDto {
  @IsNotEmpty({ message: 'Please enter email' })
  @IsEmail({}, { message: 'Please enter correct email' })
  readonly email: string;
}
