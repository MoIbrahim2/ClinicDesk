import { Controller, Get, Patch, Body, UseGuards, Ip } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClinicSettingsService } from './clinic-settings.service';
import { UpdateClinicSettingDto } from './dto/update-clinic-setting.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@ApiTags('clinic-settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clinic-settings')
export class ClinicSettingsController {
  constructor(
    private readonly settingsService: ClinicSettingsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  @Get()
  @Roles('admin', 'receptionist', 'doctor', 'patient')
  @ApiOperation({ summary: 'Get current clinic settings' })
  @ApiResponse({ status: 200, description: 'Return clinic config metadata' })
  get() {
    return this.settingsService.get();
  }

  @Patch()
  @Roles('admin')
  @ApiOperation({ summary: 'Update clinic settings (Admin only)' })
  @ApiResponse({ status: 200, description: 'Settings successfully updated' })
  @ApiResponse({ status: 400, description: 'Invalid configuration payload' })
  async update(
    @Body() updateDto: UpdateClinicSettingDto,
    @CurrentUser() adminUser: User,
    @Ip() ip: string,
  ) {
    const oldSettings = await this.settingsService.get();
    const updated = await this.settingsService.update(updateDto);
    await this.auditLogsService.logAction(
      adminUser.id,
      'UPDATE',
      'clinic_setting',
      updated.id,
      oldSettings,
      updated,
      ip,
    );
    return updated;
  }
}
