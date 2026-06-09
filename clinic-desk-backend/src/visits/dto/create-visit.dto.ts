import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVisitDto {
  @ApiProperty({ example: 1, description: 'ID of the originating appointment' })
  @IsInt()
  @IsNotEmpty({ message: 'Appointment ID is required' })
  appointmentId: number;

  @ApiPropertyOptional({ example: 'Persistent dry cough for 3 days.', description: 'Patient chief complaint' })
  @IsString()
  @IsOptional()
  chiefComplaint?: string;
}
