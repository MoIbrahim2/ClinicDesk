import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClinicSetting } from './entities/clinic-setting.entity';
import { UpdateClinicSettingDto } from './dto/update-clinic-setting.dto';

@Injectable()
export class ClinicSettingsService implements OnModuleInit {
  constructor(
    @InjectRepository(ClinicSetting)
    private readonly settingsRepository: Repository<ClinicSetting>,
  ) {}

  async onModuleInit() {
    const count = await this.settingsRepository.count();
    if (count === 0) {
      const defaultSettings = this.settingsRepository.create({
        id: 1,
        clinicName: 'ClinicDesk',
        clinicNameAr: 'كلينك ديسك',
        address: '123 Medical Center Way, Riyadh',
        addressAr: '١٢٣ طريق المركز الطبي، الرياض',
        phone: '+966112223344',
        email: 'info@clinicdesk.com',
        logoUrl: '',
        workingHours: [
          { dayOfWeek: 0, slots: [{ start: '09:00', end: '17:00' }] }, // Sun
          { dayOfWeek: 1, slots: [{ start: '09:00', end: '17:00' }] }, // Mon
          { dayOfWeek: 2, slots: [{ start: '09:00', end: '17:00' }] }, // Tue
          { dayOfWeek: 3, slots: [{ start: '09:00', end: '17:00' }] }, // Wed
          { dayOfWeek: 4, slots: [{ start: '09:00', end: '17:00' }] }, // Thu
        ],
        taxRate: 15.00,
        currency: 'SAR',
        defaultLanguage: 'en',
      });
      await this.settingsRepository.save(defaultSettings);
      console.log('Seeded default clinic settings.');
    }
  }

  async get(): Promise<ClinicSetting> {
    const settings = await this.settingsRepository.findOne({ where: { id: 1 } });
    if (!settings) {
      throw new NotFoundException('Clinic settings not initialized');
    }
    return settings;
  }

  async update(dto: UpdateClinicSettingDto): Promise<ClinicSetting> {
    const settings = await this.get();
    Object.assign(settings, dto);
    return this.settingsRepository.save(settings);
  }
}
