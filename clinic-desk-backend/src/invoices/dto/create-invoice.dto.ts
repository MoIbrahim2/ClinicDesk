import { IsInt, IsNotEmpty, IsOptional, IsNumber, Min, IsString, MaxLength, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInvoiceItemDto {
  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsOptional()
  serviceId?: number;

  @ApiProperty({ example: 'Consultation Fee' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  description: string;

  @ApiProperty({ example: 'كشف الطبيب', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  descriptionAr?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 200.00 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitPrice: number;
}

export class CreateInvoiceDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  patientId: number;

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsOptional()
  visitId?: number;

  @ApiProperty({ example: 10.00, required: false })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  discount?: number;

  @ApiProperty({ example: 14.00, required: false })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  tax?: number;

  @ApiProperty({ type: [CreateInvoiceItemDto] })
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  @ArrayMinSize(1)
  items: CreateInvoiceItemDto[];
}
