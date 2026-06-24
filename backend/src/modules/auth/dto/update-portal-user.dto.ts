import { IsEnum, IsString, MinLength } from "class-validator";
import { PortalUserStatus } from "../../../common/enums/portal-user-status.enum";

export class UpdatePortalUserStatusDto {
  @IsEnum(PortalUserStatus)
  status!: PortalUserStatus;
}

export class ResetPortalUserPasswordDto {
  @IsString()
  @MinLength(8)
  password!: string;
}
