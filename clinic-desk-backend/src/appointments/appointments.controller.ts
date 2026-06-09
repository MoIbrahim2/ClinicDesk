import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe, HttpCode, HttpStatus, Ip } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { AppointmentStatus } from './entities/appointment.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@ApiTags('appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  @Post()
  @Roles('admin', 'receptionist', 'patient')
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiResponse({ status: 201, description: 'Appointment successfully scheduled' })
  @ApiResponse({ status: 400, description: 'Invalid input data or timeline' })
  @ApiResponse({ status: 409, description: 'Doctor availability mismatch or scheduling overlap conflict' })
  async create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @CurrentUser() user: User,
    @Ip() ip: string,
  ) {
    const appointment = await this.appointmentsService.create(createAppointmentDto, user);
    await this.auditLogsService.logAction(user.id, 'CREATE', 'appointment', appointment.id, null, appointment, ip);
    return appointment;
  }

  @Get()
  @Roles('admin', 'receptionist', 'doctor', 'patient')
  @ApiOperation({ summary: 'Get all appointments with pagination, searches, and calendar range filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'doctorId', required: false, type: Number })
  @ApiQuery({ name: 'patientId', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: AppointmentStatus })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiResponse({ status: 200, description: 'List of appointments' })
  findAll(
    @CurrentUser() user: User,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('doctorId') doctorId?: number,
    @Query('patientId') patientId?: number,
    @Query('status') status?: AppointmentStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    return this.appointmentsService.findAll(
      {
        page,
        limit,
        search,
        doctorId,
        patientId,
        status,
        startDate,
        endDate,
        sortBy,
        sortOrder,
      },
      user,
    );
  }

  @Get(':id')
  @Roles('admin', 'receptionist', 'doctor', 'patient')
  @ApiOperation({ summary: 'Get single appointment details by ID' })
  @ApiResponse({ status: 200, description: 'Appointment details' })
  @ApiResponse({ status: 403, description: 'Forbidden access' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.appointmentsService.findOne(id, user);
  }

  @Patch(':id')
  @Roles('admin', 'receptionist', 'patient')
  @ApiOperation({ summary: 'Update/Reschedule appointment details' })
  @ApiResponse({ status: 200, description: 'Appointment updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden access' })
  @ApiResponse({ status: 409, description: 'Scheduling conflict or availability mismatch' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @CurrentUser() user: User,
    @Ip() ip: string,
  ) {
    const oldAppt = await this.appointmentsService.findOne(id, user);
    const updated = await this.appointmentsService.update(id, updateAppointmentDto, user);
    await this.auditLogsService.logAction(user.id, 'UPDATE', 'appointment', id, oldAppt, updated, ip);
    return updated;
  }

  @Patch(':id/status')
  @Roles('admin', 'receptionist', 'doctor', 'patient')
  @ApiOperation({ summary: 'Update appointment status (Patients can only cancel)' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden transition or access' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateAppointmentStatusDto,
    @CurrentUser() user: User,
    @Ip() ip: string,
  ) {
    const oldAppt = await this.appointmentsService.findOne(id, user);
    const updated = await this.appointmentsService.updateStatus(id, updateStatusDto, user);
    await this.auditLogsService.logAction(user.id, 'UPDATE', 'appointment', id, oldAppt, updated, ip);
    return updated;
  }

  @Delete(':id')
  @Roles('admin', 'receptionist')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete appointment (Admin/Receptionist only)' })
  @ApiResponse({ status: 204, description: 'Appointment deleted successfully' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
    @Ip() ip: string,
  ) {
    const oldAppt = await this.appointmentsService.findOne(id, user);
    await this.appointmentsService.remove(id, user);
    await this.auditLogsService.logAction(user.id, 'DELETE', 'appointment', id, oldAppt, null, ip);
  }
}
