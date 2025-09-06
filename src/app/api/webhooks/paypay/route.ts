import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PayPayService } from '@/services/payment/providers/PayPayService';
import { logger } from '@/lib/logger';

const payPayService = new PayPayService(prisma);

/**
 * POST /api/webhooks/paypay - Handle PayPay webhooks
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get('x-paypay-signature');

    if (!signature) {
      logger.warn('Missing PayPay signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Process the webhook
    const result = await payPayService.handleWebhook(body, signature);

    return NextResponse.json(result);
  } catch (error) {
    logger.error('PayPay webhook processing failed', {
      error: error.message,
    });

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    );
  }
}