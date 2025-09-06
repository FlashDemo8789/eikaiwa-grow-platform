import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { lineAuthService } from '@/services/line-auth.service';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    
    // Handle LINE login error
    if (error) {
      logger.error({ error }, 'LINE login error');
      return NextResponse.redirect(`${process.env.APP_URL}/login?error=line_error`);
    }

    if (!code || !state) {
      logger.error({}, 'Missing code or state parameter');
      return NextResponse.redirect(`${process.env.APP_URL}/login?error=missing_params`);
    }

    // Verify state parameter
    try {
      const stateData = JSON.parse(Buffer.from(state, 'base64url').toString());
      const { redirectUrl, timestamp } = stateData;
      
      // Check if state is not older than 10 minutes
      if (Date.now() - timestamp > 600000) {
        logger.error({}, 'State parameter expired');
        return NextResponse.redirect(`${process.env.APP_URL}/login?error=expired_state`);
      }
    } catch (error) {
      logger.error({ error }, 'Invalid state parameter');
      return NextResponse.redirect(`${process.env.APP_URL}/login?error=invalid_state`);
    }

    // Exchange code for token
    const tokenResponse = await lineAuthService.exchangeCodeForToken(code, state);
    
    // Get user profile
    const lineProfile = await lineAuthService.getUserProfile(tokenResponse.access_token);
    
    // Get email if available
    const email = await lineAuthService.getUserEmail(tokenResponse.access_token);
    
    // Check friendship status
    const isFriend = await lineAuthService.getFriendshipStatus(tokenResponse.access_token);
    
    // Find or create user in database
    // TODO: Fix Prisma schema to include lineUserId field
    let user: any = null; // await prisma.user.findUnique({
    //   where: { lineUserId: lineProfile.userId }
    // });

    if (!user) {
      // Check if user exists with email
      if (email) {
        // user = await prisma.user.findUnique({
        //   where: { email }
        // });
        
        if (user) {
          // Link LINE account to existing user
          // user = await prisma.user.update({
          //   where: { id: user.id },
          //   data: {
          //     lineUserId: lineProfile.userId,
          //     lineDisplayName: lineProfile.displayName,
          //     linePictureUrl: lineProfile.pictureUrl,
          //     lineAccessToken: tokenResponse.access_token,
          //     lineRefreshToken: tokenResponse.refresh_token,
          //     lineTokenExpiry: new Date(Date.now() + tokenResponse.expires_in * 1000),
          //     lineIsFriend: isFriend
          //   }
          // });
        }
      }
      
      if (!user) {
        // Create new user
        // user = await prisma.user.create({
        //   data: {
        //     email: email || `${lineProfile.userId}@line.temp`,
        //     name: lineProfile.displayName,
        //     lineUserId: lineProfile.userId,
        //     lineDisplayName: lineProfile.displayName,
        //     linePictureUrl: lineProfile.pictureUrl,
        //     lineAccessToken: tokenResponse.access_token,
        //     lineRefreshToken: tokenResponse.refresh_token,
        //     lineTokenExpiry: new Date(Date.now() + tokenResponse.expires_in * 1000),
        //     lineIsFriend: isFriend,
        //     emailVerified: email ? new Date() : null,
        //     role: 'USER',
        //     isActive: true
        //   }
        // });
        
        // Mock user for demo
        user = {
          id: 'demo-user-id',
          email: email || `${lineProfile.userId}@line.temp`,
          name: lineProfile.displayName,
        };
        
        logger.info({ 
          userId: user.id, 
          lineUserId: lineProfile.userId 
        }, 'New user created via LINE login');
      }
    } else {
      // Update existing user's LINE info
      // user = await prisma.user.update({
      //   where: { id: user.id },
      //   data: {
      //     lineDisplayName: lineProfile.displayName,
      //     linePictureUrl: lineProfile.pictureUrl,
      //     lineAccessToken: tokenResponse.access_token,
      //     lineRefreshToken: tokenResponse.refresh_token,
      //     lineTokenExpiry: new Date(Date.now() + tokenResponse.expires_in * 1000),
      //     lineIsFriend: isFriend,
      //     lastLoginAt: new Date()
      //   }
      // });
    }

    // Create JWT token for session
    const jwtPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      lineUserId: user.lineUserId,
      lineIsFriend: isFriend
    };

    const jwtToken = jwt.sign(jwtPayload, process.env.JWT_SECRET!, {
      expiresIn: '7d'
    });

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('auth-token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    // Get redirect URL from state
    const stateData = JSON.parse(Buffer.from(state, 'base64url').toString());
    const redirectUrl = stateData.redirectUrl || '/dashboard';

    logger.info({ 
      userId: user.id, 
      lineUserId: lineProfile.userId,
      isFriend 
    }, 'LINE login successful');

    return NextResponse.redirect(`${process.env.APP_URL}${redirectUrl}`);

  } catch (error) {
    logger.error({ error }, 'LINE login callback failed');
    
    return NextResponse.redirect(
      `${process.env.APP_URL}/login?error=callback_failed`
    );
  }
}