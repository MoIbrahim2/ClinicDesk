import { IsString, IsNumber, IsOptional, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class VitalSignsDto {
  @ApiPropertyOptional({ example: '120/80', description: 'Blood pressure in SYS/DIA format' })
  @IsString()
  @IsOptional()
  @Matches(/^\d{2,3}\/\d{2,3}$/, { message: 'Blood pressure must be in format SYS/DIA (e.g. 120/80)' })
  bp?: string;

  @ApiPropertyOptional({ example: 37.0, description: 'Body temperature in Celsius' })
  @IsNumber()
  @IsOptional()
  temp?: number;

  @ApiPropertyOptional({ example: 72, description: 'Heart pulse rate in BPM' })
  @IsNumber()
  @IsOptional()
  pulse?: number;

  @ApiPropertyOptional({ example: 70.5, description: 'Weight in kg' })
  @IsNumber()
  @IsOptional()
  weight?: number;

  @ApiPropertyOptional({ example: 175, description: 'Height in cm' })
  @IsNumber()
  @IsOptional()
  height?: number;
}
