import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { ReturnStatus } from "../../../common/enums/status.enum";

export class CreateReturnDto {
  @IsNumber()
  replacementId!: number;

  @IsOptional()
  @IsString()
  pickupAddress?: string;
}

export class UpdateReturnStatusDto {
  @IsEnum(ReturnStatus)
  status!: ReturnStatus;
}
