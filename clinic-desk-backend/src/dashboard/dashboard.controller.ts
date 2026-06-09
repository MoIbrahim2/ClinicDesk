import { Controller, Get, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @Roles('admin', 'doctor', 'receptionist', 'patient')
  @ApiOperation({ summary: 'Get role-specific dashboard metrics and summaries' })
  @ApiResponse({ status: 200, description: 'Role-specific summary data' })
  getSummary(@CurrentUser() user: User) {
    return this.dashboardService.getSummary(user);
  }

  @Get('reports/revenue')
  @Roles('admin', 'doctor')
  @ApiOperation({ summary: 'Get revenue payments report statistics' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Filter start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Filter end date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'doctorId', required: false, type: Number, description: 'Filter by attending doctor ID' })
  @ApiQuery({ name: 'paymentMethod', required: false, type: String, description: 'Filter by payment method' })
  @ApiResponse({ status: 200, description: 'Filtered revenue payments data' })
  getRevenueReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('doctorId') doctorId?: number,
    @Query('paymentMethod') paymentMethod?: string,
  ) {
    return this.dashboardService.getRevenueReport({
      startDate,
      endDate,
      doctorId: doctorId ? Number(doctorId) : undefined,
      paymentMethod,
    });
  }

  @Get('reports/appointments')
  @Roles('admin', 'doctor')
  @ApiOperation({ summary: 'Get appointments outcomes and patient demographics report' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Filter start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Filter end date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'doctorId', required: false, type: Number, description: 'Filter by doctor ID' })
  @ApiResponse({ status: 200, description: 'Appointment analytics report' })
  getAppointmentsReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('doctorId') doctorId?: number,
  ) {
    return this.dashboardService.getAppointmentsReport({
      startDate,
      endDate,
      doctorId: doctorId ? Number(doctorId) : undefined,
    });
  }
}
