import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe, HttpCode, HttpStatus, Ip } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { InvoiceStatus } from './entities/invoice.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@ApiTags('invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  @Get('summary')
  @Roles('admin')
  @ApiOperation({ summary: 'Get total aggregate financial summary (Admin only)' })
  @ApiResponse({ status: 200, description: 'Aggregate financial statistics' })
  getSummary() {
    return this.invoicesService.getSummary();
  }

  @Post()
  @Roles('admin', 'receptionist')
  @ApiOperation({ summary: 'Create a manual/standalone invoice' })
  @ApiResponse({ status: 201, description: 'Invoice successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid fields' })
  async create(
    @Body() createInvoiceDto: CreateInvoiceDto,
    @CurrentUser() user: User,
    @Ip() ip: string,
  ) {
    const invoice = await this.invoicesService.create(createInvoiceDto, user);
    await this.auditLogsService.logAction(user.id, 'CREATE', 'invoice', invoice.id, null, invoice, ip);
    return invoice;
  }

  @Get()
  @Roles('admin', 'receptionist', 'patient')
  @ApiOperation({ summary: 'List invoices with filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'patientId', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: InvoiceStatus })
  @ApiResponse({ status: 200, description: 'List of invoices' })
  findAll(
    @CurrentUser() user: User,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('patientId') patientId?: number,
    @Query('status') status?: InvoiceStatus,
  ) {
    return this.invoicesService.findAll({ page, limit, patientId, status }, user);
  }

  @Get(':id')
  @Roles('admin', 'receptionist', 'patient')
  @ApiOperation({ summary: 'Get single invoice details' })
  @ApiResponse({ status: 200, description: 'Invoice details' })
  @ApiResponse({ status: 403, description: 'Forbidden access' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.invoicesService.findOne(id, user);
  }

  @Patch(':id')
  @Roles('admin', 'receptionist')
  @ApiOperation({ summary: 'Update an unpaid invoice (apply discount, tax, or items)' })
  @ApiResponse({ status: 200, description: 'Invoice successfully updated' })
  @ApiResponse({ status: 400, description: 'Invoice is paid/voided or total is negative' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
    @CurrentUser() user: User,
    @Ip() ip: string,
  ) {
    const oldInv = await this.invoicesService.findOne(id, user);
    const updated = await this.invoicesService.update(id, updateInvoiceDto, user);
    await this.auditLogsService.logAction(user.id, 'UPDATE', 'invoice', id, oldInv, updated, ip);
    return updated;
  }

  @Post(':id/void')
  @Roles('admin', 'receptionist')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Void an invoice with no payments' })
  @ApiResponse({ status: 200, description: 'Invoice successfully voided' })
  @ApiResponse({ status: 400, description: 'Invoice has payments or is already voided' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async voidInvoice(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
    @Ip() ip: string,
  ) {
    const oldInv = await this.invoicesService.findOne(id, user);
    const updated = await this.invoicesService.voidInvoice(id, user);
    await this.auditLogsService.logAction(user.id, 'UPDATE', 'invoice', id, oldInv, updated, ip);
    return updated;
  }

  @Post(':id/payments')
  @Roles('admin', 'receptionist')
  @ApiOperation({ summary: 'Record a payment against an invoice' })
  @ApiResponse({ status: 201, description: 'Payment recorded and invoice updated' })
  @ApiResponse({ status: 400, description: 'Amount exceeds balance due or invalid fields' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async recordPayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() createPaymentDto: CreatePaymentDto,
    @CurrentUser() user: User,
    @Ip() ip: string,
  ) {
    const result = await this.invoicesService.recordPayment(id, createPaymentDto, user);
    await this.auditLogsService.logAction(user.id, 'CREATE', 'payment', result.id, null, result, ip);
    return result;
  }
}
