import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe, HttpCode, HttpStatus, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('doctors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new doctor record (Admin only)' })
  @ApiResponse({ status: 201, description: 'Doctor record created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'User ID or License Number already in use' })
  create(@Body() createDoctorDto: CreateDoctorDto) {
    return this.doctorsService.create(createDoctorDto);
  }

  @Get()
  @Roles('admin', 'doctor', 'receptionist')
  @ApiOperation({ summary: 'Get all doctors with pagination, search, and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'specialization', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiResponse({ status: 200, description: 'List of doctors' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('specialization') specialization?: string,
    @Query('isActive') isActive?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    const isActiveBool = isActive === undefined ? undefined : isActive === 'true';
    return this.doctorsService.findAll({
      page,
      limit,
      search,
      specialization,
      isActive: isActiveBool,
      sortBy,
      sortOrder,
    });
  }

  @Get(':id')
  @Roles('admin', 'doctor', 'receptionist', 'patient')
  @ApiOperation({ summary: 'Get doctor details by ID' })
  @ApiResponse({ status: 200, description: 'Doctor details' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.doctorsService.findOne(id);
  }

  @Get(':id/availability')
  @Roles('admin', 'doctor', 'receptionist', 'patient')
  @ApiOperation({ summary: 'Get doctor working hours/availability' })
  @ApiResponse({ status: 200, description: 'Doctor working hours' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  getAvailability(@Param('id', ParseIntPipe) id: number) {
    return this.doctorsService.getAvailability(id);
  }

  @Patch(':id')
  @Roles('admin', 'doctor')
  @ApiOperation({ summary: 'Update doctor record (Admin or Doctor self)' })
  @ApiResponse({ status: 200, description: 'Doctor updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden access' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  @ApiResponse({ status: 409, description: 'License Number or User ID already linked' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDoctorDto: UpdateDoctorDto,
    @CurrentUser() user: User,
  ) {
    // Ownership Check: Doctor can only update their own profile
    if (user.role.name === 'doctor') {
      const doctor = await this.doctorsService.findOne(id);
      if (doctor.userId !== user.id) {
        throw new ForbiddenException('You are not authorized to update another doctor\'s profile');
      }
    }

    return this.doctorsService.update(id, updateDoctorDto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a doctor (Admin only)' })
  @ApiResponse({ status: 204, description: 'Doctor deleted successfully' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.doctorsService.remove(id);
  }
}
