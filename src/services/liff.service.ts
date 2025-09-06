import liff from '@line/liff';
import { logger } from '@/lib/logger';

export interface LiffProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
  email?: string;
}

export interface LiffContext {
  type: 'utou' | 'room' | 'group' | 'external';
  viewType: 'compact' | 'tall' | 'full';
  userId?: string;
  utouId?: string;
  roomId?: string;
  groupId?: string;
}

export class LiffService {
  private liffId: string;
  private initialized: boolean = false;

  constructor() {
    this.liffId = process.env.LINE_LIFF_ID || '';
  }

  // Initialize LIFF
  async initialize(): Promise<void> {
    try {
      if (this.initialized) return;

      await liff.init({
        liffId: this.liffId,
        withLoginOnExternalBrowser: true // For Japanese mobile users
      });

      this.initialized = true;
      logger.info('LIFF initialized successfully');
    } catch (error) {
      logger.error({ error }, 'LIFF initialization failed');
      throw new Error('LIFFの初期化に失敗しました');
    }
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    if (!this.initialized) return false;
    return liff.isLoggedIn();
  }

  // Login user
  async login(): Promise<void> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      if (!liff.isLoggedIn()) {
        liff.login({
          redirectUri: window.location.href,
          scope: 'profile openid email'
        });
      }
    } catch (error) {
      logger.error({ error }, 'LIFF login failed');
      throw new Error('LINEログインに失敗しました');
    }
  }

  // Logout user
  logout(): void {
    try {
      if (this.initialized && liff.isLoggedIn()) {
        liff.logout();
        logger.info('LIFF logout successful');
      }
    } catch (error) {
      logger.error({ error }, 'LIFF logout failed');
      throw new Error('LINEログアウトに失敗しました');
    }
  }

  // Get user profile
  async getProfile(): Promise<LiffProfile | null> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      if (!liff.isLoggedIn()) {
        return null;
      }

      const profile = await liff.getProfile();
      const email = await this.getEmail();

      return {
        userId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        statusMessage: profile.statusMessage,
        email
      };
    } catch (error) {
      logger.error({ error }, 'LIFF profile fetch failed');
      throw new Error('プロフィール取得に失敗しました');
    }
  }

  // Get email address
  async getEmail(): Promise<string | undefined> {
    try {
      if (!this.initialized || !liff.isLoggedIn()) {
        return undefined;
      }

      return await liff.getDecodedIDToken()?.email;
    } catch (error) {
      logger.error({ error }, 'LIFF email fetch failed');
      return undefined;
    }
  }

  // Get access token
  getAccessToken(): string | null {
    try {
      if (!this.initialized || !liff.isLoggedIn()) {
        return null;
      }

      return liff.getAccessToken();
    } catch (error) {
      logger.error({ error }, 'LIFF access token fetch failed');
      return null;
    }
  }

  // Get LIFF context
  getContext(): LiffContext | null {
    try {
      if (!this.initialized) {
        return null;
      }

      return liff.getContext() as LiffContext;
    } catch (error) {
      logger.error({ error }, 'LIFF context fetch failed');
      return null;
    }
  }

  // Check if app is in LINE client
  isInClient(): boolean {
    if (!this.initialized) return false;
    return liff.isInClient();
  }

  // Open external window (for Japanese users who prefer external browsers)
  openWindow(url: string, external: boolean = false): void {
    try {
      if (!this.initialized) return;

      liff.openWindow({
        url,
        external
      });
    } catch (error) {
      logger.error({ error }, 'LIFF window open failed');
    }
  }

  // Close LIFF window
  closeWindow(): void {
    try {
      if (!this.initialized) return;
      liff.closeWindow();
    } catch (error) {
      logger.error({ error }, 'LIFF window close failed');
    }
  }

  // Send messages to LINE chat
  async sendMessages(messages: any[]): Promise<void> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      if (!liff.isLoggedIn()) {
        throw new Error('ログインが必要です');
      }

      await liff.sendMessages(messages);
      logger.info('LIFF messages sent successfully');
    } catch (error) {
      logger.error({ error }, 'LIFF send messages failed');
      throw new Error('メッセージの送信に失敗しました');
    }
  }

  // Share target picker (for Japanese group sharing culture)
  async shareTargetPicker(messages: any[]): Promise<void> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      if (!liff.isInClient()) {
        throw new Error('LINEアプリ内でのみ利用可能です');
      }

      await liff.shareTargetPicker(messages);
      logger.info('LIFF share target picker used successfully');
    } catch (error) {
      logger.error({ error }, 'LIFF share target picker failed');
      throw new Error('共有に失敗しました');
    }
  }

  // Scan QR code (useful for Japanese business cards and events)
  async scanCode(): Promise<string | null> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      if (!liff.isInClient()) {
        throw new Error('LINEアプリ内でのみ利用可能です');
      }

      const result = await liff.scanCode();
      return result.value;
    } catch (error) {
      logger.error({ error }, 'LIFF QR scan failed');
      return null;
    }
  }

  // Get OS information (for Japanese mobile optimization)
  getOS(): string {
    if (!this.initialized) return 'unknown';
    return liff.getOS();
  }

  // Get language setting
  getLanguage(): string {
    if (!this.initialized) return 'ja';
    return liff.getLanguage();
  }

  // Get LINE version
  getVersion(): string {
    if (!this.initialized) return 'unknown';
    return liff.getVersion();
  }

  // Check if feature is available
  isApiAvailable(api: string): boolean {
    if (!this.initialized) return false;
    return liff.isApiAvailable(api);
  }

  // Utility method for Japanese date formatting
  formatJapaneseDate(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];
    
    return `${year}年${month}月${day}日（${weekday}）`;
  }

  // Utility method for Japanese time formatting
  formatJapaneseTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes}`;
  }

  // Check if current time is within Japanese business hours
  isJapaneseBusinessHours(): boolean {
    const now = new Date();
    const jstOffset = 9 * 60; // Japan Standard Time offset in minutes
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const jst = new Date(utc + (jstOffset * 60000));
    
    const hour = jst.getHours();
    const dayOfWeek = jst.getDay();
    
    // Monday to Friday, 9:00-18:00 JST
    return dayOfWeek >= 1 && dayOfWeek <= 5 && hour >= 9 && hour < 18;
  }
}

export const liffService = new LiffService();