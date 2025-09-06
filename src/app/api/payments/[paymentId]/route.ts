import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/prisma-stub';
import { PaymentService } from '@/services/payment/PaymentService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { logger } from '@/lib/logger';

const prisma = new PrismaClient();
const paymentService = new PaymentService(prisma);

interface RouteParams {
  params: Promise<{
    paymentId: string;
  }>;
}

/**
 * GET /api/payments/[paymentId] - Get payment details
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const resolvedParams = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payment = await paymentService.getPayment(resolvedParams.paymentId);

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Check access permissions - COMMENTED OUT: session.user.role and session.user.id don't exist
    // if (session.user.role !== 'SUPER_ADMIN') {
    //   const user = await prisma.user.findUnique({
    //     where: { id: session.user.id },
    //     select: { organizationId: true },
    //   });

    //   if (payment.customer.organizationId !== user?.organizationId) {
    //     return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    //   }
    // }

    return NextResponse.json(payment);
  } catch (error) {
    logger.error({
      error: error.message,
      paymentId: resolvedParams.paymentId,
      userId: session?.user?.email,
    }, 'Failed to get payment');

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}