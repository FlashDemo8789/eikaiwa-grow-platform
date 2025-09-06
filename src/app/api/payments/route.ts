import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PaymentService } from '@/services/payment/PaymentService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const prisma = new PrismaClient();
const paymentService = new PaymentService(prisma);

// Validation schemas
const createPaymentSchema = z.object({
  customerId: z.string(),
  amount: z.number().positive(),
  currency: z.string().default('JPY'),
  description: z.string().optional(),
  paymentMethodId: z.string().optional(),
  provider: z.enum(['STRIPE', 'PAYPAY', 'KONBINI', 'BANK_TRANSFER']),
  type: z.enum(['ONE_TIME', 'SUBSCRIPTION', 'INSTALLMENT']),
  metadata: z.record(z.any()).optional(),
});

const listPaymentsSchema = z.object({
  customerId: z.string().optional(),
  organizationId: z.string().optional(),
  status: z.array(z.string()).optional(),
  provider: z.array(z.string()).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

/**
 * GET /api/payments - List payments
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
    if (queryParams.provider) {
      queryParams.provider = queryParams.provider.split(',');
    }

    const validatedParams = listPaymentsSchema.parse(queryParams);

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

    const result = await paymentService.listPayments(filters);

    return NextResponse.json(result);
  } catch (error) {
    logger.error({
      error: error.message,
      userId: session?.user?.email,
    }, 'Failed to list payments');

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
 * POST /api/payments - Create payment
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createPaymentSchema.parse(body);

    // Verify customer belongs to user's organization
    if (session.user.role !== 'SUPER_ADMIN') {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { organizationId: true },
      });

      const customer = await prisma.customer.findFirst({
        where: {
          id: validatedData.customerId,
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

    const payment = await paymentService.createPayment(validatedData, {
      userId: session.user.id,
      ipAddress: clientIP,
      userAgent,
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    logger.error({
      error: error.message,
      userId: session?.user?.email,
    }, 'Failed to create payment');

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: (error as any).errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create payment' },
      { status: 500 }
    );
  }
}

// Clean up Prisma connection
async function cleanup() {
  await prisma.$disconnect();
}

process.on('beforeExit', cleanup);
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);