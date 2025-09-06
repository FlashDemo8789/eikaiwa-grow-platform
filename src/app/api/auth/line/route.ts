import { NextRequest, NextResponse } from 'next/server';
import { lineAuthService } from '@/services/line-auth.service';
import { logger } from '@/lib/logger';

// Initiate LINE Login
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const redirectUrl = searchParams.get('redirectUrl') || '/dashboard';
    
    // Generate state parameter for CSRF protection
    const state = Buffer.from(JSON.stringify({ 
      redirectUrl,
      timestamp: Date.now(),
      nonce: Math.random().toString(36).substring(2)
    })).toString('base64url');

    const authUrl = lineAuthService.generateAuthUrl(state);
    
    logger.info('LINE login initiated', { state });
    
    return NextResponse.redirect(authUrl);
  } catch (error) {
    logger.error('LINE login initiation failed', { error });
    
    return NextResponse.json(
      { error: 'LINEログインの開始に失敗しました' },
      { status: 500 }
    );
  }
}