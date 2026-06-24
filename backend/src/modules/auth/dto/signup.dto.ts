import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class SignupDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(6)
  phone!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(1)
  customerName!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
