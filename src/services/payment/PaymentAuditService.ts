import { PrismaClient } from '@prisma/client';
import type { PaymentAuditEntry } from '@/types/payment';
import { logger } from '@/lib/logger';

export class PaymentAuditService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Log payment-related action for audit trail
   */
  async logPaymentAction(
    auditEntry: PaymentAuditEntry,
    organizationId: string
  ) {
    try {
      await this.prisma.paymentAuditLog.create({
        data: {
          action: auditEntry.action,
          entityType: auditEntry.entityType,
          entityId: auditEntry.entityId,
          oldData: auditEntry.oldData || {},
          newData: auditEntry.newData || {},
          userId: auditEntry.userId,
          userEmail: auditEntry.userEmail,
          ipAddress: auditEntry.ipAddress,
          userAgent: auditEntry.userAgent,
          organizationId,
        },
      });

      logger.info('Payment audit log created', {
        action: auditEntry.action,
        entityType: auditEntry.entityType,
        entityId: auditEntry.entityId,
        organizationId,
      });
    } catch (error) {
      logger.error('Failed to create payment audit log', {
        error: error.message,
        auditEntry,
        organizationId,
      });
      // Don't throw error to avoid breaking the main flow
    }
  }

  /**
   * Get audit logs for an entity
   */
  async getEntityAuditLogs(
    entityType: string,
    entityId: string,
    limit: number = 50,
    offset: number = 0
  ) {
    try {
      const logs = await this.prisma.paymentAuditLog.findMany({
        where: {
          entityType,
          entityId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      });

      return logs;
    } catch (error) {
      logger.error('Failed to get audit logs', {
        error: error.message,
        entityType,
        entityId,
      });
      throw error;
    }
  }

  /**
   * Get audit logs for organization with filters
   */
  async getOrganizationAuditLogs(
    organizationId: string,
    filters?: {
      action?: string[];
      entityType?: string[];
      userId?: string;
      dateFrom?: Date;
      dateTo?: Date;
      limit?: number;
      offset?: number;
    }
  ) {
    try {
      const where: any = {
        organizationId,
      };

      if (filters?.action?.length) {
        where.action = { in: filters.action };
      }

      if (filters?.entityType?.length) {
        where.entityType = { in: filters.entityType };
      }

      if (filters?.userId) {
        where.userId = filters.userId;
      }

      if (filters?.dateFrom || filters?.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) {
          where.createdAt.gte = filters.dateFrom;
        }
        if (filters.dateTo) {
          where.createdAt.lte = filters.dateTo;
        }
      }

      const [logs, total] = await Promise.all([
        this.prisma.paymentAuditLog.findMany({
          where,
          orderBy: {
            createdAt: 'desc',
          },
          take: filters?.limit || 100,
          skip: filters?.offset || 0,
        }),
        this.prisma.paymentAuditLog.count({ where }),
      ]);

      return { logs, total };
    } catch (error) {
      logger.error('Failed to get organization audit logs', {
        error: error.message,
        organizationId,
        filters,
      });
      throw error;
    }
  }

  /**
   * Get payment-related audit summary
   */
  async getAuditSummary(
    organizationId: string,
    dateFrom?: Date,
    dateTo?: Date
  ) {
    try {
      const where: any = {
        organizationId,
      };

      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) {
          where.createdAt.gte = dateFrom;
        }
        if (dateTo) {
          where.createdAt.lte = dateTo;
        }
      }

      const [
        totalActions,
        actionSummary,
        entitySummary,
        userActivity,
      ] = await Promise.all([
        this.prisma.paymentAuditLog.count({ where }),
        
        this.prisma.paymentAuditLog.groupBy({
          by: ['action'],
          where,
          _count: { _all: true },
        }),
        
        this.prisma.paymentAuditLog.groupBy({
          by: ['entityType'],
          where,
          _count: { _all: true },
        }),
        
        this.prisma.paymentAuditLog.groupBy({
          by: ['userId'],
          where: {
            ...where,
            userId: { not: null },
          },
          _count: { _all: true },
          orderBy: {
            _count: {
              _all: 'desc',
            },
          },
          take: 10,
        }),
      ]);

      return {
        totalActions,
        actionBreakdown: actionSummary.reduce((acc, item) => {
          acc[item.action] = item._count._all;
          return acc;
        }, {} as Record<string, number>),
        entityBreakdown: entitySummary.reduce((acc, item) => {
          acc[item.entityType] = item._count._all;
          return acc;
        }, {} as Record<string, number>),
        topUsers: userActivity.map(item => ({
          userId: item.userId,
          actionCount: item._count._all,
        })),
      };
    } catch (error) {
      logger.error('Failed to get audit summary', {
        error: error.message,
        organizationId,
      });
      throw error;
    }
  }

  /**
   * Get suspicious activity (e.g., multiple failed payment attempts)
   */
  async getSuspiciousActivity(
    organizationId: string,
    timeWindow: number = 24 // hours
  ) {
    try {
      const since = new Date(Date.now() - timeWindow * 60 * 60 * 1000);

      // Look for patterns that might indicate suspicious activity
      const [
        multipleFailedPayments,
        rapidRefunds,
        bulkPaymentMethodChanges,
      ] = await Promise.all([
        // Multiple failed payment attempts from same IP/user
        this.prisma.paymentAuditLog.groupBy({
          by: ['ipAddress', 'userEmail'],
          where: {
            organizationId,
            action: 'CREATE',
            entityType: 'PAYMENT',
            createdAt: { gte: since },
            newData: {
              path: ['status'],
              equals: 'FAILED',
            },
          },
          _count: { _all: true },
          having: {
            _count: {
              _all: {
                gte: 5, // 5 or more failed attempts
              },
            },
          },
        }),

        // Multiple refunds in short time
        this.prisma.paymentAuditLog.groupBy({
          by: ['userId', 'userEmail'],
          where: {
            organizationId,
            action: 'REFUND',
            entityType: 'PAYMENT',
            createdAt: { gte: since },
          },
          _count: { _all: true },
          having: {
            _count: {
              _all: {
                gte: 3, // 3 or more refunds
              },
            },
          },
        }),

        // Bulk payment method changes
        this.prisma.paymentAuditLog.groupBy({
          by: ['userId', 'userEmail'],
          where: {
            organizationId,
            action: { in: ['CREATE', 'UPDATE', 'DELETE'] },
            entityType: 'PAYMENT_METHOD',
            createdAt: { gte: since },
          },
          _count: { _all: true },
          having: {
            _count: {
              _all: {
                gte: 10, // 10 or more payment method changes
              },
            },
          },
        }),
      ]);

      return {
        multipleFailedPayments: multipleFailedPayments.map(item => ({
          ipAddress: item.ipAddress,
          userEmail: item.userEmail,
          failedAttempts: item._count._all,
        })),
        rapidRefunds: rapidRefunds.map(item => ({
          userId: item.userId,
          userEmail: item.userEmail,
          refundCount: item._count._all,
        })),
        bulkPaymentMethodChanges: bulkPaymentMethodChanges.map(item => ({
          userId: item.userId,
          userEmail: item.userEmail,
          changeCount: item._count._all,
        })),
      };
    } catch (error) {
      logger.error('Failed to get suspicious activity', {
        error: error.message,
        organizationId,
      });
      throw error;
    }
  }

  /**
   * Export audit logs (for compliance)
   */
  async exportAuditLogs(
    organizationId: string,
    dateFrom: Date,
    dateTo: Date,
    format: 'json' | 'csv' = 'json'
  ) {
    try {
      const logs = await this.prisma.paymentAuditLog.findMany({
        where: {
          organizationId,
          createdAt: {
            gte: dateFrom,
            lte: dateTo,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (format === 'json') {
        return {
          format: 'json',
          data: logs,
          metadata: {
            organizationId,
            dateFrom,
            dateTo,
            recordCount: logs.length,
            exportedAt: new Date(),
          },
        };
      }

      // CSV format
      if (logs.length === 0) {
        return {
          format: 'csv',
          data: 'No records found for the specified date range',
        };
      }

      const headers = [
        'timestamp',
        'action',
        'entityType',
        'entityId',
        'userId',
        'userEmail',
        'ipAddress',
        'userAgent',
        'oldData',
        'newData',
      ];

      const csvRows = [
        headers.join(','),
        ...logs.map(log => [
          log.createdAt.toISOString(),
          log.action,
          log.entityType,
          log.entityId,
          log.userId || '',
          log.userEmail || '',
          log.ipAddress || '',
          log.userAgent || '',
          JSON.stringify(log.oldData || {}),
          JSON.stringify(log.newData || {}),
        ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')),
      ];

      return {
        format: 'csv',
        data: csvRows.join('\n'),
        metadata: {
          organizationId,
          dateFrom,
          dateTo,
          recordCount: logs.length,
          exportedAt: new Date(),
        },
      };
    } catch (error) {
      logger.error('Failed to export audit logs', {
        error: error.message,
        organizationId,
        dateFrom,
        dateTo,
      });
      throw error;
    }
  }
}