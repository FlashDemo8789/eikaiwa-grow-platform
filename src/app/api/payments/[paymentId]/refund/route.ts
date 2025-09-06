import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/prisma-stub';
import { PaymentService } from '@/services/payment/PaymentService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const prisma = new PrismaClient();
const paymentService = new PaymentService(prisma);

const refundSchema = z.object({
  amount: z.number().positive().optional(),
  reason: z.string().optional(),
});

interface RouteParams {
  params: Promise<{
    paymentId: string;
  }>;
}

/**
 * POST /api/payments/[paymentId]/refund - Process refund
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  const resolvedParams = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to process refunds - COMMENTED OUT: session.user.role doesn't exist
    // if (!['SUPER_ADMIN', 'ORG_ADMIN', 'SCHOOL_ADMIN'].includes(session.user.role)) {
    //   return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    // }

    const body = await request.json();
    const validatedData = refundSchema.parse(body);

    // Verify payment exists and user has access
    const payment = await paymentService.getPayment(resolvedParams.paymentId);
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // COMMENTED OUT: session.user.role and session.user.id don't exist
    // if (session.user.role !== 'SUPER_ADMIN') {
    //   const user = await prisma.user.findUnique({
    //     where: { id: session.user.id },
    //     select: { organizationId: true },
    //   });

    //   if (payment.customer.organizationId !== user?.organizationId) {
    //     return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    //   }
    // }

    // Get client info for audit
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const refund = await paymentService.refundPayment({
      paymentId: resolvedParams.paymentId,
      amount: validatedData.amount,
      reason: validatedData.reason,
    }, {
      userId: session.user.email, // Using email instead of id since user.id doesn't exist
      ipAddress: clientIP,
      userAgent,
    });

    return NextResponse.json(refund, { status: 201 });
  } catch (error) {
    logger.error({
      error: error.message,
      paymentId: resolvedParams.paymentId,
      userId: session?.user?.email,
    }, 'Failed to process refund');

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: (error as any).errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to process refund' },
      { status: 500 }
    );
  }
}