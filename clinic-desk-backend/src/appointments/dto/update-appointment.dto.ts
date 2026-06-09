import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateAppointmentDto } from './create-appointment.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {
  @ApiPropertyOptional({ example: 'Patient requested change of time.' })
  @IsOptional()
  @IsString()
  rescheduleReason?: string;
}
