import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    const { code } = createServiceDto;

    // Check code uniqueness (case-insensitive)
    const existing = await this.serviceRepository.createQueryBuilder('service')
      .where('LOWER(service.code) = LOWER(:code)', { code })
      .getOne();

    if (existing) {
      throw new ConflictException(`Service with code '${code}' already exists`);
    }

    const service = this.serviceRepository.create(createServiceDto);
    return this.serviceRepository.save(service);
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    activeOnly?: boolean;
  }) {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.max(1, Math.min(100, Number(query.limit || 10)));
    const skip = (page - 1) * limit;

    const queryBuilder = this.serviceRepository.createQueryBuilder('service');

    if (query.activeOnly) {
      queryBuilder.andWhere('service.isActive = true');
    }

    if (query.search) {
      queryBuilder.andWhere(
        '(LOWER(service.code) LIKE LOWER(:search) OR LOWER(service.name) LIKE LOWER(:search) OR LOWER(service.nameAr) LIKE LOWER(:search))',
        { search: `%${query.search}%` },
      );
    }

    queryBuilder.orderBy('service.code', 'ASC');
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

  async findOne(id: number): Promise<Service> {
    const service = await this.serviceRepository.findOne({ where: { id } });
    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
    return service;
  }

  async findOneByCode(code: string): Promise<Service | null> {
    return this.serviceRepository.createQueryBuilder('service')
      .where('LOWER(service.code) = LOWER(:code)', { code })
      .getOne();
  }

  async update(id: number, updateServiceDto: UpdateServiceDto): Promise<Service> {
    const service = await this.findOne(id);

    if (updateServiceDto.code && updateServiceDto.code.toLowerCase() !== service.code.toLowerCase()) {
      const existing = await this.serviceRepository.createQueryBuilder('service')
        .where('LOWER(service.code) = LOWER(:code) AND service.id != :id', { code: updateServiceDto.code, id })
        .getOne();

      if (existing) {
        throw new ConflictException(`Service with code '${updateServiceDto.code}' already exists`);
      }
    }

    Object.assign(service, updateServiceDto);
    return this.serviceRepository.save(service);
  }

  async remove(id: number): Promise<Service> {
    const service = await this.findOne(id);
    service.isActive = false;
    return this.serviceRepository.save(service);
  }
}
