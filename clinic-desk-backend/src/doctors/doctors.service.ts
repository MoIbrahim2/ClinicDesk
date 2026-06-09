import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './entities/doctor.entity';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    const { userId, licenseNumber, ...rest } = createDoctorDto;

    // 1. Verify User existence and role if provided
    if (userId) {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: { role: true },
      });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      if (user.role.name !== 'doctor' && user.role.name !== 'admin') {
        throw new ConflictException(`User with ID ${userId} must have doctor or admin role`);
      }

      const existingUserLink = await this.doctorRepository.findOne({
        where: { userId },
      });
      if (existingUserLink) {
        throw new ConflictException(`User ID ${userId} is already linked to another doctor profile`);
      }
    }

    // 2. Verify License Number uniqueness if provided
    if (licenseNumber) {
      const existingLicense = await this.doctorRepository.findOne({
        where: { licenseNumber },
      });
      if (existingLicense) {
        throw new ConflictException(`Doctor with License Number ${licenseNumber} already exists`);
      }
    }

    // 3. Create Doctor
    const doctor = this.doctorRepository.create({
      ...rest,
      userId,
      licenseNumber,
    });

    return this.doctorRepository.save(doctor);
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    specialization?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }) {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.max(1, Math.min(100, Number(query.limit || 10)));
    const skip = (page - 1) * limit;

    const queryBuilder = this.doctorRepository.createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.user', 'user');

    // Filters
    if (query.specialization) {
      queryBuilder.andWhere('doctor.specialization = :specialization', { specialization: query.specialization });
    }

    if (query.isActive !== undefined) {
      queryBuilder.andWhere('doctor.isActive = :isActive', { isActive: query.isActive });
    }

    // Global Search
    if (query.search) {
      const searchPattern = `%${query.search}%`;
      queryBuilder.andWhere(
        '(doctor.firstName LIKE :search OR ' +
        'doctor.lastName LIKE :search OR ' +
        'doctor.firstNameAr LIKE :search OR ' +
        'doctor.lastNameAr LIKE :search OR ' +
        'doctor.specialization LIKE :search OR ' +
        'doctor.phone LIKE :search OR ' +
        'doctor.email LIKE :search OR ' +
        'doctor.licenseNumber LIKE :search)',
        { search: searchPattern }
      );
    }

    // Sorting
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'DESC';
    const allowedSortFields = ['id', 'firstName', 'lastName', 'specialization', 'createdAt', 'updatedAt'];
    const validatedSortBy = allowedSortFields.includes(sortBy) ? `doctor.${sortBy}` : 'doctor.createdAt';

    queryBuilder.orderBy(validatedSortBy, sortOrder);
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Doctor> {
    const doctor = await this.doctorRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }

    return doctor;
  }

  async update(id: number, updateDoctorDto: UpdateDoctorDto): Promise<Doctor> {
    const doctor = await this.findOne(id);

    const { userId, licenseNumber, ...rest } = updateDoctorDto;

    // Check user link uniqueness if changing
    if (userId && userId !== doctor.userId) {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: { role: true },
      });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      if (user.role.name !== 'doctor' && user.role.name !== 'admin') {
        throw new ConflictException(`User with ID ${userId} must have doctor or admin role`);
      }

      const existingUserLink = await this.doctorRepository.findOne({
        where: { userId },
      });
      if (existingUserLink) {
        throw new ConflictException(`User ID ${userId} is already linked to another doctor profile`);
      }
    }

    // Check license number uniqueness if changing
    if (licenseNumber && licenseNumber !== doctor.licenseNumber) {
      const existingLicense = await this.doctorRepository.findOne({
        where: { licenseNumber },
      });
      if (existingLicense) {
        throw new ConflictException(`Doctor with License Number ${licenseNumber} already exists`);
      }
    }

    Object.assign(doctor, rest);
    if (userId !== undefined) doctor.userId = userId;
    if (licenseNumber !== undefined) doctor.licenseNumber = licenseNumber;

    return this.doctorRepository.save(doctor);
  }

  async remove(id: number): Promise<void> {
    const doctor = await this.findOne(id);
    await this.doctorRepository.remove(doctor);
  }

  async getAvailability(id: number) {
    const doctor = await this.findOne(id);
    return doctor.workingHours || [];
  }
}
