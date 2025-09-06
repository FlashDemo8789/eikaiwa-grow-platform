import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { InvoiceService } from '@/services/payment/InvoiceService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { logger } from '@/lib/logger';

const prisma = new PrismaClient();
const invoiceService = new InvoiceService(prisma);

interface RouteParams {
  params: {
    invoiceId: string;
  };
}

/**
 * GET /api/invoices/[invoiceId]/pdf - Generate and download invoice PDF
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if invoice exists and user has access
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.invoiceId },
      include: { customer: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Check access permissions
    if (session.user.role !== 'SUPER_ADMIN') {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { organizationId: true },
      });

      if (invoice.customer.organizationId !== user?.organizationId) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Generate PDF
    const pdfBytes = await invoiceService.generateInvoicePDF(params.invoiceId);

    // Return PDF as response
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    logger.error('Failed to generate invoice PDF', {
      error: error.message,
      invoiceId: params.invoiceId,
      userId: session?.user?.id,
    });

    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}