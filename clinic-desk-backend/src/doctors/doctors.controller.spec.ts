import { Test, TestingModule } from '@nestjs/testing';
import { DoctorsController } from './doctors.controller';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { User } from '../users/entities/user.entity';

describe('DoctorsController', () => {
  let controller: DoctorsController;
  let service: jest.Mocked<DoctorsService>;

  beforeEach(async () => {
    const mockDoctorsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      getAvailability: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DoctorsController],
      providers: [
        { provide: DoctorsService, useValue: mockDoctorsService },
      ],
    }).compile();

    controller = module.get<DoctorsController>(DoctorsController);
    service = module.get(DoctorsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a doctor profile', async () => {
      const dto: CreateDoctorDto = {
        firstName: 'Alice',
        lastName: 'Smith',
        specialization: 'Cardiology',
        phone: '01012345678',
      };
      const expectedResult = { id: 1, ...dto };
      service.create.mockResolvedValue(expectedResult as any);

      const result = await controller.create(dto);
      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return paginated doctors list', async () => {
      const expectedResult = { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
      service.findAll.mockResolvedValue(expectedResult as any);

      const result = await controller.findAll(1, 10, 'search');
      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: 'search',
        specialization: undefined,
        isActive: undefined,
        sortBy: undefined,
        sortOrder: undefined,
      });
    });
  });
});
