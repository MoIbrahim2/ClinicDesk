import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentMethod } from './entities/payment.entity';
import { User } from '../users/entities/user.entity';

describe('InvoicesController', () => {
  let controller: InvoicesController;
  let service: jest.Mocked<InvoicesService>;
  let auditLogsService: jest.Mocked<AuditLogsService>;

  const mockUser = { id: 1, role: { name: 'admin' } } as User;

  beforeEach(async () => {
    const mockInvoicesService = {
      getSummary: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      voidInvoice: jest.fn(),
      recordPayment: jest.fn(),
    };

    const mockAuditLogsService = {
      logAction: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoicesController],
      providers: [
        { provide: InvoicesService, useValue: mockInvoicesService },
        { provide: AuditLogsService, useValue: mockAuditLogsService },
      ],
    }).compile();

    controller = module.get<InvoicesController>(InvoicesController);
    service = module.get(InvoicesService);
    auditLogsService = module.get(AuditLogsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSummary', () => {
    it('should delegate to service.getSummary', async () => {
      const summary = { totalBilled: 1000, totalPaid: 800, totalOutstanding: 200, paymentMethodBreakdown: {} };
      service.getSummary.mockResolvedValue(summary as any);

      const result = await controller.getSummary();
      expect(result).toEqual(summary);
      expect(service.getSummary).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create an invoice and log audit trail', async () => {
      const dto: CreateInvoiceDto = { patientId: 10, items: [] };
      const createdInvoice = { id: 100, patientId: 10 } as any;
      service.create.mockResolvedValue(createdInvoice);

      const result = await controller.create(dto, mockUser, '127.0.0.1');
      expect(result).toEqual(createdInvoice);
      expect(service.create).toHaveBeenCalledWith(dto, mockUser);
      expect(auditLogsService.logAction).toHaveBeenCalledWith(
        mockUser.id,
        'CREATE',
        'invoice',
        createdInvoice.id,
        null,
        createdInvoice,
        '127.0.0.1',
      );
    });
  });

  describe('update', () => {
    it('should update invoice, log audit trail, and return response', async () => {
      const dto: UpdateInvoiceDto = { discount: 10 };
      const oldInvoice = { id: 100, total: 100 } as any;
      const updatedInvoice = { id: 100, total: 90 } as any;
      service.findOne.mockResolvedValue(oldInvoice);
      service.update.mockResolvedValue(updatedInvoice);

      const result = await controller.update(100, dto, mockUser, '127.0.0.1');
      expect(result).toEqual(updatedInvoice);
      expect(service.update).toHaveBeenCalledWith(100, dto, mockUser);
      expect(auditLogsService.logAction).toHaveBeenCalledWith(
        mockUser.id,
        'UPDATE',
        'invoice',
        100,
        oldInvoice,
        updatedInvoice,
        '127.0.0.1',
      );
    });
  });

  describe('voidInvoice', () => {
    it('should void invoice and log audit trail', async () => {
      const oldInvoice = { id: 100, status: 'UNPAID' } as any;
      const voidedInvoice = { id: 100, status: 'VOIDED' } as any;
      service.findOne.mockResolvedValue(oldInvoice);
      service.voidInvoice.mockResolvedValue(voidedInvoice);

      const result = await controller.voidInvoice(100, mockUser, '127.0.0.1');
      expect(result).toEqual(voidedInvoice);
      expect(service.voidInvoice).toHaveBeenCalledWith(100, mockUser);
      expect(auditLogsService.logAction).toHaveBeenCalledWith(
        mockUser.id,
        'UPDATE',
        'invoice',
        100,
        oldInvoice,
        voidedInvoice,
        '127.0.0.1',
      );
    });
  });

  describe('recordPayment', () => {
    it('should record payment and log audit trail', async () => {
      const dto: CreatePaymentDto = { amount: 50, paymentMethod: PaymentMethod.CASH };
      const updatedInvoice = { id: 100, balanceDue: 0 } as any;
      service.recordPayment.mockResolvedValue(updatedInvoice);

      const result = await controller.recordPayment(100, dto, mockUser, '127.0.0.1');
      expect(result).toEqual(updatedInvoice);
      expect(service.recordPayment).toHaveBeenCalledWith(100, dto, mockUser);
      expect(auditLogsService.logAction).toHaveBeenCalledWith(
        mockUser.id,
        'CREATE',
        'payment',
        updatedInvoice.id,
        null,
        updatedInvoice,
        '127.0.0.1',
      );
    });
  });
});
