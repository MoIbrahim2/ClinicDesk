import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { Payment, PaymentMethod } from './entities/payment.entity';
import { Visit } from '../visits/entities/visit.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Service } from '../services/entities/service.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepository: Repository<InvoiceItem>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Visit)
    private readonly visitRepository: Repository<Visit>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto, currentUser: User): Promise<Invoice> {
    const { patientId, visitId, discount = 0, tax = 0, items } = createInvoiceDto;

    // Validate Patient
    const patient = await this.patientRepository.findOne({ where: { id: patientId } });
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${patientId} not found`);
    }

    // Generate Unique Invoice Number (INV-YYYYMM-XXXXX)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const invoiceNumber = `INV-${year}${month}-${randomDigits}`;

    // Compute Subtotal
    let subtotal = 0;
    const invoiceItems = items.map((item) => {
      const linePrice = Number((item.quantity * item.unitPrice).toFixed(2));
      subtotal += linePrice;

      return this.invoiceItemRepository.create({
        serviceId: item.serviceId,
        description: item.description,
        descriptionAr: item.descriptionAr,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalLinePrice: linePrice,
      });
    });

    subtotal = Number(subtotal.toFixed(2));
    const total = Number((subtotal - discount + tax).toFixed(2));

    if (total < 0) {
      throw new BadRequestException('Total invoice amount cannot be less than zero');
    }

    const invoice = this.invoiceRepository.create({
      invoiceNumber,
      patientId,
      visitId,
      status: InvoiceStatus.UNPAID,
      subtotal,
      discount,
      tax,
      total,
      balanceDue: total,
      items: invoiceItems,
    });

    return this.invoiceRepository.save(invoice);
  }

  async createFromVisit(visit: Visit): Promise<Invoice> {
    // Check if invoice already exists for this visit
    const existing = await this.invoiceRepository.findOne({ where: { visitId: visit.id } });
    if (existing) {
      return existing;
    }

    // Try to find a 'CONSULTATION' service in catalog
    const consultationService = await this.serviceRepository.createQueryBuilder('service')
      .where('LOWER(service.code) = LOWER(:code)', { code: 'CONSULTATION' })
      .getOne();

    const price = consultationService ? Number(consultationService.price) : 200.00;
    const serviceId = consultationService ? consultationService.id : undefined;

    const createDto: CreateInvoiceDto = {
      patientId: visit.patientId,
      visitId: visit.id,
      discount: 0,
      tax: 0,
      items: [
        {
          serviceId,
          description: consultationService ? consultationService.name : 'Consultation Fee',
          descriptionAr: consultationService?.nameAr || 'كشف الطبيب',
          quantity: 1,
          unitPrice: price,
        },
      ],
    };

    // System user representation for auto-invoices (role: admin)
    // We can just construct a mock admin user to pass check (not needed for directly calling service code, but we do it anyway)
    const mockAdmin = new User();
    mockAdmin.id = visit.doctorId; // Or fallback to visit.doctorId
    
    return this.create(createDto, mockAdmin);
  }

  async findAll(
    query: {
      patientId?: number;
      status?: InvoiceStatus;
      page?: number;
      limit?: number;
    },
    currentUser: User,
  ) {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.max(1, Math.min(100, Number(query.limit || 10)));
    const skip = (page - 1) * limit;

    const queryBuilder = this.invoiceRepository.createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.patient', 'patient')
      .leftJoinAndSelect('invoice.visit', 'visit')
      .leftJoinAndSelect('invoice.items', 'items')
      .leftJoinAndSelect('invoice.payments', 'payments');

    // Filter by patient role or query params
    if (currentUser.role.name === 'patient') {
      const patient = await this.patientRepository.findOne({ where: { userId: currentUser.id } });
      if (!patient) {
        throw new NotFoundException('No patient profile found linked to your user account');
      }
      queryBuilder.andWhere('invoice.patientId = :forcedPatientId', { forcedPatientId: patient.id });
    } else {
      if (query.patientId) {
        queryBuilder.andWhere('invoice.patientId = :patientId', { patientId: query.patientId });
      }
      if (query.status) {
        queryBuilder.andWhere('invoice.status = :status', { status: query.status });
      }
    }

    queryBuilder.orderBy('invoice.createdAt', 'DESC');
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

  async findOne(id: number, currentUser: User): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: {
        patient: true,
        visit: true,
        items: true,
        payments: {
          creator: true,
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    // Access control
    if (currentUser.role.name === 'patient') {
      const patient = await this.patientRepository.findOne({ where: { userId: currentUser.id } });
      if (!patient || invoice.patientId !== patient.id) {
        throw new ForbiddenException('You are not authorized to view this invoice');
      }
    }

    return invoice;
  }

  async update(id: number, updateInvoiceDto: UpdateInvoiceDto, currentUser: User): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: { items: true, payments: true },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    // Immutability Check
    if (invoice.status === InvoiceStatus.PAID || invoice.status === InvoiceStatus.VOIDED) {
      throw new BadRequestException('Paid or voided invoices cannot be modified');
    }

    const { discount, tax, items } = updateInvoiceDto;

    if (discount !== undefined) invoice.discount = discount;
    if (tax !== undefined) invoice.tax = tax;

    if (items !== undefined) {
      if (items.length === 0) {
        throw new BadRequestException('An invoice must contain at least one line item');
      }

      // Delete old items
      await this.invoiceItemRepository.delete({ invoiceId: id });

      // Create new items
      invoice.items = items.map((item) => {
        const linePrice = Number((item.quantity * item.unitPrice).toFixed(2));
        return this.invoiceItemRepository.create({
          serviceId: item.serviceId,
          description: item.description,
          descriptionAr: item.descriptionAr,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalLinePrice: linePrice,
        });
      });
    }

    // Recalculate Subtotal
    let subtotal = 0;
    const currentItems = items ? invoice.items : await this.invoiceItemRepository.find({ where: { invoiceId: id } });
    currentItems.forEach((item) => {
      subtotal += Number(item.totalLinePrice);
    });

    invoice.subtotal = Number(subtotal.toFixed(2));
    const discountVal = Number(invoice.discount || 0);
    const taxVal = Number(invoice.tax || 0);
    const total = Number((invoice.subtotal - discountVal + taxVal).toFixed(2));

    if (total < 0) {
      throw new BadRequestException('Total invoice amount cannot be less than zero');
    }

    // Check that new total is not less than already recorded payments
    const paymentsSum = invoice.payments ? invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0) : 0;
    if (total < paymentsSum) {
      throw new BadRequestException(`New total (${total}) cannot be less than already paid amount (${paymentsSum})`);
    }

    invoice.total = total;
    invoice.balanceDue = Number((total - paymentsSum).toFixed(2));

    // Update Status
    if (invoice.balanceDue === 0) {
      invoice.status = InvoiceStatus.PAID;
    } else if (invoice.balanceDue < total) {
      invoice.status = InvoiceStatus.PARTIALLY_PAID;
    } else {
      invoice.status = InvoiceStatus.UNPAID;
    }

    await this.invoiceRepository.save(invoice);
    return this.findOne(id, currentUser);
  }

  async voidInvoice(id: number, currentUser: User): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: { payments: true },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    if (invoice.status === InvoiceStatus.VOIDED) {
      throw new BadRequestException('Invoice is already voided');
    }

    // Check for payments
    if (invoice.payments && invoice.payments.length > 0) {
      throw new BadRequestException('Cannot void an invoice that has recorded payments');
    }

    invoice.status = InvoiceStatus.VOIDED;
    invoice.balanceDue = 0;

    await this.invoiceRepository.save(invoice);
    return this.findOne(id, currentUser);
  }

  async recordPayment(id: number, createPaymentDto: CreatePaymentDto, currentUser: User): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: { payments: true },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    if (invoice.status === InvoiceStatus.VOIDED) {
      throw new BadRequestException('Cannot record payments on a voided invoice');
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Invoice is already fully paid');
    }

    const { amount, paymentMethod, notes } = createPaymentDto;

    // Enforce that payment amount does not exceed balance due
    if (Number(amount.toFixed(2)) > Number(Number(invoice.balanceDue).toFixed(2))) {
      throw new BadRequestException(`Payment amount (${amount}) exceeds outstanding balance due (${invoice.balanceDue})`);
    }

    // Create payment
    const payment = this.paymentRepository.create({
      invoiceId: id,
      amount,
      paymentMethod,
      notes,
      createdById: currentUser.id,
    });

    await this.paymentRepository.save(payment);

    // Update balance and status
    const currentBalance = Number(invoice.balanceDue);
    const newBalance = Number((currentBalance - amount).toFixed(2));
    invoice.balanceDue = newBalance;

    if (newBalance === 0) {
      invoice.status = InvoiceStatus.PAID;
    } else {
      invoice.status = InvoiceStatus.PARTIALLY_PAID;
    }

    await this.invoiceRepository.save(invoice);
    return this.findOne(id, currentUser);
  }

  async getSummary() {
    const invoices = await this.invoiceRepository.find({
      where: {},
      relations: { payments: true },
    });

    // filter out voided invoices
    const activeInvoices = invoices.filter((inv) => inv.status !== InvoiceStatus.VOIDED);

    const totalBilled = activeInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);
    const totalOutstanding = activeInvoices.reduce((sum, inv) => sum + Number(inv.balanceDue), 0);
    
    // Sum all payments on active invoices
    const totalPaid = activeInvoices.reduce((sum, inv) => {
      const pSum = inv.payments ? inv.payments.reduce((pSub, p) => pSub + Number(p.amount), 0) : 0;
      return sum + pSum;
    }, 0);

    // Group by payment method
    const methodBreakdown: Record<string, number> = {
      cash: 0,
      card: 0,
      insurance: 0,
      other: 0,
    };

    activeInvoices.forEach((inv) => {
      if (inv.payments) {
        inv.payments.forEach((p) => {
          if (methodBreakdown[p.paymentMethod] !== undefined) {
            methodBreakdown[p.paymentMethod] += Number(p.amount);
          }
        });
      }
    });

    return {
      totalBilled: Number(totalBilled.toFixed(2)),
      totalPaid: Number(totalPaid.toFixed(2)),
      totalOutstanding: Number(totalOutstanding.toFixed(2)),
      paymentMethodBreakdown: {
        cash: Number(methodBreakdown.cash.toFixed(2)),
        card: Number(methodBreakdown.card.toFixed(2)),
        insurance: Number(methodBreakdown.insurance.toFixed(2)),
        other: Number(methodBreakdown.other.toFixed(2)),
      },
    };
  }
}
