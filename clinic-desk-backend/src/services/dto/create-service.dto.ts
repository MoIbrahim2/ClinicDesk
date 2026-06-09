import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, MaxLength, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({ example: 'CONSULTATION', description: 'Unique alphanumeric code for the service' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @ApiProperty({ example: 'General Consultation', description: 'Service name in English' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiProperty({ example: 'كشف عام', description: 'Service name in Arabic', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(150)
  nameAr?: string;

  @ApiProperty({ example: 200.00, description: 'Service fee/price' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
