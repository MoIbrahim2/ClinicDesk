import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvoicesService } from './invoices.service';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { Payment, PaymentMethod } from './entities/payment.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Visit } from '../visits/entities/visit.entity';
import { Service } from '../services/entities/service.entity';
import { User } from '../users/entities/user.entity';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';

describe('InvoicesService', () => {
  let service: InvoicesService;
  let invoiceRepo: jest.Mocked<Repository<Invoice>>;
  let invoiceItemRepo: jest.Mocked<Repository<InvoiceItem>>;
  let paymentRepo: jest.Mocked<Repository<Payment>>;
  let patientRepo: jest.Mocked<Repository<Patient>>;
  let visitRepo: jest.Mocked<Repository<Visit>>;
  let serviceRepo: jest.Mocked<Repository<Service>>;

  const mockUser = { id: 1, role: { name: 'admin' } } as User;
  const mockPatientUser = { id: 2, role: { name: 'patient' } } as User;

  beforeEach(async () => {
    const mockRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((val) => val),
      save: jest.fn((val) => val),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        { provide: getRepositoryToken(Invoice), useValue: { ...mockRepo } },
        { provide: getRepositoryToken(InvoiceItem), useValue: { ...mockRepo } },
        { provide: getRepositoryToken(Payment), useValue: { ...mockRepo } },
        { provide: getRepositoryToken(Patient), useValue: { ...mockRepo } },
        { provide: getRepositoryToken(Visit), useValue: { ...mockRepo } },
        { provide: getRepositoryToken(Service), useValue: { ...mockRepo } },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
    invoiceRepo = module.get(getRepositoryToken(Invoice));
    invoiceItemRepo = module.get(getRepositoryToken(InvoiceItem));
    paymentRepo = module.get(getRepositoryToken(Payment));
    patientRepo = module.get(getRepositoryToken(Patient));
    visitRepo = module.get(getRepositoryToken(Visit));
    serviceRepo = module.get(getRepositoryToken(Service));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a manual invoice', async () => {
      patientRepo.findOne.mockResolvedValue({ id: 10 } as any);
      invoiceRepo.save.mockImplementation(async (inv) => ({ id: 100, ...inv } as any));

      const dto = {
        patientId: 10,
        discount: 10,
        tax: 5,
        items: [
          {
            serviceId: 1,
            description: 'Consult',
            quantity: 2,
            unitPrice: 50.0,
          },
        ],
      };

      const result = await service.create(dto, mockUser);
      expect(result).toBeDefined();
      expect(result.id).toBe(100);
      expect(result.subtotal).toBe(100.0);
      expect(result.total).toBe(95.0); // 100 - 10 + 5
      expect(result.balanceDue).toBe(95.0);
      expect(result.status).toBe(InvoiceStatus.UNPAID);
    });

    it('should throw NotFoundException if patient not found', async () => {
      patientRepo.findOne.mockResolvedValue(null);
      await expect(service.create({ patientId: 99, items: [] }, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if total invoice amount is less than 0', async () => {
      patientRepo.findOne.mockResolvedValue({ id: 10 } as any);
      const dto = {
        patientId: 10,
        discount: 100,
        tax: 0,
        items: [
          {
            serviceId: 1,
            description: 'Consult',
            quantity: 1,
            unitPrice: 50.0,
          },
        ],
      };
      await expect(service.create(dto, mockUser)).rejects.toThrow(BadRequestException);
    });
  });

  describe('createFromVisit', () => {
    it('should return existing invoice if already exists', async () => {
      const existingInvoice = { id: 200, visitId: 50 } as Invoice;
      invoiceRepo.findOne.mockResolvedValue(existingInvoice);

      const result = await service.createFromVisit({ id: 50 } as any);
      expect(result).toEqual(existingInvoice);
      expect(invoiceRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should throw ForbiddenException if patient accesses another patient invoice', async () => {
      const invoice = { id: 100, patientId: 10 } as Invoice;
      invoiceRepo.findOne.mockResolvedValue(invoice);
      patientRepo.findOne.mockResolvedValue({ id: 11 } as any); // logged in patient id = 11

      await expect(service.findOne(100, mockPatientUser)).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin to view any invoice', async () => {
      const invoice = { id: 100, patientId: 10 } as Invoice;
      invoiceRepo.findOne.mockResolvedValue(invoice);

      const result = await service.findOne(100, mockUser);
      expect(result).toEqual(invoice);
    });
  });

  describe('update', () => {
    it('should enforce invoice immutability for PAID status', async () => {
      const invoice = { id: 100, status: InvoiceStatus.PAID } as Invoice;
      invoiceRepo.findOne.mockResolvedValue(invoice);

      await expect(service.update(100, { discount: 5 }, mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('voidInvoice', () => {
    it('should void invoice successfully if no payments', async () => {
      const invoice = { id: 100, status: InvoiceStatus.UNPAID, payments: [] } as Invoice;
      invoiceRepo.findOne.mockResolvedValue(invoice);

      const result = await service.voidInvoice(100, mockUser);
      expect(result.status).toBe(InvoiceStatus.VOIDED);
      expect(result.balanceDue).toBe(0);
      expect(invoiceRepo.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if invoice has payments', async () => {
      const invoice = {
        id: 100,
        status: InvoiceStatus.PARTIALLY_PAID,
        payments: [{ id: 1 }],
      } as any;
      invoiceRepo.findOne.mockResolvedValue(invoice);

      await expect(service.voidInvoice(100, mockUser)).rejects.toThrow(BadRequestException);
    });
  });

  describe('recordPayment', () => {
    it('should record payment and update balance and status to PAID', async () => {
      const invoice = {
        id: 100,
        status: InvoiceStatus.UNPAID,
        total: 100,
        balanceDue: 100,
        payments: [],
      } as Invoice;
      invoiceRepo.findOne.mockResolvedValue(invoice);
      paymentRepo.save.mockResolvedValue({ id: 5, amount: 100 } as any);

      const result = await service.recordPayment(
        100,
        { amount: 100, paymentMethod: PaymentMethod.CASH },
        mockUser,
      );
      expect(result.balanceDue).toBe(0);
      expect(result.status).toBe(InvoiceStatus.PAID);
    });

    it('should throw BadRequestException if payment exceeds balance due', async () => {
      const invoice = { id: 100, balanceDue: 50 } as Invoice;
      invoiceRepo.findOne.mockResolvedValue(invoice);

      await expect(
        service.recordPayment(100, { amount: 60, paymentMethod: PaymentMethod.CARD }, mockUser),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
