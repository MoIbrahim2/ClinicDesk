import { IsString, IsOptional, IsArray, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreatePrescriptionItemDto } from './create-prescription.dto';

export class UpdatePrescriptionDto {
  @ApiPropertyOptional({ example: 'Take with warm water.', description: 'Optional instructions' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: 'خذ الدواء مع ماء دافئ.', description: 'Optional Arabic instructions' })
  @IsString()
  @IsOptional()
  notesAr?: string;

  @ApiPropertyOptional({ type: () => [CreatePrescriptionItemDto], description: 'List of prescription items to replace' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePrescriptionItemDto)
  @IsOptional()
  items?: CreatePrescriptionItemDto[];
}
