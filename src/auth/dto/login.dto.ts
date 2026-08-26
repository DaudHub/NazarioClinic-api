import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  user!: string;
  @IsString()
  password!: string;
}