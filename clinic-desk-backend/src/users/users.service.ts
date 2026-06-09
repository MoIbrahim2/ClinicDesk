import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async findAll(query: { search?: string; roleId?: number }): Promise<User[]> {
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role');

    if (query.roleId) {
      queryBuilder.andWhere('user.roleId = :roleId', { roleId: query.roleId });
    }

    if (query.search) {
      queryBuilder.andWhere(
        '(user.email LIKE :search OR user.firstName LIKE :search OR user.lastName LIKE :search OR user.firstNameAr LIKE :search OR user.lastNameAr LIKE :search OR user.phone LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    queryBuilder.orderBy('user.id', 'ASC');
    return queryBuilder.getMany();
  }

  async findRoles(): Promise<Role[]> {
    return this.roleRepository.find({ order: { id: 'ASC' } });
  }

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

  async create(userData: Partial<User> & { password?: string }): Promise<User> {
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

    if (userData.password) {
      userData.passwordHash = await bcrypt.hash(userData.password, 10);
      delete userData.password;
    } else if (!userData.passwordHash) {
      throw new ConflictException('Password is required for new accounts');
    }

    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async update(id: number, updateData: Partial<User> & { password?: string }): Promise<User> {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateData.password) {
      updateData.passwordHash = await bcrypt.hash(updateData.password, 10);
      delete updateData.password;
    }

    Object.assign(user, updateData);
    await this.userRepository.save(user);
    
    const updated = await this.findOneById(id);
    if (!updated) {
      throw new Error('User not found after update');
    }
    return updated;
  }
}
