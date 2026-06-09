import { IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { VitalSignsDto } from './vital-signs.dto';
import { CreateDiagnosisDto } from './create-diagnosis.dto';

export class UpdateVisitDto {
  @ApiPropertyOptional({ example: 'Chest pain radiating to left arm.', description: 'Updated chief complaint' })
  @IsString()
  @IsOptional()
  chiefComplaint?: string;

  @ApiPropertyOptional({ example: 'S1 S2 normal, no murmurs. Lungs clear to auscultation.', description: 'Doctor examination notes' })
  @IsString()
  @IsOptional()
  examinationNotes?: string;

  @ApiPropertyOptional({ type: () => VitalSignsDto, description: 'Updated patient vital signs' })
  @ValidateNested()
  @Type(() => VitalSignsDto)
  @IsOptional()
  vitalSigns?: VitalSignsDto;

  @ApiPropertyOptional({ type: () => [CreateDiagnosisDto], description: 'List of diagnoses documented in this visit' })
  @ValidateNested({ each: true })
  @Type(() => CreateDiagnosisDto)
  @IsOptional()
  diagnoses?: CreateDiagnosisDto[];
}
