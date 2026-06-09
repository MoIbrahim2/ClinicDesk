import { IsString, IsNotEmpty, IsOptional, IsEmail, IsBoolean, IsArray, ValidateNested, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TimeSlotDto {
  @ApiProperty({ example: '09:00' })
  @IsString()
  @IsNotEmpty()
  start: string;

  @ApiProperty({ example: '17:00' })
  @IsString()
  @IsNotEmpty()
  end: string;
}

export class WorkingHoursDto {
  @ApiProperty({ description: 'Day of week: 0 (Sunday) to 6 (Saturday)', example: 1 })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({ type: [TimeSlotDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  slots: TimeSlotDto[];
}

export class CreateDoctorDto {
  @ApiProperty({ required: false, example: 2 })
  @IsOptional()
  @IsInt()
  userId?: number;

  @ApiProperty({ example: 'Alice' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Smith' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ required: false, example: 'أليس' })
  @IsOptional()
  @IsString()
  firstNameAr?: string;

  @ApiProperty({ required: false, example: 'سميث' })
  @IsOptional()
  @IsString()
  lastNameAr?: string;

  @ApiProperty({ example: 'Cardiology' })
  @IsString()
  @IsNotEmpty()
  specialization: string;

  @ApiProperty({ required: false, example: 'طب القلب' })
  @IsOptional()
  @IsString()
  specializationAr?: string;

  @ApiProperty({ required: false, example: 'LIC123456' })
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @ApiProperty({ example: '01012345678' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ required: false, example: 'alice.smith@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bioAr?: string;

  @ApiProperty({ required: false, type: [WorkingHoursDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkingHoursDto)
  workingHours?: WorkingHoursDto[];

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
