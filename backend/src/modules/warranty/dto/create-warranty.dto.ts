import { IsDateString, IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class CreateWarrantyDto {
  @IsString()
  @MinLength(1)
  serialNumber!: string;

  @IsString()
  @MinLength(1)
  customerName!: string;

  @IsString()
  @MinLength(1)
  customerPhone!: string;

  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @IsOptional()
  @IsString()
  customerAddress?: string;

  @IsDateString()
  purchaseDate!: string;

  @IsDateString()
  expiryDate!: string;
}
