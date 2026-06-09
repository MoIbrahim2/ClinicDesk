import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDiagnosisDto {
  @ApiPropertyOptional({ example: 'J06.9', description: 'ICD-10 classification code' })
  @IsString()
  @IsOptional()
  icdCode?: string;

  @ApiProperty({ example: 'Acute nasopharyngitis (common cold)', description: 'English name/description of diagnosis' })
  @IsString()
  @IsNotEmpty({ message: 'Diagnosis name is required' })
  diagnosisName: string;

  @ApiPropertyOptional({ example: 'التهاب الأنف والبلعوم الحاد', description: 'Arabic name/description of diagnosis' })
  @IsString()
  @IsOptional()
  diagnosisNameAr?: string;

  @ApiPropertyOptional({ example: 'Patient advised rest and fluid intake.', description: 'Clinical notes related to the diagnosis' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: true, description: 'True if this is the primary reason for the visit' })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}
