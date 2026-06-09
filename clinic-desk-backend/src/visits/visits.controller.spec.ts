import { Test, TestingModule } from '@nestjs/testing';
import { VisitsController } from './visits.controller';
import { VisitsService } from './visits.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { User } from '../users/entities/user.entity';

describe('VisitsController', () => {
  let controller: VisitsController;
  let service: jest.Mocked<VisitsService>;

  const mockAdminUser = { id: 1, email: 'admin@test.com', role: { name: 'admin' } } as User;

  beforeEach(async () => {
    const mockVisitsService = {
      create: jest.fn(),
      updateDraft: jest.fn(),
      finalize: jest.fn(),
      findOne: jest.fn(),
      findAll: jest.fn(),
      getPatientTimeline: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VisitsController],
      providers: [
        { provide: VisitsService, useValue: mockVisitsService },
      ],
    }).compile();

    controller = module.get<VisitsController>(VisitsController);
    service = module.get(VisitsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should start a new visit record', async () => {
      const dto: CreateVisitDto = {
        appointmentId: 1,
        chiefComplaint: 'Chest pain',
      };
      const expectedResult = { id: 10, ...dto };
      service.create.mockResolvedValue(expectedResult as any);

      const result = await controller.create(dto, mockAdminUser);
      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(dto, mockAdminUser);
    });
  });

  describe('update', () => {
    it('should save draft details of a visit', async () => {
      const dto: UpdateVisitDto = {
        chiefComplaint: 'Updated chest pain',
        examinationNotes: 'Patient lungs clear',
      };
      const expectedResult = { id: 10, ...dto };
      service.updateDraft.mockResolvedValue(expectedResult as any);

      const result = await controller.update(10, dto, mockAdminUser);
      expect(result).toEqual(expectedResult);
      expect(service.updateDraft).toHaveBeenCalledWith(10, dto, mockAdminUser);
    });
  });

  describe('finalize', () => {
    it('should complete visit documentation', async () => {
      const expectedResult = { id: 10, status: 'completed' };
      service.finalize.mockResolvedValue(expectedResult as any);

      const result = await controller.finalize(10, mockAdminUser);
      expect(result).toEqual(expectedResult);
      expect(service.finalize).toHaveBeenCalledWith(10, mockAdminUser);
    });
  });
});
