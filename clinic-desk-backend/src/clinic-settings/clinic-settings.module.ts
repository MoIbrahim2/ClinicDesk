import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClinicSetting } from './entities/clinic-setting.entity';
import { ClinicSettingsService } from './clinic-settings.service';
import { ClinicSettingsController } from './clinic-settings.controller';

import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClinicSetting]),
    AuditLogsModule,
  ],
  controllers: [ClinicSettingsController],
  providers: [ClinicSettingsService],
  exports: [ClinicSettingsService],
})
export class ClinicSettingsModule {}
