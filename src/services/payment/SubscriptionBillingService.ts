import { PrismaClient } from '@/lib/prisma-stub';
import type { 
  CreateSubscriptionRequest,
  BillingCalculation
} from '@/types/payment';
import { PaymentService } from './PaymentService';
import { InvoiceService } from './InvoiceService';
import { TaxCalculationService } from './TaxCalculationService';
import { PaymentAuditService } from './PaymentAuditService';
import { BILLABLE_SUBSCRIPTION_STATUSES, PAYMENT_DEFAULTS } from '@/types/payment';
import { logger } from '@/lib/logger';
import { Decimal } from '@/lib/prisma-stub';

export class SubscriptionBillingService {
  private prisma: PrismaClient;
  private paymentService: PaymentService;
  private invoiceService: InvoiceService;
  private taxService: TaxCalculationService;
  private auditService: PaymentAuditService;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.paymentService = new PaymentService(prisma);
    this.invoiceService = new InvoiceService(prisma);
    this.taxService = new TaxCalculationService();
    this.auditService = new PaymentAuditService(prisma);
  }

  /**
   * Create a new billing subscription
   */
  async createSubscription(
    request: CreateSubscriptionRequest,
    context?: { userId?: string; userAgent?: string; ipAddress?: string }
  ) {
    try {
      const customer = await this.prisma.customer.findUnique({
        where: { id: request.customerId },
        include: { 
          organization: true,
          family: {
            include: { members: true }
          }
        },
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      // Apply family discount if applicable
      const finalAmount = this.calculateSubscriptionAmount(
        request.amount,
        customer.family?.discountRate ? Number(customer.family.discountRate) : undefined
      );

      // Calculate billing dates
      const startDate = new Date();
      const endDate = this.calculatePeriodEnd(startDate, request.billingCycle);
      const nextBillingDate = request.trialDays 
        ? new Date(Date.now() + request.trialDays * 24 * 60 * 60 * 1000)
        : endDate;

      // Create subscription
      const subscription = await this.prisma.billingSubscription.create({
        data: {
          status: request.trialDays ? 'TRIALING' : 'ACTIVE',
          planName: request.planName,
          amount: new Decimal(finalAmount),
          billingCycle: request.billingCycle,
          currentPeriodStart: startDate,
          currentPeriodEnd: endDate,
          nextBillingDate,
          trialEnd: request.trialDays ? nextBillingDate : undefined,
          discountRate: request.discountRate ? new Decimal(request.discountRate) : undefined,
          customerId: request.customerId,
        },
      });

      // If no trial, create immediate payment
      if (!request.trialDays) {
        await this.processSubscriptionPayment(subscription.id);
      }

      // Audit log
      await this.auditService.logPaymentAction({
        action: 'CREATE',
        entityType: 'SUBSCRIPTION',
        entityId: subscription.id,
        newData: subscription,
        userId: context?.userId,
        userEmail: context?.userId ? await this.getUserEmail(context.userId) : undefined,
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
      }, customer.organizationId);

      logger.info('Subscription created', {
        subscriptionId: subscription.id,
        customerId: request.customerId,
        planName: request.planName,
        amount: finalAmount,
        billingCycle: request.billingCycle,
      });

      return subscription;
    } catch (error) {
      logger.error('Failed to create subscription', {
        error: error.message,
        request,
      });
      throw error;
    }
  }

  /**
   * Process subscription payment
   */
  async processSubscriptionPayment(subscriptionId: string) {
    try {
      const subscription = await this.prisma.billingSubscription.findUnique({
        where: { id: subscriptionId },
        include: {
          customer: {
            include: {
              organization: true,
              paymentMethods: {
                where: { isDefault: true, isActive: true },
                take: 1,
              },
            },
          },
        },
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      if (!BILLABLE_SUBSCRIPTION_STATUSES.includes(subscription.status)) {
        logger.info('Subscription not billable', {
          subscriptionId,
          status: subscription.status,
        });
        return;
      }

      // Check for default payment method
      const defaultPaymentMethod = subscription.customer.paymentMethods[0];
      if (!defaultPaymentMethod) {
        await this.handleFailedPayment(subscriptionId, 'No default payment method');
        return;
      }

      // Calculate billing amount
      const billingCalculation = this.paymentService.calculateBilling(
        Number(subscription.amount),
        subscription.discountRate ? Number(subscription.discountRate) : undefined
      );

      // Create payment
      const payment = await this.paymentService.createPayment({
        customerId: subscription.customerId,
        amount: billingCalculation.totalAmount,
        currency: subscription.currency,
        description: `${subscription.planName} - ${this.formatBillingPeriod(subscription)}`,
        paymentMethodId: defaultPaymentMethod.id,
        provider: defaultPaymentMethod.provider,
        type: 'SUBSCRIPTION',
        metadata: {
          subscriptionId,
          billingPeriod: this.formatBillingPeriod(subscription),
          planName: subscription.planName,
        },
      });

      // Update subscription with payment
      await this.prisma.billingSubscription.update({
        where: { id: subscriptionId },
        data: {
          status: payment.status === 'SUCCEEDED' ? 'ACTIVE' : 'PAST_DUE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: this.calculatePeriodEnd(new Date(), subscription.billingCycle),
          nextBillingDate: this.calculateNextBillingDate(subscription.billingCycle),
        },
      });

      logger.info('Subscription payment processed', {
        subscriptionId,
        paymentId: payment.id,
        amount: billingCalculation.totalAmount,
        status: payment.status,
      });

      return payment;
    } catch (error) {
      logger.error('Failed to process subscription payment', {
        error: error.message,
        subscriptionId,
      });
      
      await this.handleFailedPayment(subscriptionId, error.message);
      throw error;
    }
  }

  /**
   * Handle failed subscription payment
   */
  private async handleFailedPayment(subscriptionId: string, reason: string) {
    try {
      await this.prisma.billingSubscription.update({
        where: { id: subscriptionId },
        data: {
          status: 'PAST_DUE',
        },
      });

      // TODO: Send payment failure notification
      // await this.notificationService.sendPaymentFailureNotification(subscriptionId, reason);

      logger.warn('Subscription payment failed', {
        subscriptionId,
        reason,
      });
    } catch (error) {
      logger.error('Failed to handle subscription payment failure', {
        error: error.message,
        subscriptionId,
        reason,
      });
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true,
    context?: { userId?: string; userAgent?: string; ipAddress?: string }
  ) {
    try {
      const subscription = await this.prisma.billingSubscription.findUnique({
        where: { id: subscriptionId },
        include: { customer: true },
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      const updateData: any = {
        cancelAtPeriodEnd,
      };

      if (!cancelAtPeriodEnd) {
        updateData.status = 'CANCELED';
        updateData.canceledAt = new Date();
      }

      const updatedSubscription = await this.prisma.billingSubscription.update({
        where: { id: subscriptionId },
        data: updateData,
      });

      // Audit log
      await this.auditService.logPaymentAction({
        action: cancelAtPeriodEnd ? 'SCHEDULE_CANCEL' : 'CANCEL',
        entityType: 'SUBSCRIPTION',
        entityId: subscriptionId,
        oldData: { 
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        },
        newData: updateData,
        userId: context?.userId,
        userEmail: context?.userId ? await this.getUserEmail(context.userId) : undefined,
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
      }, subscription.customer.organizationId);

      logger.info('Subscription cancelled', {
        subscriptionId,
        cancelAtPeriodEnd,
        immediate: !cancelAtPeriodEnd,
      });

      return updatedSubscription;
    } catch (error) {
      logger.error('Failed to cancel subscription', {
        error: error.message,
        subscriptionId,
      });
      throw error;
    }
  }

  /**
   * Process all pending subscription billing
   */
  async processPendingBilling() {
    try {
      const now = new Date();
      
      // Find subscriptions due for billing
      const dueSubscriptions = await this.prisma.billingSubscription.findMany({
        where: {
          status: { in: BILLABLE_SUBSCRIPTION_STATUSES },
          nextBillingDate: { lte: now },
        },
        include: {
          customer: {
            include: { organization: true },
          },
        },
      });

      logger.info('Processing subscription billing', {
        count: dueSubscriptions.length,
      });

      const results = {
        processed: 0,
        failed: 0,
        errors: [] as string[],
      };

      for (const subscription of dueSubscriptions) {
        try {
          await this.processSubscriptionPayment(subscription.id);
          results.processed++;
        } catch (error) {
          results.failed++;
          results.errors.push(`Subscription ${subscription.id}: ${error.message}`);
        }
      }

      logger.info('Subscription billing completed', results);
      return results;
    } catch (error) {
      logger.error('Failed to process pending billing', {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Handle subscription upgrades/downgrades
   */
  async changeSubscriptionPlan(
    subscriptionId: string,
    newPlanName: string,
    newAmount: number,
    prorationPolicy: 'immediate' | 'next_cycle' = 'immediate',
    context?: { userId?: string; userAgent?: string; ipAddress?: string }
  ) {
    try {
      const subscription = await this.prisma.billingSubscription.findUnique({
        where: { id: subscriptionId },
        include: { customer: true },
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      const oldAmount = Number(subscription.amount);
      const amountDifference = newAmount - oldAmount;

      let prorationAmount = 0;
      
      if (prorationPolicy === 'immediate' && amountDifference !== 0) {
        // Calculate proration based on remaining days in current period
        const now = new Date();
        const periodEnd = subscription.currentPeriodEnd;
        const totalPeriodDays = this.calculatePeriodDays(subscription.billingCycle);
        const remainingDays = Math.ceil((periodEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
        
        prorationAmount = (amountDifference * remainingDays) / totalPeriodDays;
      }

      // Update subscription
      const updatedSubscription = await this.prisma.billingSubscription.update({
        where: { id: subscriptionId },
        data: {
          planName: newPlanName,
          amount: new Decimal(newAmount),
        },
      });

      // Process proration payment if needed
      if (prorationAmount > 0) {
        await this.paymentService.createPayment({
          customerId: subscription.customerId,
          amount: prorationAmount,
          currency: subscription.currency,
          description: `Plan change proration: ${subscription.planName} → ${newPlanName}`,
          provider: 'STRIPE', // Default to Stripe for prorations
          type: 'ONE_TIME',
          metadata: {
            subscriptionId,
            oldPlan: subscription.planName,
            newPlan: newPlanName,
            proration: true,
          },
        });
      }

      // Audit log
      await this.auditService.logPaymentAction({
        action: 'UPDATE',
        entityType: 'SUBSCRIPTION',
        entityId: subscriptionId,
        oldData: { 
          planName: subscription.planName, 
          amount: subscription.amount 
        },
        newData: { 
          planName: newPlanName, 
          amount: newAmount,
          prorationAmount,
        },
        userId: context?.userId,
        userEmail: context?.userId ? await this.getUserEmail(context.userId) : undefined,
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
      }, subscription.customer.organizationId);

      logger.info('Subscription plan changed', {
        subscriptionId,
        oldPlan: subscription.planName,
        newPlan: newPlanName,
        oldAmount,
        newAmount,
        prorationAmount,
      });

      return updatedSubscription;
    } catch (error) {
      logger.error('Failed to change subscription plan', {
        error: error.message,
        subscriptionId,
        newPlanName,
        newAmount,
      });
      throw error;
    }
  }

  /**
   * Get subscription analytics
   */
  async getSubscriptionAnalytics(organizationId: string, dateRange?: { from: Date; to: Date }) {
    try {
      const where: any = {
        customer: { organizationId },
      };

      if (dateRange) {
        where.createdAt = {
          gte: dateRange.from,
          lte: dateRange.to,
        };
      }

      const [
        totalSubscriptions,
        statusBreakdown,
        revenueMetrics,
        churnRate,
      ] = await Promise.all([
        this.prisma.billingSubscription.count({ where }),

        this.prisma.billingSubscription.groupBy({
          by: ['status'],
          where,
          _count: { _all: true },
          _sum: { amount: true },
        }),

        this.prisma.billingSubscription.aggregate({
          where: { 
            ...where,
            status: { in: BILLABLE_SUBSCRIPTION_STATUSES },
          },
          _sum: { amount: true },
          _avg: { amount: true },
        }),

        this.calculateChurnRate(organizationId, dateRange),
      ]);

      return {
        totalSubscriptions,
        activeSubscriptions: statusBreakdown.find(s => s.status === 'ACTIVE')?._count._all || 0,
        monthlyRecurringRevenue: Number(revenueMetrics._sum.amount || 0),
        averageRevenuePerUser: Number(revenueMetrics._avg.amount || 0),
        churnRate,
        statusBreakdown: statusBreakdown.reduce((acc, item) => {
          acc[item.status] = {
            count: item._count._all,
            revenue: Number(item._sum.amount || 0),
          };
          return acc;
        }, {} as Record<string, { count: number; revenue: number }>),
      };
    } catch (error) {
      logger.error('Failed to get subscription analytics', {
        error: error.message,
        organizationId,
      });
      throw error;
    }
  }

  /**
   * Calculate subscription amount with family discount
   */
  private calculateSubscriptionAmount(baseAmount: number, familyDiscountRate?: number): number {
    if (!familyDiscountRate || familyDiscountRate <= 0) {
      return baseAmount;
    }

    const discountAmount = baseAmount * (familyDiscountRate / 100);
    return baseAmount - discountAmount;
  }

  /**
   * Calculate period end date
   */
  private calculatePeriodEnd(startDate: Date, billingCycle: 'MONTHLY' | 'YEARLY' | 'WEEKLY'): Date {
    const endDate = new Date(startDate);
    
    switch (billingCycle) {
      case 'WEEKLY':
        endDate.setDate(endDate.getDate() + 7);
        break;
      case 'MONTHLY':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'YEARLY':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }
    
    return endDate;
  }

  /**
   * Calculate next billing date
   */
  private calculateNextBillingDate(billingCycle: 'MONTHLY' | 'YEARLY' | 'WEEKLY'): Date {
    return this.calculatePeriodEnd(new Date(), billingCycle);
  }

  /**
   * Calculate period days for proration
   */
  private calculatePeriodDays(billingCycle: 'MONTHLY' | 'YEARLY' | 'WEEKLY'): number {
    switch (billingCycle) {
      case 'WEEKLY':
        return 7;
      case 'MONTHLY':
        return 30; // Approximation
      case 'YEARLY':
        return 365;
    }
  }

  /**
   * Format billing period for display
   */
  private formatBillingPeriod(subscription: any): string {
    const start = subscription.currentPeriodStart.toLocaleDateString();
    const end = subscription.currentPeriodEnd.toLocaleDateString();
    return `${start} - ${end}`;
  }

  /**
   * Calculate churn rate
   */
  private async calculateChurnRate(organizationId: string, dateRange?: { from: Date; to: Date }) {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const [canceledCount, totalCount] = await Promise.all([
        this.prisma.billingSubscription.count({
          where: {
            customer: { organizationId },
            status: 'CANCELED',
            canceledAt: { gte: thirtyDaysAgo },
          },
        }),
        this.prisma.billingSubscription.count({
          where: {
            customer: { organizationId },
            createdAt: { lte: thirtyDaysAgo },
          },
        }),
      ]);

      return totalCount > 0 ? (canceledCount / totalCount) * 100 : 0;
    } catch (error) {
      logger.error('Failed to calculate churn rate', {
        error: error.message,
        organizationId,
      });
      return 0;
    }
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