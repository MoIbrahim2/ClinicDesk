import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('prescriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  @Roles('admin', 'doctor')
  @ApiOperation({ summary: 'Create a new prescription for a draft visit' })
  @ApiResponse({ status: 201, description: 'Prescription successfully created' })
  @ApiResponse({ status: 400, description: 'Visit is not draft or invalid inputs' })
  @ApiResponse({ status: 403, description: 'Forbidden access' })
  create(@Body() createPrescriptionDto: CreatePrescriptionDto, @CurrentUser() user: User) {
    return this.prescriptionsService.create(createPrescriptionDto, user);
  }

  @Get()
  @Roles('admin', 'receptionist', 'doctor', 'patient')
  @ApiOperation({ summary: 'List prescriptions with filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'patientId', required: false, type: Number })
  @ApiQuery({ name: 'doctorId', required: false, type: Number })
  @ApiQuery({ name: 'visitId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of prescriptions' })
  findAll(
    @CurrentUser() user: User,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('patientId') patientId?: number,
    @Query('doctorId') doctorId?: number,
    @Query('visitId') visitId?: number,
  ) {
    return this.prescriptionsService.findAll({ page, limit, patientId, doctorId, visitId }, user);
  }

  @Get(':id')
  @Roles('admin', 'receptionist', 'doctor', 'patient')
  @ApiOperation({ summary: 'Get single prescription details' })
  @ApiResponse({ status: 200, description: 'Prescription details' })
  @ApiResponse({ status: 403, description: 'Forbidden access' })
  @ApiResponse({ status: 404, description: 'Prescription not found' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.prescriptionsService.findOne(id, user);
  }

  @Patch(':id')
  @Roles('admin', 'doctor')
  @ApiOperation({ summary: 'Update prescription notes or replace prescription items' })
  @ApiResponse({ status: 200, description: 'Prescription successfully updated' })
  @ApiResponse({ status: 400, description: 'Associated visit is not draft, or invalid inputs' })
  @ApiResponse({ status: 403, description: 'Forbidden access' })
  @ApiResponse({ status: 404, description: 'Prescription not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePrescriptionDto: UpdatePrescriptionDto,
    @CurrentUser() user: User,
  ) {
    return this.prescriptionsService.update(id, updatePrescriptionDto, user);
  }

  @Delete(':id')
  @Roles('admin', 'doctor')
  @ApiOperation({ summary: 'Delete prescription' })
  @ApiResponse({ status: 200, description: 'Prescription successfully deleted' })
  @ApiResponse({ status: 400, description: 'Associated visit is not draft' })
  @ApiResponse({ status: 403, description: 'Forbidden access' })
  @ApiResponse({ status: 404, description: 'Prescription not found' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.prescriptionsService.remove(id, user);
  }

  @Post(':id/duplicate')
  @Roles('admin', 'doctor')
  @ApiOperation({ summary: 'Clone/duplicate a past prescription into a target draft visit' })
  @ApiResponse({ status: 201, description: 'Prescription successfully duplicated' })
  @ApiResponse({ status: 400, description: 'Invalid target visit or mismatching patient' })
  @ApiResponse({ status: 403, description: 'Forbidden access' })
  @ApiResponse({ status: 404, description: 'Prescription or target visit not found' })
  duplicate(
    @Param('id', ParseIntPipe) id: number,
    @Body('visitId', ParseIntPipe) targetVisitId: number,
    @CurrentUser() user: User,
  ) {
    return this.prescriptionsService.duplicate(id, targetVisitId, user);
  }
}
