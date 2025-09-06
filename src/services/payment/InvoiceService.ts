import { PrismaClient } from '@/lib/prisma-stub';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { 
  CreateInvoiceRequest,
  InvoiceLineItemRequest,
  BillingCalculation 
} from '@/types/payment';
import { TaxCalculationService } from './TaxCalculationService';
import { PaymentAuditService } from './PaymentAuditService';
import { logger } from '@/lib/logger';
import { Decimal } from '@/lib/prisma-stub';

export class InvoiceService {
  private prisma: PrismaClient;
  private taxService: TaxCalculationService;
  private auditService: PaymentAuditService;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.taxService = new TaxCalculationService();
    this.auditService = new PaymentAuditService(prisma);
  }

  /**
   * Create a new invoice
   */
  async createInvoice(
    request: CreateInvoiceRequest,
    context?: { userId?: string; userAgent?: string; ipAddress?: string }
  ) {
    try {
      const customer = await this.prisma.customer.findUnique({
        where: { id: request.customerId },
        include: { organization: true },
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber(customer.organizationId);

      // Calculate totals
      const calculation = this.calculateInvoiceTotals(
        request.lineItems,
        customer.organization.settings as any
      );

      // Create invoice
      const invoice = await this.prisma.invoice.create({
        data: {
          invoiceNumber,
          status: 'OPEN',
          subtotal: new Decimal(calculation.subtotal),
          taxAmount: new Decimal(calculation.taxAmount),
          totalAmount: new Decimal(calculation.totalAmount),
          dueDate: request.dueDate,
          notes: request.notes,
          metadata: request.metadata,
          customerId: request.customerId,
          lineItems: {
            create: request.lineItems.map(item => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: new Decimal(item.unitPrice),
              amount: new Decimal(item.quantity * item.unitPrice),
              metadata: item.metadata,
            })),
          },
        },
        include: {
          lineItems: true,
          customer: {
            include: { organization: true },
          },
        },
      });

      // Audit log
      await this.auditService.logPaymentAction({
        action: 'CREATE',
        entityType: 'INVOICE',
        entityId: invoice.id,
        newData: invoice,
        userId: context?.userId,
        userEmail: context?.userId ? await this.getUserEmail(context.userId) : undefined,
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
      }, customer.organizationId);

      logger.info('Invoice created', {
        invoiceId: invoice.id,
        invoiceNumber,
        customerId: request.customerId,
        totalAmount: calculation.totalAmount,
      });

      return invoice;
    } catch (error) {
      logger.error('Failed to create invoice', {
        error: error.message,
        request,
      });
      throw error;
    }
  }

  /**
   * Update invoice status
   */
  async updateInvoiceStatus(
    invoiceId: string,
    status: 'DRAFT' | 'OPEN' | 'PAID' | 'VOID' | 'OVERDUE' | 'PARTIAL',
    context?: { userId?: string; userAgent?: string; ipAddress?: string }
  ) {
    try {
      const existingInvoice = await this.prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { customer: true },
      });

      if (!existingInvoice) {
        throw new Error('Invoice not found');
      }

      const updatedInvoice = await this.prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status,
          paidAt: status === 'PAID' ? new Date() : undefined,
        },
      });

      // Audit log
      await this.auditService.logPaymentAction({
        action: 'UPDATE',
        entityType: 'INVOICE',
        entityId: invoiceId,
        oldData: { status: existingInvoice.status },
        newData: { status },
        userId: context?.userId,
        userEmail: context?.userId ? await this.getUserEmail(context.userId) : undefined,
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
      }, existingInvoice.customer.organizationId);

      return updatedInvoice;
    } catch (error) {
      logger.error('Failed to update invoice status', {
        error: error.message,
        invoiceId,
        status,
      });
      throw error;
    }
  }

  /**
   * Generate PDF invoice
   */
  async generateInvoicePDF(invoiceId: string): Promise<Uint8Array> {
    try {
      const invoice = await this.prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          lineItems: true,
          customer: {
            include: { organization: true },
          },
        },
      });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // Create PDF document
      const pdfDoc = await PDFDocument.create();
      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
      
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
      const { width, height } = page.getSize();
      
      let y = height - 50;

      // Header
      page.drawText('INVOICE', {
        x: 50,
        y,
        size: 24,
        font: timesBoldFont,
        color: rgb(0, 0, 0),
      });

      page.drawText(`Invoice #${invoice.invoiceNumber}`, {
        x: width - 200,
        y,
        size: 14,
        font: timesRomanFont,
      });

      y -= 40;

      // Organization info
      page.drawText(invoice.customer.organization.name, {
        x: 50,
        y,
        size: 16,
        font: timesBoldFont,
      });

      y -= 60;

      // Customer info
      page.drawText('Bill To:', {
        x: 50,
        y,
        size: 12,
        font: timesBoldFont,
      });

      y -= 20;
      page.drawText(invoice.customer.name || 'Customer', {
        x: 50,
        y,
        size: 12,
        font: timesRomanFont,
      });

      y -= 15;
      page.drawText(invoice.customer.email, {
        x: 50,
        y,
        size: 12,
        font: timesRomanFont,
      });

      // Invoice details
      page.drawText('Invoice Date:', {
        x: width - 200,
        y: y + 35,
        size: 12,
        font: timesBoldFont,
      });

      page.drawText(invoice.issueDate.toLocaleDateString(), {
        x: width - 100,
        y: y + 35,
        size: 12,
        font: timesRomanFont,
      });

      page.drawText('Due Date:', {
        x: width - 200,
        y: y + 20,
        size: 12,
        font: timesBoldFont,
      });

      page.drawText(invoice.dueDate.toLocaleDateString(), {
        x: width - 100,
        y: y + 20,
        size: 12,
        font: timesRomanFont,
      });

      y -= 60;

      // Line items table header
      const tableStartY = y;
      page.drawText('Description', { x: 50, y, size: 12, font: timesBoldFont });
      page.drawText('Qty', { x: 350, y, size: 12, font: timesBoldFont });
      page.drawText('Unit Price', { x: 400, y, size: 12, font: timesBoldFont });
      page.drawText('Amount', { x: 480, y, size: 12, font: timesBoldFont });

      // Draw table line
      page.drawLine({
        start: { x: 50, y: y - 5 },
        end: { x: width - 50, y: y - 5 },
        thickness: 1,
        color: rgb(0, 0, 0),
      });

      y -= 25;

      // Line items
      for (const item of invoice.lineItems) {
        page.drawText(item.description, { x: 50, y, size: 10, font: timesRomanFont });
        page.drawText(item.quantity.toString(), { x: 350, y, size: 10, font: timesRomanFont });
        page.drawText(`¥${Number(item.unitPrice).toLocaleString()}`, { x: 400, y, size: 10, font: timesRomanFont });
        page.drawText(`¥${Number(item.amount).toLocaleString()}`, { x: 480, y, size: 10, font: timesRomanFont });
        y -= 20;
      }

      y -= 20;

      // Totals
      const totalsX = width - 200;
      page.drawText('Subtotal:', { x: totalsX, y, size: 12, font: timesBoldFont });
      page.drawText(`¥${Number(invoice.subtotal).toLocaleString()}`, { x: totalsX + 80, y, size: 12, font: timesRomanFont });

      y -= 20;
      page.drawText('Tax:', { x: totalsX, y, size: 12, font: timesBoldFont });
      page.drawText(`¥${Number(invoice.taxAmount).toLocaleString()}`, { x: totalsX + 80, y, size: 12, font: timesRomanFont });

      y -= 20;
      page.drawText('Total:', { x: totalsX, y, size: 14, font: timesBoldFont });
      page.drawText(`¥${Number(invoice.totalAmount).toLocaleString()}`, { x: totalsX + 80, y, size: 14, font: timesBoldFont });

      // Notes
      if (invoice.notes) {
        y -= 40;
        page.drawText('Notes:', { x: 50, y, size: 12, font: timesBoldFont });
        y -= 20;
        page.drawText(invoice.notes, { x: 50, y, size: 10, font: timesRomanFont });
      }

      const pdfBytes = await pdfDoc.save();
      
      // Update invoice with PDF URL (in a real implementation, you'd upload this to S3 or similar)
      await this.prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          pdfUrl: `${process.env.APP_URL}/api/invoices/${invoiceId}/pdf`,
          pdfGeneratedAt: new Date(),
        },
      });

      logger.info('Invoice PDF generated', {
        invoiceId,
        invoiceNumber: invoice.invoiceNumber,
      });

      return pdfBytes;
    } catch (error) {
      logger.error('Failed to generate invoice PDF', {
        error: error.message,
        invoiceId,
      });
      throw error;
    }
  }

  /**
   * List invoices with filters
   */
  async listInvoices(filters: {
    customerId?: string;
    organizationId?: string;
    status?: string[];
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

    if (filters.dateFrom || filters.dateTo) {
      where.issueDate = {};
      if (filters.dateFrom) {
        where.issueDate.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.issueDate.lte = filters.dateTo;
      }
    }

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        include: {
          customer: true,
          lineItems: true,
          payments: true,
        },
        orderBy: { issueDate: 'desc' },
        take: filters.limit || 50,
        skip: filters.offset || 0,
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return { invoices, total };
  }

  /**
   * Get invoice analytics
   */
  async getInvoiceAnalytics(organizationId: string, dateRange?: { from: Date; to: Date }) {
    try {
      const where: any = {
        customer: { organizationId },
      };

      if (dateRange) {
        where.issueDate = {
          gte: dateRange.from,
          lte: dateRange.to,
        };
      }

      const [
        totalInvoices,
        statusBreakdown,
        monthlyTrend,
        topCustomers,
      ] = await Promise.all([
        this.prisma.invoice.count({ where }),

        this.prisma.invoice.groupBy({
          by: ['status'],
          where,
          _count: { _all: true },
          _sum: { totalAmount: true },
        }),

        this.prisma.$queryRaw`
          SELECT 
            DATE_TRUNC('month', issue_date) as month,
            COUNT(*) as invoice_count,
            SUM(total_amount) as total_amount
          FROM invoices i
          JOIN customers c ON i.customer_id = c.id
          WHERE c.organization_id = ${organizationId}
          ${dateRange ? `AND i.issue_date >= ${dateRange.from} AND i.issue_date <= ${dateRange.to}` : ''}
          GROUP BY DATE_TRUNC('month', issue_date)
          ORDER BY month DESC
          LIMIT 12
        `,

        this.prisma.invoice.groupBy({
          by: ['customerId'],
          where,
          _count: { _all: true },
          _sum: { totalAmount: true },
          orderBy: {
            _sum: {
              totalAmount: 'desc',
            },
          },
          take: 10,
        }),
      ]);

      return {
        totalInvoices,
        statusBreakdown: statusBreakdown.reduce((acc, item) => {
          acc[item.status] = {
            count: item._count._all,
            amount: Number(item._sum.totalAmount || 0),
          };
          return acc;
        }, {} as Record<string, { count: number; amount: number }>),
        monthlyTrend,
        topCustomers,
      };
    } catch (error) {
      logger.error('Failed to get invoice analytics', {
        error: error.message,
        organizationId,
      });
      throw error;
    }
  }

  /**
   * Calculate invoice totals
   */
  private calculateInvoiceTotals(
    lineItems: InvoiceLineItemRequest[],
    organizationSettings?: any
  ): BillingCalculation {
    const subtotal = lineItems.reduce(
      (sum, item) => sum + (item.quantity * item.unitPrice),
      0
    );

    const taxCalculation = this.taxService.calculateTax(
      subtotal,
      'JP',
      organizationSettings
    );

    return {
      subtotal,
      taxAmount: taxCalculation.taxAmount,
      totalAmount: subtotal + taxCalculation.taxAmount,
      taxRate: taxCalculation.taxRate,
    };
  }

  /**
   * Generate unique invoice number
   */
  private async generateInvoiceNumber(organizationId: string): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    
    // Get the count of invoices for this organization this year
    const count = await this.prisma.invoice.count({
      where: {
        customer: { organizationId },
        issueDate: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        },
      },
    });

    const sequence = String(count + 1).padStart(4, '0');
    return `INV-${year}${month}-${sequence}`;
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