import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: { role: true },
    });
  }

  async findOneById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: { role: true },
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const existing = await this.findOneByEmail(userData.email!);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    if (!userData.roleId && !userData.role) {
      const patientRole = await this.roleRepository.findOne({ where: { name: 'patient' } });
      if (patientRole) {
        userData.roleId = patientRole.id;
      }
    }

    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async update(id: number, updateData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, updateData);
    const updated = await this.findOneById(id);
    if (!updated) {
      throw new Error('User not found after update');
    }
    return updated;
  }
}
