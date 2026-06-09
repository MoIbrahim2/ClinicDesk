import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createPatientDto: CreatePatientDto, creatorId: number): Promise<Patient> {
    const { nationalId, userId, ...rest } = createPatientDto;

    // 1. Check National ID uniqueness if provided
    if (nationalId) {
      const existingNational = await this.patientRepository.findOne({
        where: { nationalId },
      });
      if (existingNational) {
        throw new ConflictException(`Patient with National ID ${nationalId} already exists`);
      }
    }

    // 2. Check User association if provided
    if (userId) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      const existingUserLink = await this.patientRepository.findOne({
        where: { userId },
      });
      if (existingUserLink) {
        throw new ConflictException(`User ID ${userId} is already linked to another patient`);
      }
    }

    // 3. Create Patient
    const patient = this.patientRepository.create({
      ...rest,
      nationalId,
      userId,
      createdBy: creatorId,
    });

    return this.patientRepository.save(patient);
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    gender?: string;
    bloodType?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }) {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.max(1, Math.min(100, Number(query.limit || 10)));
    const skip = (page - 1) * limit;

    const queryBuilder = this.patientRepository.createQueryBuilder('patient')
      .leftJoinAndSelect('patient.user', 'user')
      .leftJoinAndSelect('patient.creator', 'creator');

    // Filters
    if (query.gender) {
      queryBuilder.andWhere('patient.gender = :gender', { gender: query.gender });
    }

    if (query.bloodType) {
      queryBuilder.andWhere('patient.bloodType = :bloodType', { bloodType: query.bloodType });
    }

    // Global Search
    if (query.search) {
      const searchPattern = `%${query.search}%`;
      queryBuilder.andWhere(
        '(patient.firstName LIKE :search OR ' +
        'patient.lastName LIKE :search OR ' +
        'patient.firstNameAr LIKE :search OR ' +
        'patient.lastNameAr LIKE :search OR ' +
        'patient.nationalId LIKE :search OR ' +
        'patient.phone LIKE :search OR ' +
        'patient.email LIKE :search)',
        { search: searchPattern }
      );
    }

    // Sorting
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'DESC';
    // Validate sortBy key to avoid SQL injection
    const allowedSortFields = ['id', 'firstName', 'lastName', 'dateOfBirth', 'createdAt', 'updatedAt'];
    const validatedSortBy = allowedSortFields.includes(sortBy) ? `patient.${sortBy}` : 'patient.createdAt';

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

  async findOne(id: number, reqUser: User): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: { id },
      relations: { user: true, creator: true },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    // Enforcement: Patients can only view their own profile
    if (reqUser.role.name === 'patient' && patient.userId !== reqUser.id) {
      throw new ForbiddenException('You are not authorized to access this patient profile');
    }

    return patient;
  }

  async update(id: number, updatePatientDto: UpdatePatientDto, reqUser: User): Promise<Patient> {
    const patient = await this.findOne(id, reqUser); // Verifies existence & authorization

    const { nationalId, userId, ...rest } = updatePatientDto;

    // Check national ID uniqueness if it's changing
    if (nationalId && nationalId !== patient.nationalId) {
      const existingNational = await this.patientRepository.findOne({
        where: { nationalId },
      });
      if (existingNational) {
        throw new ConflictException(`Patient with National ID ${nationalId} already exists`);
      }
    }

    // Check user link uniqueness if it's changing
    if (userId && userId !== patient.userId) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      const existingUserLink = await this.patientRepository.findOne({
        where: { userId },
      });
      if (existingUserLink) {
        throw new ConflictException(`User ID ${userId} is already linked to another patient`);
      }
    }

    Object.assign(patient, rest);
    if (nationalId !== undefined) patient.nationalId = nationalId;
    if (userId !== undefined) patient.userId = userId;

    return this.patientRepository.save(patient);
  }

  async remove(id: number, reqUser: User): Promise<void> {
    const patient = await this.findOne(id, reqUser);
    await this.patientRepository.remove(patient);
  }
}
