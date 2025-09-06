import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PaymentService } from '@/services/payment/PaymentService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { logger } from '@/lib/logger';

const prisma = new PrismaClient();
const paymentService = new PaymentService(prisma);

interface RouteParams {
  params: {
    paymentId: string;
  };
}

/**
 * GET /api/payments/[paymentId] - Get payment details
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

    const payment = await paymentService.getPayment(params.paymentId);

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Check access permissions
    if (session.user.role !== 'SUPER_ADMIN') {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { organizationId: true },
      });

      if (payment.customer.organizationId !== user?.organizationId) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    return NextResponse.json(payment);
  } catch (error) {
    logger.error('Failed to get payment', {
      error: error.message,
      paymentId: params.paymentId,
      userId: session?.user?.id,
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}