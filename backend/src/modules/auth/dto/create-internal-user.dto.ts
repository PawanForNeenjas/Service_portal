import { IsEmail, IsEnum, IsString, MinLength } from "class-validator";
import { Role } from "../../../common/enums/role.enum";

export class CreateInternalUserDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsEnum(Role)
  role!: Role;
}
