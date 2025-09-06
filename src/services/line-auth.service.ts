import axios from 'axios';
import { logger } from '@/lib/logger';

export interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export interface LineTokenResponse {
  access_token: string;
  expires_in: number;
  id_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
}

export class LineAuthService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.LINE_LOGIN_CHANNEL_ID || '';
    this.clientSecret = process.env.LINE_LOGIN_CHANNEL_SECRET || '';
    this.redirectUri = `${process.env.APP_URL}/api/auth/line/callback`;
  }

  // Generate LINE Login URL
  generateAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      state: state || '',
      scope: 'profile openid email',
      nonce: this.generateNonce(),
      prompt: 'consent', // For Japanese users who prefer explicit consent
      ui_locales: 'ja-JP' // Force Japanese UI
    });

    return `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`;
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code: string, state?: string): Promise<LineTokenResponse> {
    try {
      const response = await axios.post('https://api.line.me/oauth2/v2.1/token', 
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.redirectUri,
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      logger.info('LINE token exchange successful');
      return response.data;
    } catch (error) {
      logger.error({ error }, 'LINE token exchange failed');
      throw new Error('LINE認証に失敗しました');
    }
  }

  // Get user profile from LINE
  async getUserProfile(accessToken: string): Promise<LineProfile> {
    try {
      const response = await axios.get('https://api.line.me/v2/profile', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      logger.info('LINE profile fetch successful', { userId: response.data.userId });
      return response.data;
    } catch (error) {
      logger.error({ error }, 'LINE profile fetch failed');
      throw new Error('LINEプロフィール取得に失敗しました');
    }
  }

  // Verify ID token (for OpenID Connect)
  async verifyIdToken(idToken: string): Promise<any> {
    try {
      const response = await axios.post('https://api.line.me/oauth2/v2.1/verify', 
        new URLSearchParams({
          id_token: idToken,
          client_id: this.clientId,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      logger.info('LINE ID token verification successful');
      return response.data;
    } catch (error) {
      logger.error({ error }, 'LINE ID token verification failed');
      throw new Error('LINEトークン検証に失敗しました');
    }
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<LineTokenResponse> {
    try {
      const response = await axios.post('https://api.line.me/oauth2/v2.1/token', 
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      logger.info('LINE token refresh successful');
      return response.data;
    } catch (error) {
      logger.error({ error }, 'LINE token refresh failed');
      throw new Error('LINEトークン更新に失敗しました');
    }
  }

  // Revoke access token
  async revokeToken(accessToken: string): Promise<void> {
    try {
      await axios.post('https://api.line.me/oauth2/v2.1/revoke', 
        new URLSearchParams({
          access_token: accessToken,
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      logger.info('LINE token revocation successful');
    } catch (error) {
      logger.error({ error }, 'LINE token revocation failed');
      throw new Error('LINEトークン無効化に失敗しました');
    }
  }

  // Get email address (requires email scope)
  async getUserEmail(accessToken: string): Promise<string | null> {
    try {
      const response = await axios.get('https://api.line.me/oauth2/v2.1/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data.email || null;
    } catch (error) {
      logger.error({ error }, 'LINE email fetch failed');
      return null;
    }
  }

  // Friendship status (check if user has added bot as friend)
  async getFriendshipStatus(accessToken: string): Promise<boolean> {
    try {
      const response = await axios.get('https://api.line.me/friendship/v1/status', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data.friendFlag;
    } catch (error) {
      logger.error({ error }, 'LINE friendship status check failed');
      return false;
    }
  }

  private generateNonce(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

export const lineAuthService = new LineAuthService();