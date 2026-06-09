import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe, HttpCode, HttpStatus, Ip } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@ApiTags('patients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('patients')
export class PatientsController {
  constructor(
    private readonly patientsService: PatientsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  @Post()
  @Roles('admin', 'doctor', 'receptionist')
  @ApiOperation({ summary: 'Create a new patient' })
  @ApiResponse({ status: 201, description: 'Patient successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'National ID or User ID already linked' })
  async create(
    @Body() createPatientDto: CreatePatientDto,
    @CurrentUser() user: User,
    @Ip() ip: string,
  ) {
    const patient = await this.patientsService.create(createPatientDto, user.id);
    await this.auditLogsService.logAction(user.id, 'CREATE', 'patient', patient.id, null, patient, ip);
    return patient;
  }

  @Get()
  @Roles('admin', 'doctor', 'receptionist', 'patient')
  @ApiOperation({ summary: 'Get all patients with pagination, filtering, and search' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'gender', required: false, enum: ['male', 'female', 'other'] })
  @ApiQuery({ name: 'bloodType', required: false, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiResponse({ status: 200, description: 'List of patients' })
  findAll(
    @CurrentUser() user: User,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('gender') gender?: string,
    @Query('bloodType') bloodType?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    if (user.role.name === 'patient') {
      return this.patientsService.findAll({
        search: user.email,
        limit: 1,
      });
    }
    return this.patientsService.findAll({
      page,
      limit,
      search,
      gender,
      bloodType,
      sortBy,
      sortOrder,
    });
  }

  @Get(':id')
  @Roles('admin', 'doctor', 'receptionist', 'patient')
  @ApiOperation({ summary: 'Get a patient profile by ID' })
  @ApiResponse({ status: 200, description: 'Patient details' })
  @ApiResponse({ status: 403, description: 'Forbidden access to patient details' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.patientsService.findOne(id, user);
  }

  @Patch(':id')
  @Roles('admin', 'doctor', 'receptionist')
  @ApiOperation({ summary: 'Update patient details' })
  @ApiResponse({ status: 200, description: 'Patient successfully updated' })
  @ApiResponse({ status: 403, description: 'Forbidden access' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  @ApiResponse({ status: 409, description: 'National ID already in use' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePatientDto: UpdatePatientDto,
    @CurrentUser() user: User,
    @Ip() ip: string,
  ) {
    const oldPatient = await this.patientsService.findOne(id, user);
    const updated = await this.patientsService.update(id, updatePatientDto, user);
    await this.auditLogsService.logAction(user.id, 'UPDATE', 'patient', id, oldPatient, updated, ip);
    return updated;
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a patient (Admin only)' })
  @ApiResponse({ status: 204, description: 'Patient successfully deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden access (requires admin)' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
    @Ip() ip: string,
  ) {
    const oldPatient = await this.patientsService.findOne(id, user);
    await this.patientsService.remove(id, user);
    await this.auditLogsService.logAction(user.id, 'DELETE', 'patient', id, oldPatient, null, ip);
  }
}

