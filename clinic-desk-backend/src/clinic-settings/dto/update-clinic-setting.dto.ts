import { IsString, IsOptional, IsEmail, IsNumber, IsArray, IsNotEmpty } from 'class-validator';

export class UpdateClinicSettingDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  clinicName?: string;

  @IsString()
  @IsOptional()
  clinicNameAr?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  addressAr?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsArray()
  @IsOptional()
  workingHours?: {
    dayOfWeek: number;
    slots: { start: string; end: string }[];
  }[];

  @IsNumber()
  @IsOptional()
  taxRate?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  defaultLanguage?: string;
}
