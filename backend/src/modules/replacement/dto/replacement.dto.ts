import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { ReplacementStatus } from "../../../common/enums/status.enum";

export class CreateReplacementDto {
  @IsNumber()
  ticketId!: number;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateReplacementStatusDto {
  @IsEnum(ReplacementStatus)
  status!: ReplacementStatus;
}
