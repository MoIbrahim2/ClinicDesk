import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query, ParseIntPipe, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { VisitsService } from './visits.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { VisitStatus } from './entities/visit.entity';

@ApiTags('visits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('visits')
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Post()
  @Roles('admin', 'doctor')
  @ApiOperation({ summary: 'Start a new visit from a checked-in appointment' })
  @ApiResponse({ status: 201, description: 'Visit successfully started' })
  @ApiResponse({ status: 400, description: 'Appointment not checked in or invalid input' })
  @ApiResponse({ status: 403, description: 'Forbidden access' })
  @ApiResponse({ status: 409, description: 'Visit already exists for this appointment' })
  create(@Body() createVisitDto: CreateVisitDto, @CurrentUser() user: User) {
    return this.visitsService.create(createVisitDto, user);
  }

  @Patch(':id')
  @Roles('admin', 'doctor')
  @ApiOperation({ summary: 'Save draft details (notes, vital signs, diagnoses list)' })
  @ApiResponse({ status: 200, description: 'Draft saved successfully' })
  @ApiResponse({ status: 400, description: 'Cannot modify finalized visit or not same-day' })
  @ApiResponse({ status: 403, description: 'Forbidden access' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVisitDto: UpdateVisitDto,
    @CurrentUser() user: User,
  ) {
    return this.visitsService.updateDraft(id, updateVisitDto, user);
  }

  @Post(':id/finalize')
  @HttpCode(200)
  @Roles('admin', 'doctor')
  @ApiOperation({ summary: 'Finalize visit, updating linked appointment status to completed' })
  @ApiResponse({ status: 200, description: 'Visit finalized successfully' })
  @ApiResponse({ status: 400, description: 'Validation fails (e.g. no primary diagnosis)' })
  @ApiResponse({ status: 403, description: 'Forbidden access' })
  finalize(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.visitsService.finalize(id, user);
  }

  @Get()
  @Roles('admin', 'receptionist', 'doctor', 'patient')
  @ApiOperation({ summary: 'List visits with filters and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'patientId', required: false, type: Number })
  @ApiQuery({ name: 'doctorId', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: VisitStatus })
  @ApiResponse({ status: 200, description: 'List of visits' })
  findAll(
    @CurrentUser() user: User,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('patientId') patientId?: number,
    @Query('doctorId') doctorId?: number,
    @Query('status') status?: VisitStatus,
  ) {
    return this.visitsService.findAll({ page, limit, patientId, doctorId, status }, user);
  }

  @Get(':id')
  @Roles('admin', 'receptionist', 'doctor', 'patient')
  @ApiOperation({ summary: 'Get single visit details' })
  @ApiResponse({ status: 200, description: 'Visit details' })
  @ApiResponse({ status: 403, description: 'Forbidden access' })
  @ApiResponse({ status: 404, description: 'Visit not found' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.visitsService.findOne(id, user);
  }

  @Get('patient/:patientId')
  @Roles('admin', 'receptionist', 'doctor', 'patient')
  @ApiOperation({ summary: 'Get patient clinical visit timeline (chronological histories)' })
  @ApiResponse({ status: 200, description: 'Patient timeline of visits' })
  @ApiResponse({ status: 403, description: 'Forbidden access' })
  getPatientTimeline(@Param('patientId', ParseIntPipe) patientId: number, @CurrentUser() user: User) {
    return this.visitsService.getPatientTimeline(patientId, user);
  }
}
