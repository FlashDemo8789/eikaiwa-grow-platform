import { PrismaClient } from '@/lib/prisma-stub';
import type { 
  CreatePaymentRequest, 
  PaymentMethodRequest, 
  RefundRequest,
  PaymentAuditEntry,
  TaxCalculation,
  BillingCalculation
} from '@/types/payment';
import { StripePaymentService } from './providers/StripePaymentService';
import { PayPayService } from './providers/PayPayService';
import { KonbiniPaymentService } from './providers/KonbiniPaymentService';
import { PaymentAuditService } from './PaymentAuditService';
import { TaxCalculationService } from './TaxCalculationService';
import { JAPAN_TAX_RATES } from '@/types/payment';
import { logger } from '@/lib/logger';

export class PaymentService {
  private prisma: PrismaClient;
  private stripeService: StripePaymentService;
  private payPayService: PayPayService;
  private konbiniService: KonbiniPaymentService;
  private auditService: PaymentAuditService;
  private taxService: TaxCalculationService;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.stripeService = new StripePaymentService(prisma);
    this.payPayService = new PayPayService(prisma);
    this.konbiniService = new KonbiniPaymentService(prisma);
    this.auditService = new PaymentAuditService(prisma);
    this.taxService = new TaxCalculationService();
  }

  /**
   * Create a new payment
   */
  async createPayment(request: CreatePaymentRequest, context?: { userId?: string; userAgent?: string; ipAddress?: string }) {
    try {
      // Validate customer exists
      const customer = await this.prisma.customer.findUnique({
        where: { id: request.customerId },
        include: { organization: true }
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      // Calculate tax
      const taxCalculation = this.taxService.calculateTax(
        request.amount,
        'JP', // Japan
        customer.organization.settings as any
      );

      const totalAmount = request.amount + taxCalculation.taxAmount;

      // Create payment record
      const payment = await this.prisma.payment.create({
        data: {
          amount: new Decimal(totalAmount),
          currency: request.currency || 'JPY',
          status: 'PENDING',
          type: request.type,
          provider: request.provider,
          description: request.description,
          taxAmount: new Decimal(taxCalculation.taxAmount),
          taxRate: new Decimal(taxCalculation.taxRate),
          metadata: request.metadata,
          customerId: request.customerId,
          paymentMethodId: request.paymentMethodId,
        },
      });

      // Process payment with appropriate provider
      let providerResult;
      switch (request.provider) {
        case 'STRIPE':
          providerResult = await this.stripeService.processPayment(payment.id, request);
          break;
        case 'PAYPAY':
          providerResult = await this.payPayService.createQRPayment(payment.id, request);
          break;
        case 'KONBINI':
          providerResult = await this.konbiniService.createKonbiniPayment(payment.id, request);
          break;
        default:
          throw new Error(`Unsupported payment provider: ${request.provider}`);
      }

      // Update payment with provider result
      const updatedPayment = await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          externalId: providerResult.externalId,
          status: providerResult.status,
          metadata: {
            ...payment.metadata,
            ...providerResult.metadata,
          },
        },
        include: {
          customer: true,
          paymentMethod: true,
        },
      });

      // Audit log
      await this.auditService.logPaymentAction({
        action: 'CREATE',
        entityType: 'PAYMENT',
        entityId: payment.id,
        newData: updatedPayment,
        userId: context?.userId,
        userEmail: context?.userId ? await this.getUserEmail(context.userId) : undefined,
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
      }, customer.organizationId);

      logger.info('Payment created', {
        paymentId: payment.id,
        customerId: request.customerId,
        amount: totalAmount,
        provider: request.provider,
      });

      return updatedPayment;
    } catch (error) {
      logger.error('Failed to create payment', {
        error: error.message,
        request,
      });
      throw error;
    }
  }

  /**
   * Get payment by ID
   */
  async getPayment(paymentId: string) {
    return await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        customer: true,
        paymentMethod: true,
        invoice: true,
        subscription: true,
        refunds: true,
        konbiniPayment: true,
        payPayPayment: true,
      },
    });
  }

  /**
   * List payments with filters
   */
  async listPayments(filters: {
    customerId?: string;
    organizationId?: string;
    status?: string[];
    provider?: string[];
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters.organizationId) {
      where.customer = {
        organizationId: filters.organizationId,
      };
    }

    if (filters.status?.length) {
      where.status = { in: filters.status };
    }

    if (filters.provider?.length) {
      where.provider = { in: filters.provider };
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.createdAt.lte = filters.dateTo;
      }
    }

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: {
          customer: true,
          paymentMethod: true,
        },
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 50,
        skip: filters.offset || 0,
      }),
      this.prisma.payment.count({ where }),
    ]);

    return { payments, total };
  }

  /**
   * Process refund
   */
  async refundPayment(refundRequest: RefundRequest, context?: { userId?: string; userAgent?: string; ipAddress?: string }) {
    try {
      const payment = await this.getPayment(refundRequest.paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'SUCCEEDED') {
        throw new Error('Can only refund successful payments');
      }

      const refundAmount = refundRequest.amount || Number(payment.amount);

      // Check existing refunds
      const existingRefunds = await this.prisma.paymentRefund.findMany({
        where: { paymentId: refundRequest.paymentId },
      });

      const totalRefunded = existingRefunds.reduce(
        (sum, refund) => sum + Number(refund.amount),
        0
      );

      if (totalRefunded + refundAmount > Number(payment.amount)) {
        throw new Error('Refund amount exceeds payment amount');
      }

      // Process refund with provider
      let providerResult;
      switch (payment.provider) {
        case 'STRIPE':
          providerResult = await this.stripeService.processRefund(payment, refundAmount, refundRequest.reason);
          break;
        case 'PAYPAY':
          providerResult = await this.payPayService.processRefund(payment, refundAmount, refundRequest.reason);
          break;
        default:
          throw new Error(`Refunds not supported for provider: ${payment.provider}`);
      }

      // Create refund record
      const refund = await this.prisma.paymentRefund.create({
        data: {
          amount: new Decimal(refundAmount),
          reason: refundRequest.reason,
          status: providerResult.status,
          externalId: providerResult.externalId,
          processedAt: providerResult.processedAt,
          paymentId: refundRequest.paymentId,
        },
      });

      // Update payment status
      const newTotalRefunded = totalRefunded + refundAmount;
      const newPaymentStatus = newTotalRefunded >= Number(payment.amount) ? 'REFUNDED' : 'PARTIALLY_REFUNDED';

      await this.prisma.payment.update({
        where: { id: refundRequest.paymentId },
        data: { 
          status: newPaymentStatus,
          refundedAt: newTotalRefunded >= Number(payment.amount) ? new Date() : undefined,
        },
      });

      // Audit log
      await this.auditService.logPaymentAction({
        action: 'REFUND',
        entityType: 'PAYMENT',
        entityId: refundRequest.paymentId,
        newData: { refundAmount, reason: refundRequest.reason },
        userId: context?.userId,
        userEmail: context?.userId ? await this.getUserEmail(context.userId) : undefined,
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
      }, payment.customer.organizationId);

      logger.info('Payment refunded', {
        paymentId: refundRequest.paymentId,
        refundId: refund.id,
        amount: refundAmount,
        provider: payment.provider,
      });

      return refund;
    } catch (error) {
      logger.error('Failed to refund payment', {
        error: error.message,
        refundRequest,
      });
      throw error;
    }
  }

  /**
   * Add payment method
   */
  async addPaymentMethod(request: PaymentMethodRequest, context?: { userId?: string; userAgent?: string; ipAddress?: string }) {
    try {
      const customer = await this.prisma.customer.findUnique({
        where: { id: request.customerId },
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      // Process with appropriate provider
      let providerResult;
      switch (request.provider) {
        case 'STRIPE':
          providerResult = await this.stripeService.addPaymentMethod(customer, request);
          break;
        default:
          throw new Error(`Payment method creation not supported for provider: ${request.provider}`);
      }

      // If this is set as default, unset others
      if (request.isDefault) {
        await this.prisma.paymentMethod.updateMany({
          where: { customerId: request.customerId },
          data: { isDefault: false },
        });
      }

      const paymentMethod = await this.prisma.paymentMethod.create({
        data: {
          type: request.type,
          provider: request.provider,
          externalId: providerResult.externalId,
          last4: providerResult.last4,
          brand: providerResult.brand,
          expiryMonth: providerResult.expiryMonth,
          expiryYear: providerResult.expiryYear,
          isDefault: request.isDefault || false,
          metadata: providerResult.metadata,
          customerId: request.customerId,
        },
      });

      // Audit log
      await this.auditService.logPaymentAction({
        action: 'CREATE',
        entityType: 'PAYMENT_METHOD',
        entityId: paymentMethod.id,
        newData: paymentMethod,
        userId: context?.userId,
        userEmail: context?.userId ? await this.getUserEmail(context.userId) : undefined,
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
      }, customer.organizationId);

      return paymentMethod;
    } catch (error) {
      logger.error('Failed to add payment method', {
        error: error.message,
        request,
      });
      throw error;
    }
  }

  /**
   * Calculate billing amount with tax and discounts
   */
  calculateBilling(
    amount: number,
    discountRate?: number,
    taxRegion: string = 'JP'
  ): BillingCalculation {
    const discountAmount = discountRate ? amount * (discountRate / 100) : 0;
    const subtotal = amount - discountAmount;
    
    const taxCalculation = this.taxService.calculateTax(subtotal, taxRegion);
    
    return {
      subtotal,
      taxAmount: taxCalculation.taxAmount,
      discountAmount,
      totalAmount: subtotal + taxCalculation.taxAmount,
      taxRate: taxCalculation.taxRate,
      appliedDiscounts: discountRate ? [{ type: 'percentage', amount: discountAmount, percentage: discountRate }] : undefined,
    };
  }

  private async getUserEmail(userId: string): Promise<string | undefined> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });
      return user?.email;
    } catch {
      return undefined;
    }
  }
}

// Import Decimal properly
import { Decimal } from '@/lib/prisma-stub';