import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { Service } from '../services/entities/service.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async onModuleInit() {
    try {
      await this.seedRoles();
      await this.seedAdmin();
      await this.seedServices();
    } catch (error) {
      console.error('Error during database seeding:', error);
    }
  }

  private async seedRoles() {
    const count = await this.roleRepository.count();
    if (count > 0) return;

    const roles = [
      {
        name: 'admin',
        nameAr: 'مدير النظام',
        description: 'System Administrator with full access',
        permissions: ['*'],
      },
      {
        name: 'doctor',
        nameAr: 'طبيب',
        description: 'Doctor with access to clinical data',
        permissions: [
          'patients:read',
          'patients:write',
          'appointments:read',
          'appointments:write',
          'visits:read',
          'visits:write',
          'prescriptions:read',
          'prescriptions:write',
          'diagnoses:read',
          'diagnoses:write',
          'medical_reports:read',
          'medical_reports:write',
        ],
      },
      {
        name: 'receptionist',
        nameAr: 'موظف استقبال',
        description: 'Receptionist handling scheduling and billing',
        permissions: [
          'patients:read',
          'patients:write',
          'appointments:read',
          'appointments:write',
          'invoices:read',
          'invoices:write',
          'payments:read',
          'payments:write',
        ],
      },
      {
        name: 'patient',
        nameAr: 'مريض',
        description: 'Patient client account',
        permissions: [
          'appointments:read',
          'prescriptions:read',
          'invoices:read',
        ],
      },
    ];

    for (const roleData of roles) {
      const role = this.roleRepository.create(roleData);
      await this.roleRepository.save(role);
    }
    console.log('Successfully seeded database roles.');
  }

  private async seedAdmin() {
    const adminEmail = 'admin@clinicdesk.com';
    const adminUser = await this.userRepository.findOne({ where: { email: adminEmail } });
    if (adminUser) return;

    const adminRole = await this.roleRepository.findOne({ where: { name: 'admin' } });
    if (!adminRole) {
      console.error('Admin role not found. Cannot seed admin user.');
      return;
    }

    const passwordHash = await bcrypt.hash('Admin@123', 10);
    const admin = this.userRepository.create({
      email: adminEmail,
      passwordHash,
      firstName: 'System',
      lastName: 'Administrator',
      firstNameAr: 'مدير',
      lastNameAr: 'النظام',
      phone: '0123456789',
      roleId: adminRole.id,
      isActive: true,
      preferredLanguage: 'en',
    });

    await this.userRepository.save(admin);
    console.log(`Successfully seeded default admin user (email: ${adminEmail}, password: Admin@123).`);
  }

  private async seedServices() {
    const count = await this.serviceRepository.count();
    if (count > 0) return;

    const services = [
      {
        code: 'CONSULTATION',
        name: 'General Consultation',
        nameAr: 'كشف عام',
        price: 200.00,
        isActive: true,
      },
      {
        code: 'FOLLOW_UP',
        name: 'Follow Up Visit',
        nameAr: 'إعادة كشف',
        price: 50.00,
        isActive: true,
      },
    ];

    for (const serviceData of services) {
      const s = this.serviceRepository.create(serviceData);
      await this.serviceRepository.save(s);
    }
    console.log('Successfully seeded default clinical services.');
  }
}
