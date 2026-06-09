import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsString, IsEnum, IsOptional, Matches } from 'class-validator';
import { AppointmentStatus, AppointmentType } from '../entities/appointment.entity';

export class CreateAppointmentDto {
  @ApiProperty({ example: 1, description: 'ID of the Patient' })
  @IsNotEmpty()
  @IsInt()
  patientId: number;

  @ApiProperty({ example: 1, description: 'ID of the Doctor' })
  @IsNotEmpty()
  @IsInt()
  doctorId: number;

  @ApiProperty({ example: '2026-06-15', description: 'Appointment Date (YYYY-MM-DD)' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be in YYYY-MM-DD format' })
  date: string;

  @ApiProperty({ example: '09:00', description: 'Start Time (HH:MM)' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Start time must be in HH:MM format' })
  startTime: string;

  @ApiProperty({ example: '09:30', description: 'End Time (HH:MM)' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'End time must be in HH:MM format' })
  endTime: string;

  @ApiPropertyOptional({ enum: AppointmentStatus, default: AppointmentStatus.SCHEDULED })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiPropertyOptional({ enum: AppointmentType, default: AppointmentType.SCHEDULED })
  @IsOptional()
  @IsEnum(AppointmentType)
  type?: AppointmentType;

  @ApiPropertyOptional({ example: 'Routine checkup and general follow-up.' })
  @IsOptional()
  @IsString()
  notes?: string;
}
