import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'patient@clinicdesk.com', description: 'User email' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ example: 'Patient@123', description: 'User password' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @ApiProperty({ example: 'John', description: 'First name' })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name' })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @ApiProperty({ example: 'جون', description: 'First name in Arabic', required: false })
  @IsString()
  @IsOptional()
  firstNameAr?: string;

  @ApiProperty({ example: 'دو', description: 'Last name in Arabic', required: false })
  @IsString()
  @IsOptional()
  lastNameAr?: string;

  @ApiProperty({ example: '0123456789', description: 'Phone number' })
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  phone: string;

  @ApiProperty({ example: 'en', description: 'Preferred language (en/ar)', required: false })
  @IsString()
  @IsOptional()
  preferredLanguage?: string;
}
