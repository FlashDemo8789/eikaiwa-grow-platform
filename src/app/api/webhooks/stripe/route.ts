import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { StripePaymentService } from '@/services/payment/providers/StripePaymentService';
import { logger } from '@/lib/logger';

const prisma = new PrismaClient();
const stripeService = new StripePaymentService(prisma);

/**
 * POST /api/webhooks/stripe - Handle Stripe webhooks
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      logger.warn('Missing Stripe signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Process the webhook
    const result = await stripeService.handleWebhook(body, signature);

    return NextResponse.json(result);
  } catch (error) {
    logger.error({
      error: error.message,
    }, 'Stripe webhook processing failed');

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    );
  }
}