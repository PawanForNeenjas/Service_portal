import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { TicketStatus } from "../../../common/enums/status.enum";

export enum TicketPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export class CreateTicketDto {
  @IsString()
  @MinLength(1)
  productId!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  customerName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  volt?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  amp?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  rating?: string;

  @IsString()
  @MinLength(1)
  issueCategory!: string;

  @IsEnum(TicketPriority)
  priority!: TicketPriority;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateTicketStatusDto {
  @IsEnum(TicketStatus)
  status!: TicketStatus;
}

export class CreateTicketCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  message!: string;
}
