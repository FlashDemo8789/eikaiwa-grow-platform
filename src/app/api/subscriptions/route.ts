import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { SubscriptionBillingService } from '@/services/payment/SubscriptionBillingService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const prisma = new PrismaClient();
const subscriptionService = new SubscriptionBillingService(prisma);

// Validation schemas
const createSubscriptionSchema = z.object({
  customerId: z.string(),
  planName: z.string(),
  amount: z.number().positive(),
  billingCycle: z.enum(['WEEKLY', 'MONTHLY', 'YEARLY']),
  trialDays: z.number().int().min(0).optional(),
  discountRate: z.number().min(0).max(100).optional(),
  paymentMethodId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * POST /api/subscriptions - Create subscription
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to create subscriptions
    if (!['SUPER_ADMIN', 'ORG_ADMIN', 'SCHOOL_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createSubscriptionSchema.parse(body);

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

    const subscription = await subscriptionService.createSubscription(validatedData, {
      userId: session.user.id,
      ipAddress: clientIP,
      userAgent,
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    logger.error({
      error: error.message,
      userId: session?.user?.email,
    }, 'Failed to create subscription');

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: (error as any).errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    );
  }
}