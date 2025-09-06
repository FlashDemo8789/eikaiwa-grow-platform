import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { InvoiceService } from '@/services/payment/InvoiceService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const invoiceService = new InvoiceService(prisma);

// Validation schemas
const createInvoiceSchema = z.object({
  customerId: z.string(),
  dueDate: z.string().datetime(),
  lineItems: z.array(z.object({
    description: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
    metadata: z.record(z.any()).optional(),
  })),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

const listInvoicesSchema = z.object({
  customerId: z.string().optional(),
  organizationId: z.string().optional(),
  status: z.array(z.string()).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

/**
 * GET /api/invoices - List invoices
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams);
    
    // Convert array parameters
    if (queryParams.status) {
      queryParams.status = queryParams.status.split(',');
    }

    const validatedParams = listInvoicesSchema.parse(queryParams);

    // Convert date strings to Date objects
    const filters: any = {
      ...validatedParams,
      dateFrom: validatedParams.dateFrom ? new Date(validatedParams.dateFrom) : undefined,
      dateTo: validatedParams.dateTo ? new Date(validatedParams.dateTo) : undefined,
    };

    // If user is not super admin, restrict to their organization
    if (session.user.role !== 'SUPER_ADMIN') {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { organizationId: true },
      });
      filters.organizationId = user?.organizationId;
    }

    const result = await invoiceService.listInvoices(filters);

    return NextResponse.json(result);
  } catch (error) {
    logger.error({
      error: error.message,
      userId: session?.user?.email,
    }, 'Failed to list invoices');

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: (error as any).errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/invoices - Create invoice
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to create invoices
    if (!['SUPER_ADMIN', 'ORG_ADMIN', 'SCHOOL_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createInvoiceSchema.parse(body);

    // Convert dueDate string to Date
    const invoiceData = {
      ...validatedData,
      dueDate: new Date(validatedData.dueDate),
    };

    // Verify customer belongs to user's organization
    if (session.user.role !== 'SUPER_ADMIN') {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { organizationId: true },
      });

      const customer = await prisma.customer.findFirst({
        where: {
          id: invoiceData.customerId,
          organizationId: user?.organizationId,
        },
      });

      if (!customer) {
        return NextResponse.json(
          { error: 'Customer not found or access denied' },
          { status: 404 }
        );
      }
    }

    // Get client info for audit
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const invoice = await invoiceService.createInvoice(invoiceData, {
      userId: session.user.id,
      ipAddress: clientIP,
      userAgent,
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    logger.error({
      error: error.message,
      userId: session?.user?.email,
    }, 'Failed to create invoice');

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: (error as any).errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create invoice' },
      { status: 500 }
    );
  }
}