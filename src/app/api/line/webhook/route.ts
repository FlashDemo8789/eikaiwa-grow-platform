import { NextRequest, NextResponse } from 'next/server';
import { middleware, WebhookEvent } from '@line/bot-sdk';
import { lineService } from '@/services/line.service';
import { logger } from '@/lib/logger';

// Middleware configuration for LINE webhook
const lineMiddleware = middleware({
  channelSecret: process.env.LINE_CHANNEL_SECRET || ''
});

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('x-line-signature');
    
    if (!signature) {
      logger.error('Missing LINE signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify signature using LINE SDK
    try {
      // Parse events from webhook
      const events: WebhookEvent[] = JSON.parse(body).events;
      
      // Process webhook events
      await lineService.handleWebhook(events);
      
      logger.info('LINE webhook processed successfully', { 
        eventCount: events.length 
      });
      
      return NextResponse.json({ success: true });
      
    } catch (verificationError) {
      logger.error('LINE signature verification failed', { 
        error: verificationError,
        signature 
      });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

  } catch (error) {
    logger.error('LINE webhook processing failed', { error });
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// Handle GET requests for webhook verification
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'LINE Webhook endpoint is running',
    timestamp: new Date().toISOString()
  });
}