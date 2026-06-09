import { IsString, IsNotEmpty, IsOptional, IsDateString, IsEnum, IsEmail, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePatientDto {
  @ApiPropertyOptional({ example: '12345678901234', description: 'National ID or Passport number' })
  @IsString()
  @IsOptional()
  nationalId?: string;

  @ApiProperty({ example: 'John', description: 'Patient first name in English' })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Patient last name in English' })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @ApiPropertyOptional({ example: 'جون', description: 'Patient first name in Arabic' })
  @IsString()
  @IsOptional()
  firstNameAr?: string;

  @ApiPropertyOptional({ example: 'دو', description: 'Patient last name in Arabic' })
  @IsString()
  @IsOptional()
  lastNameAr?: string;

  @ApiProperty({ example: '1990-01-01', description: 'Date of birth (YYYY-MM-DD)' })
  @IsDateString({}, { message: 'Date of birth must be a valid date' })
  @IsNotEmpty({ message: 'Date of birth is required' })
  dateOfBirth: string;

  @ApiProperty({ example: 'male', enum: ['male', 'female', 'other'], description: 'Gender' })
  @IsEnum(['male', 'female', 'other'], { message: 'Gender must be male, female, or other' })
  @IsNotEmpty({ message: 'Gender is required' })
  gender: 'male' | 'female' | 'other';

  @ApiPropertyOptional({ example: 'O+', enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], description: 'Blood type' })
  @IsEnum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], { message: 'Invalid blood type' })
  @IsOptional()
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

  @ApiProperty({ example: '0123456789', description: 'Contact phone number' })
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  phone: string;

  @ApiPropertyOptional({ example: 'john.doe@example.com', description: 'Email address' })
  @IsEmail({}, { message: 'Invalid email address' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '123 Main St, Mansoura', description: 'Home address' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'Jane Doe', description: 'Emergency contact full name' })
  @IsString()
  @IsOptional()
  emergencyContactName?: string;

  @ApiPropertyOptional({ example: '0987654321', description: 'Emergency contact phone number' })
  @IsString()
  @IsOptional()
  emergencyContactPhone?: string;

  @ApiPropertyOptional({ example: 'Hypertension, diabetic', description: 'Chronic conditions or medical history' })
  @IsString()
  @IsOptional()
  medicalNotes?: string;

  @ApiPropertyOptional({ example: 'Penicillin', description: 'Known allergies' })
  @IsString()
  @IsOptional()
  allergies?: string;

  @ApiPropertyOptional({ example: 4, description: 'User account ID associated with the patient' })
  @IsInt()
  @IsOptional()
  userId?: number;
}
