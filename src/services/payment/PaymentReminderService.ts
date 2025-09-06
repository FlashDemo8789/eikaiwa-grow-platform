import { PrismaClient } from '@prisma/client';
import type { 
  ReminderType, 
  NotificationMethod,
  ReminderStatus 
} from '@prisma/client';
import { PAYMENT_DEFAULTS } from '@/types/payment';
import { logger } from '@/lib/logger';
import { Decimal } from '@prisma/client/runtime/library';

export class PaymentReminderService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Schedule payment reminders for an invoice
   */
  async scheduleInvoiceReminders(invoiceId: string) {
    try {
      const invoice = await this.prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { customer: true },
      });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // Schedule reminders based on due date
      const reminderDays = PAYMENT_DEFAULTS.REMINDER_DAYS;
      
      for (const days of reminderDays) {
        const reminderDate = new Date(invoice.dueDate);
        reminderDate.setDate(reminderDate.getDate() - days);

        // Only schedule if reminder date is in the future
        if (reminderDate > new Date()) {
          await this.createReminder({
            type: 'PAYMENT_DUE',
            customerId: invoice.customerId,
            invoiceId,
            scheduledAt: reminderDate,
            method: 'EMAIL', // Default method
            recipient: invoice.customer.email,
            subject: `Payment Reminder - Invoice ${invoice.invoiceNumber}`,
            message: this.generateReminderMessage('PAYMENT_DUE', {
              customerName: invoice.customer.name || 'Customer',
              invoiceNumber: invoice.invoiceNumber,
              amount: Number(invoice.totalAmount),
              dueDate: invoice.dueDate,
              daysUntilDue: days,
            }),
          });
        }
      }

      // Schedule overdue reminder for the day after due date
      const overdueDate = new Date(invoice.dueDate);
      overdueDate.setDate(overdueDate.getDate() + 1);

      if (overdueDate > new Date()) {
        await this.createReminder({
          type: 'PAYMENT_OVERDUE',
          customerId: invoice.customerId,
          invoiceId,
          scheduledAt: overdueDate,
          method: 'EMAIL',
          recipient: invoice.customer.email,
          subject: `Payment Overdue - Invoice ${invoice.invoiceNumber}`,
          message: this.generateReminderMessage('PAYMENT_OVERDUE', {
            customerName: invoice.customer.name || 'Customer',
            invoiceNumber: invoice.invoiceNumber,
            amount: Number(invoice.totalAmount),
            dueDate: invoice.dueDate,
            daysOverdue: 1,
          }),
        });
      }

      logger.info('Invoice reminders scheduled', {
        invoiceId,
        invoiceNumber: invoice.invoiceNumber,
        remindersScheduled: reminderDays.length + 1,
      });
    } catch (error) {
      logger.error('Failed to schedule invoice reminders', {
        error: error.message,
        invoiceId,
      });
      throw error;
    }
  }

  /**
   * Schedule subscription renewal reminders
   */
  async scheduleSubscriptionReminders(subscriptionId: string) {
    try {
      const subscription = await this.prisma.billingSubscription.findUnique({
        where: { id: subscriptionId },
        include: { customer: true },
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // Schedule renewal reminder 3 days before next billing
      if (subscription.nextBillingDate) {
        const reminderDate = new Date(subscription.nextBillingDate);
        reminderDate.setDate(reminderDate.getDate() - 3);

        if (reminderDate > new Date()) {
          await this.createReminder({
            type: 'SUBSCRIPTION_RENEWAL',
            customerId: subscription.customerId,
            scheduledAt: reminderDate,
            method: 'EMAIL',
            recipient: subscription.customer.email,
            subject: `Subscription Renewal - ${subscription.planName}`,
            message: this.generateReminderMessage('SUBSCRIPTION_RENEWAL', {
              customerName: subscription.customer.name || 'Customer',
              planName: subscription.planName,
              amount: Number(subscription.amount),
              nextBillingDate: subscription.nextBillingDate,
            }),
          });
        }
      }

      // Schedule trial ending reminder if in trial
      if (subscription.trialEnd && subscription.status === 'TRIALING') {
        const reminderDate = new Date(subscription.trialEnd);
        reminderDate.setDate(reminderDate.getDate() - 2);

        if (reminderDate > new Date()) {
          await this.createReminder({
            type: 'TRIAL_ENDING',
            customerId: subscription.customerId,
            scheduledAt: reminderDate,
            method: 'EMAIL',
            recipient: subscription.customer.email,
            subject: `Trial Ending - ${subscription.planName}`,
            message: this.generateReminderMessage('TRIAL_ENDING', {
              customerName: subscription.customer.name || 'Customer',
              planName: subscription.planName,
              trialEndDate: subscription.trialEnd,
              amount: Number(subscription.amount),
            }),
          });
        }
      }

      logger.info('Subscription reminders scheduled', {
        subscriptionId,
        customerId: subscription.customerId,
      });
    } catch (error) {
      logger.error('Failed to schedule subscription reminders', {
        error: error.message,
        subscriptionId,
      });
      throw error;
    }
  }

  /**
   * Process scheduled reminders
   */
  async processScheduledReminders() {
    try {
      const now = new Date();
      
      const pendingReminders = await this.prisma.paymentReminder.findMany({
        where: {
          status: 'PENDING',
          scheduledAt: { lte: now },
        },
        include: {
          customer: true,
          invoice: true,
        },
        take: 100, // Process in batches
      });

      const results = {
        sent: 0,
        failed: 0,
      };

      for (const reminder of pendingReminders) {
        try {
          await this.sendReminder(reminder.id);
          results.sent++;
        } catch (error) {
          results.failed++;
          logger.error('Failed to send reminder', {
            reminderId: reminder.id,
            error: error.message,
          });
        }
      }

      logger.info('Processed scheduled reminders', {
        processed: pendingReminders.length,
        sent: results.sent,
        failed: results.failed,
      });

      return results;
    } catch (error) {
      logger.error('Failed to process scheduled reminders', {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Send a specific reminder
   */
  async sendReminder(reminderId: string) {
    try {
      const reminder = await this.prisma.paymentReminder.findUnique({
        where: { id: reminderId },
        include: {
          customer: true,
          invoice: true,
        },
      });

      if (!reminder) {
        throw new Error('Reminder not found');
      }

      // Send notification based on method
      let sent = false;
      switch (reminder.method) {
        case 'EMAIL':
          sent = await this.sendEmailReminder(reminder);
          break;
        case 'SMS':
          sent = await this.sendSMSReminder(reminder);
          break;
        case 'LINE':
          sent = await this.sendLineReminder(reminder);
          break;
        default:
          throw new Error(`Unsupported notification method: ${reminder.method}`);
      }

      // Update reminder status
      await this.prisma.paymentReminder.update({
        where: { id: reminderId },
        data: {
          status: sent ? 'SENT' : 'FAILED',
          sentAt: sent ? new Date() : undefined,
        },
      });

      return sent;
    } catch (error) {
      // Mark reminder as failed
      await this.prisma.paymentReminder.update({
        where: { id: reminderId },
        data: { status: 'FAILED' },
      }).catch(() => {}); // Ignore update errors

      throw error;
    }
  }

  /**
   * Create a payment reminder
   */
  private async createReminder(data: {
    type: ReminderType;
    customerId: string;
    invoiceId?: string;
    scheduledAt: Date;
    method: NotificationMethod;
    recipient: string;
    subject?: string;
    message: string;
  }) {
    return await this.prisma.paymentReminder.create({
      data: {
        type: data.type,
        status: 'PENDING',
        scheduledAt: data.scheduledAt,
        method: data.method,
        recipient: data.recipient,
        subject: data.subject,
        message: data.message,
        customerId: data.customerId,
        invoiceId: data.invoiceId,
      },
    });
  }

  /**
   * Send email reminder
   */
  private async sendEmailReminder(reminder: any): Promise<boolean> {
    try {
      // TODO: Integrate with email service (Resend, SendGrid, etc.)
      logger.info('Sending email reminder', {
        reminderId: reminder.id,
        recipient: reminder.recipient,
        type: reminder.type,
      });

      // Simulate email sending
      return true;
    } catch (error) {
      logger.error('Failed to send email reminder', {
        error: error.message,
        reminderId: reminder.id,
      });
      return false;
    }
  }

  /**
   * Send SMS reminder
   */
  private async sendSMSReminder(reminder: any): Promise<boolean> {
    try {
      // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
      logger.info('Sending SMS reminder', {
        reminderId: reminder.id,
        recipient: reminder.recipient,
        type: reminder.type,
      });

      return true;
    } catch (error) {
      logger.error('Failed to send SMS reminder', {
        error: error.message,
        reminderId: reminder.id,
      });
      return false;
    }
  }

  /**
   * Send LINE reminder
   */
  private async sendLineReminder(reminder: any): Promise<boolean> {
    try {
      // TODO: Integrate with LINE messaging API
      logger.info('Sending LINE reminder', {
        reminderId: reminder.id,
        recipient: reminder.recipient,
        type: reminder.type,
      });

      return true;
    } catch (error) {
      logger.error('Failed to send LINE reminder', {
        error: error.message,
        reminderId: reminder.id,
      });
      return false;
    }
  }

  /**
   * Generate reminder message content
   */
  private generateReminderMessage(type: ReminderType, data: any): string {
    switch (type) {
      case 'PAYMENT_DUE':
        return `
Dear ${data.customerName},

This is a friendly reminder that your payment is due in ${data.daysUntilDue} day(s).

Invoice: ${data.invoiceNumber}
Amount: ¥${data.amount.toLocaleString()}
Due Date: ${data.dueDate.toLocaleDateString()}

Please process your payment by the due date to avoid any late fees.

Thank you for your business!
        `.trim();

      case 'PAYMENT_OVERDUE':
        return `
Dear ${data.customerName},

Your payment is now overdue by ${data.daysOverdue} day(s).

Invoice: ${data.invoiceNumber}
Amount: ¥${data.amount.toLocaleString()}
Original Due Date: ${data.dueDate.toLocaleDateString()}

Please process your payment immediately to avoid additional late fees.

If you have already made this payment, please disregard this notice.
        `.trim();

      case 'SUBSCRIPTION_RENEWAL':
        return `
Dear ${data.customerName},

Your subscription for ${data.planName} will renew in 3 days.

Next Billing Date: ${data.nextBillingDate.toLocaleDateString()}
Amount: ¥${data.amount.toLocaleString()}

Please ensure your payment method is up to date to avoid any service interruptions.
        `.trim();

      case 'TRIAL_ENDING':
        return `
Dear ${data.customerName},

Your trial for ${data.planName} is ending soon!

Trial End Date: ${data.trialEndDate.toLocaleDateString()}
Monthly Fee: ¥${data.amount.toLocaleString()}

To continue using our service, please ensure you have a valid payment method on file.
        `.trim();

      case 'PAYMENT_FAILED':
        return `
Dear ${data.customerName},

Your recent payment attempt was unsuccessful.

Please update your payment method or try again with a different payment option.

If you continue to experience issues, please contact our support team.
        `.trim();

      default:
        return 'Payment reminder notification.';
    }
  }

  /**
   * Cancel all reminders for an invoice (e.g., when paid)
   */
  async cancelInvoiceReminders(invoiceId: string) {
    try {
      await this.prisma.paymentReminder.updateMany({
        where: {
          invoiceId,
          status: 'PENDING',
        },
        data: { status: 'CANCELED' },
      });

      logger.info('Cancelled invoice reminders', { invoiceId });
    } catch (error) {
      logger.error('Failed to cancel invoice reminders', {
        error: error.message,
        invoiceId,
      });
    }
  }

  /**
   * Get reminder statistics
   */
  async getReminderStats(organizationId: string, dateRange?: { from: Date; to: Date }) {
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
        totalReminders,
        statusBreakdown,
        methodBreakdown,
        typeBreakdown,
      ] = await Promise.all([
        this.prisma.paymentReminder.count({ where }),

        this.prisma.paymentReminder.groupBy({
          by: ['status'],
          where,
          _count: { _all: true },
        }),

        this.prisma.paymentReminder.groupBy({
          by: ['method'],
          where,
          _count: { _all: true },
        }),

        this.prisma.paymentReminder.groupBy({
          by: ['type'],
          where,
          _count: { _all: true },
        }),
      ]);

      return {
        totalReminders,
        statusBreakdown: statusBreakdown.reduce((acc, item) => {
          acc[item.status] = item._count._all;
          return acc;
        }, {} as Record<string, number>),
        methodBreakdown: methodBreakdown.reduce((acc, item) => {
          acc[item.method] = item._count._all;
          return acc;
        }, {} as Record<string, number>),
        typeBreakdown: typeBreakdown.reduce((acc, item) => {
          acc[item.type] = item._count._all;
          return acc;
        }, {} as Record<string, number>),
      };
    } catch (error) {
      logger.error('Failed to get reminder stats', {
        error: error.message,
        organizationId,
      });
      throw error;
    }
  }
}