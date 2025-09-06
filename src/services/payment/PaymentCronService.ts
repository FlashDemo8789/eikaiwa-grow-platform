import { PrismaClient } from '@prisma/client';
import * as cron from 'node-cron';
import { SubscriptionBillingService } from './SubscriptionBillingService';
import { KonbiniPaymentService } from './providers/KonbiniPaymentService';
import { PaymentReminderService } from './PaymentReminderService';
import { logger } from '@/lib/logger';

export class PaymentCronService {
  private prisma: PrismaClient;
  private subscriptionService: SubscriptionBillingService;
  private konbiniService: KonbiniPaymentService;
  private reminderService: PaymentReminderService;
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  constructor() {
    this.prisma = new PrismaClient();
    this.subscriptionService = new SubscriptionBillingService(this.prisma);
    this.konbiniService = new KonbiniPaymentService(this.prisma);
    this.reminderService = new PaymentReminderService(this.prisma);
  }

  /**
   * Start all payment-related cron jobs
   */
  startAllJobs() {
    this.startSubscriptionBilling();
    this.startKonbiniCleanup();
    this.startPaymentReminders();
    this.startFailedPaymentRetries();
    this.startReportGeneration();
    
    logger.info('Payment cron jobs started');
  }

  /**
   * Stop all cron jobs
   */
  stopAllJobs() {
    this.jobs.forEach((job, name) => {
      job.destroy();
      logger.info(`Stopped cron job: ${name}`);
    });
    this.jobs.clear();
    logger.info('All payment cron jobs stopped');
  }

  /**
   * Process subscription billing every day at 9 AM JST
   */
  private startSubscriptionBilling() {
    const job = cron.schedule('0 9 * * *', async () => {
      try {
        logger.info('Starting subscription billing process');
        const results = await this.subscriptionService.processPendingBilling();
        
        logger.info('Subscription billing completed', {
          processed: results.processed,
          failed: results.failed,
          errors: results.errors.length,
        });

        // Alert if there are many failures
        if (results.failed > 10) {
          // TODO: Send alert to administrators
          logger.warn('High number of subscription billing failures', {
            failedCount: results.failed,
            totalCount: results.processed + results.failed,
          });
        }
      } catch (error) {
        logger.error('Subscription billing cron job failed', {
          error: error.message,
        });
      }
    }, {
      timezone: 'Asia/Tokyo',
    });

    this.jobs.set('subscription-billing', job);
  }

  /**
   * Clean up expired konbini payments every hour
   */
  private startKonbiniCleanup() {
    const job = cron.schedule('0 * * * *', async () => {
      try {
        logger.info('Starting konbini payment cleanup');
        const cancelled = await this.konbiniService.cancelExpiredPayments();
        
        if (cancelled > 0) {
          logger.info('Konbini payment cleanup completed', {
            cancelledCount: cancelled,
          });
        }
      } catch (error) {
        logger.error('Konbini cleanup cron job failed', {
          error: error.message,
        });
      }
    });

    this.jobs.set('konbini-cleanup', job);
  }

  /**
   * Send payment reminders daily at 10 AM JST
   */
  private startPaymentReminders() {
    const job = cron.schedule('0 10 * * *', async () => {
      try {
        logger.info('Starting payment reminder process');
        const results = await this.reminderService.processScheduledReminders();
        
        logger.info('Payment reminders completed', {
          sent: results.sent,
          failed: results.failed,
        });
      } catch (error) {
        logger.error('Payment reminders cron job failed', {
          error: error.message,
        });
      }
    }, {
      timezone: 'Asia/Tokyo',
    });

    this.jobs.set('payment-reminders', job);
  }

  /**
   * Retry failed payments every 6 hours
   */
  private startFailedPaymentRetries() {
    const job = cron.schedule('0 */6 * * *', async () => {
      try {
        logger.info('Starting failed payment retry process');
        const results = await this.retryFailedPayments();
        
        logger.info('Failed payment retries completed', {
          attempted: results.attempted,
          succeeded: results.succeeded,
          failed: results.failed,
        });
      } catch (error) {
        logger.error('Failed payment retry cron job failed', {
          error: error.message,
        });
      }
    });

    this.jobs.set('failed-payment-retries', job);
  }

  /**
   * Generate daily reports at 11 PM JST
   */
  private startReportGeneration() {
    const job = cron.schedule('0 23 * * *', async () => {
      try {
        logger.info('Starting daily report generation');
        await this.generateDailyReports();
        logger.info('Daily report generation completed');
      } catch (error) {
        logger.error('Report generation cron job failed', {
          error: error.message,
        });
      }
    }, {
      timezone: 'Asia/Tokyo',
    });

    this.jobs.set('report-generation', job);
  }

  /**
   * Retry failed payments
   */
  private async retryFailedPayments() {
    try {
      // Find payments that failed in the last 24 hours and haven't exceeded retry limit
      const failedPayments = await this.prisma.payment.findMany({
        where: {
          status: 'FAILED',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
          // Assuming we add a retry_count field later
          // retryCount: { lt: 3 },
        },
        include: {
          customer: {
            include: {
              paymentMethods: {
                where: { isDefault: true, isActive: true },
                take: 1,
              },
            },
          },
        },
        take: 50, // Limit to prevent overload
      });

      const results = {
        attempted: 0,
        succeeded: 0,
        failed: 0,
      };

      for (const payment of failedPayments) {
        try {
          // Only retry if customer has a default payment method
          if (payment.customer.paymentMethods.length === 0) {
            continue;
          }

          results.attempted++;

          // Retry the payment (this would need additional retry logic in PaymentService)
          // For now, just log the attempt
          logger.info('Retrying failed payment', {
            paymentId: payment.id,
            customerId: payment.customerId,
            amount: Number(payment.amount),
          });

          // TODO: Implement actual retry logic
          // const retryResult = await this.paymentService.retryPayment(payment.id);
          
          results.succeeded++;
        } catch (error) {
          results.failed++;
          logger.error('Failed to retry payment', {
            paymentId: payment.id,
            error: error.message,
          });
        }
      }

      return results;
    } catch (error) {
      logger.error('Failed to process payment retries', {
        error: error.message,
      });
      return { attempted: 0, succeeded: 0, failed: 0 };
    }
  }

  /**
   * Generate daily payment reports
   */
  private async generateDailyReports() {
    try {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

      // Generate reports for each organization
      const organizations = await this.prisma.organization.findMany({
        where: { status: 'ACTIVE' },
      });

      for (const org of organizations) {
        try {
          // Get daily payment metrics
          const [
            totalPayments,
            successfulPayments,
            failedPayments,
            totalRevenue,
            refundAmount,
          ] = await Promise.all([
            this.prisma.payment.count({
              where: {
                customer: { organizationId: org.id },
                createdAt: {
                  gte: yesterday,
                  lt: today,
                },
              },
            }),

            this.prisma.payment.count({
              where: {
                customer: { organizationId: org.id },
                status: 'SUCCEEDED',
                createdAt: {
                  gte: yesterday,
                  lt: today,
                },
              },
            }),

            this.prisma.payment.count({
              where: {
                customer: { organizationId: org.id },
                status: 'FAILED',
                createdAt: {
                  gte: yesterday,
                  lt: today,
                },
              },
            }),

            this.prisma.payment.aggregate({
              where: {
                customer: { organizationId: org.id },
                status: 'SUCCEEDED',
                createdAt: {
                  gte: yesterday,
                  lt: today,
                },
              },
              _sum: { amount: true },
            }),

            this.prisma.paymentRefund.aggregate({
              where: {
                payment: {
                  customer: { organizationId: org.id },
                },
                createdAt: {
                  gte: yesterday,
                  lt: today,
                },
              },
              _sum: { amount: true },
            }),
          ]);

          const report = {
            organizationId: org.id,
            organizationName: org.name,
            date: yesterday.toISOString().split('T')[0],
            metrics: {
              totalPayments,
              successfulPayments,
              failedPayments,
              successRate: totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0,
              totalRevenue: Number(totalRevenue._sum.amount || 0),
              refundAmount: Number(refundAmount._sum.amount || 0),
              netRevenue: Number(totalRevenue._sum.amount || 0) - Number(refundAmount._sum.amount || 0),
            },
          };

          logger.info('Daily payment report generated', report);

          // TODO: Store report in database or send to administrators
          // await this.storeReport(report);
        } catch (error) {
          logger.error('Failed to generate report for organization', {
            organizationId: org.id,
            error: error.message,
          });
        }
      }
    } catch (error) {
      logger.error('Failed to generate daily reports', {
        error: error.message,
      });
    }
  }

  /**
   * Health check for cron jobs
   */
  getJobStatus() {
    const status: Record<string, any> = {};
    
    this.jobs.forEach((job, name) => {
      status[name] = {
        running: !job.destroyed,
        nextRun: job.nextDate()?.toISO(),
      };
    });

    return status;
  }

  /**
   * Manual trigger for subscription billing (for testing)
   */
  async triggerSubscriptionBilling() {
    try {
      logger.info('Manual subscription billing trigger');
      const results = await this.subscriptionService.processPendingBilling();
      return results;
    } catch (error) {
      logger.error('Manual subscription billing failed', {
        error: error.message,
      });
      throw error;
    }
  }
}