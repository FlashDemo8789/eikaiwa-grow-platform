import { Client, middleware, MiddlewareConfig, WebhookEvent, MessageEvent, TextMessage, FlexMessage, ImageMessage, RichMenu, RichMenuArea, RichMenuSize, RichMenuBounds } from '@line/bot-sdk';
import { logger } from '@/lib/logger';

// LINE Bot configuration
const config: MiddlewareConfig = {
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || ''
};

const client = new Client(config);

// Japanese cultural colors
export const JAPANESE_COLORS = {
  SAKURA: '#F8BBD0',      // 桜色 (Cherry blossom)
  MOMIJI: '#FF6B35',      // 紅葉 (Autumn maple)
  SORA: '#87CEEB',        // 空色 (Sky blue)
  YAMABUKI: '#F4C430',    // 山吹色 (Yamabuki yellow)
  MURASAKI: '#9A4C95',    // 紫 (Purple)
  MIDORI: '#4F7942'       // 緑 (Green)
};

// Seasonal themes
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export const SEASONAL_THEMES = {
  spring: {
    color: JAPANESE_COLORS.SAKURA,
    emoji: '🌸',
    greeting: '春の温かい陽気ですね',
    background: 'linear-gradient(135deg, #F8BBD0 0%, #FFB6C1 100%)'
  },
  summer: {
    color: JAPANESE_COLORS.SORA,
    emoji: '🌻',
    greeting: '暑い日が続きますが、お元気ですか',
    background: 'linear-gradient(135deg, #87CEEB 0%, #00BFFF 100%)'
  },
  autumn: {
    color: JAPANESE_COLORS.MOMIJI,
    emoji: '🍁',
    greeting: '秋の深まりを感じる季節となりました',
    background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C00 100%)'
  },
  winter: {
    color: JAPANESE_COLORS.MURASAKI,
    emoji: '❄️',
    greeting: '寒い日が続きますが、お体にお気をつけください',
    background: 'linear-gradient(135deg, #9A4C95 0%, #8A2BE2 100%)'
  }
};

export class LineService {
  private client: Client;

  constructor() {
    this.client = client;
  }

  // Get current season based on Japanese calendar
  getCurrentSeason(): Season {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }

  // Send text message with Japanese formatting
  async sendTextMessage(userId: string, text: string, withSeasonal: boolean = true): Promise<void> {
    try {
      let message = text;
      
      if (withSeasonal) {
        const season = this.getCurrentSeason();
        const theme = SEASONAL_THEMES[season];
        message = `${theme.emoji} ${message}\n\n${theme.greeting}`;
      }

      await this.client.pushMessage(userId, {
        type: 'text',
        text: message
      });

      logger.info('LINE text message sent successfully', { userId, messageLength: message.length });
    } catch (error) {
      logger.error({ error, userId }, 'Failed to send LINE text message');
      throw error;
    }
  }

  // Send flex message with Japanese business card format
  async sendBusinessCard(userId: string, schoolInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    principalName: string;
  }): Promise<void> {
    const flexMessage: FlexMessage = {
      type: 'flex',
      altText: '学校情報のご案内',
      contents: {
        type: 'bubble',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '🏫 学校情報',
              weight: 'bold',
              color: '#FFFFFF',
              size: 'lg'
            }
          ],
          backgroundColor: JAPANESE_COLORS.MIDORI,
          paddingAll: '12px'
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: schoolInfo.name,
              weight: 'bold',
              size: 'xl',
              margin: 'none'
            },
            {
              type: 'text',
              text: `校長: ${schoolInfo.principalName}`,
              size: 'sm',
              color: '#666666',
              margin: 'sm'
            },
            {
              type: 'separator',
              margin: 'md'
            },
            {
              type: 'box',
              layout: 'vertical',
              margin: 'md',
              spacing: 'sm',
              contents: [
                {
                  type: 'box',
                  layout: 'baseline',
                  contents: [
                    {
                      type: 'text',
                      text: '住所',
                      color: '#666666',
                      size: 'sm',
                      flex: 2
                    },
                    {
                      type: 'text',
                      text: schoolInfo.address,
                      wrap: true,
                      size: 'sm',
                      flex: 5
                    }
                  ]
                },
                {
                  type: 'box',
                  layout: 'baseline',
                  contents: [
                    {
                      type: 'text',
                      text: '電話',
                      color: '#666666',
                      size: 'sm',
                      flex: 2
                    },
                    {
                      type: 'text',
                      text: schoolInfo.phone,
                      size: 'sm',
                      flex: 5
                    }
                  ]
                },
                {
                  type: 'box',
                  layout: 'baseline',
                  contents: [
                    {
                      type: 'text',
                      text: 'Email',
                      color: '#666666',
                      size: 'sm',
                      flex: 2
                    },
                    {
                      type: 'text',
                      text: schoolInfo.email,
                      size: 'sm',
                      flex: 5
                    }
                  ]
                }
              ]
            }
          ]
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          spacing: 'sm',
          contents: [
            {
              type: 'button',
              style: 'primary',
              height: 'sm',
              action: {
                type: 'uri',
                label: 'ウェブサイトを見る',
                uri: process.env.APP_URL || 'https://eikaiwa-grow.com'
              },
              color: JAPANESE_COLORS.SAKURA
            }
          ],
          flex: 0
        }
      }
    };

    try {
      await this.client.pushMessage(userId, flexMessage);
      logger.info('LINE business card sent successfully', { userId, schoolName: schoolInfo.name });
    } catch (error) {
      logger.error({ error, userId }, 'Failed to send LINE business card');
      throw error;
    }
  }

  // Send event notification with Japanese formatting
  async sendEventNotification(userId: string, event: {
    name: string;
    date: string;
    location: string;
    description: string;
  }): Promise<void> {
    const season = this.getCurrentSeason();
    const theme = SEASONAL_THEMES[season];
    
    const flexMessage: FlexMessage = {
      type: 'flex',
      altText: `イベント通知: ${event.name}`,
      contents: {
        type: 'bubble',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: `${theme.emoji} イベント通知`,
              weight: 'bold',
              color: '#FFFFFF',
              size: 'lg'
            }
          ],
          backgroundColor: theme.color,
          paddingAll: '12px'
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: event.name,
              weight: 'bold',
              size: 'xl',
              margin: 'none'
            },
            {
              type: 'text',
              text: event.date,
              size: 'sm',
              color: '#666666',
              margin: 'sm'
            },
            {
              type: 'separator',
              margin: 'md'
            },
            {
              type: 'box',
              layout: 'vertical',
              margin: 'md',
              spacing: 'sm',
              contents: [
                {
                  type: 'box',
                  layout: 'baseline',
                  contents: [
                    {
                      type: 'text',
                      text: '場所',
                      color: '#666666',
                      size: 'sm',
                      flex: 2
                    },
                    {
                      type: 'text',
                      text: event.location,
                      wrap: true,
                      size: 'sm',
                      flex: 5
                    }
                  ]
                },
                {
                  type: 'text',
                  text: event.description,
                  wrap: true,
                  size: 'sm',
                  margin: 'md'
                }
              ]
            }
          ]
        },
        footer: {
          type: 'box',
          layout: 'horizontal',
          spacing: 'sm',
          contents: [
            {
              type: 'button',
              style: 'primary',
              height: 'sm',
              action: {
                type: 'postback',
                label: '参加予定',
                data: `action=attend&eventId=${event.name}`
              },
              color: JAPANESE_COLORS.MIDORI,
              flex: 2
            },
            {
              type: 'button',
              style: 'secondary',
              height: 'sm',
              action: {
                type: 'postback',
                label: '詳細を見る',
                data: `action=details&eventId=${event.name}`
              },
              flex: 2
            }
          ],
          flex: 0
        }
      }
    };

    try {
      await this.client.pushMessage(userId, flexMessage);
      logger.info('LINE event notification sent successfully', { userId, eventName: event.name });
    } catch (error) {
      logger.error({ error, userId }, 'Failed to send LINE event notification');
      throw error;
    }
  }

  // Create rich menu for Japanese users
  async createJapaneseRichMenu(): Promise<string> {
    const richMenuObject: RichMenu = {
      size: {
        width: 2500,
        height: 1686
      },
      selected: true,
      name: 'EikaiwaGrow メインメニュー',
      chatBarText: 'メニュー',
      areas: [
        {
          bounds: {
            x: 0,
            y: 0,
            width: 833,
            height: 843
          },
          action: {
            type: 'postback',
            data: 'action=schedule',
            displayText: '📅 スケジュール'
          }
        },
        {
          bounds: {
            x: 833,
            y: 0,
            width: 834,
            height: 843
          },
          action: {
            type: 'postback',
            data: 'action=students',
            displayText: '👥 生徒管理'
          }
        },
        {
          bounds: {
            x: 1667,
            y: 0,
            width: 833,
            height: 843
          },
          action: {
            type: 'postback',
            data: 'action=reports',
            displayText: '📊 レポート'
          }
        },
        {
          bounds: {
            x: 0,
            y: 843,
            width: 833,
            height: 843
          },
          action: {
            type: 'postback',
            data: 'action=events',
            displayText: '🎪 イベント'
          }
        },
        {
          bounds: {
            x: 833,
            y: 843,
            width: 834,
            height: 843
          },
          action: {
            type: 'postback',
            data: 'action=billing',
            displayText: '💰 請求・支払い'
          }
        },
        {
          bounds: {
            x: 1667,
            y: 843,
            width: 833,
            height: 843
          },
          action: {
            type: 'postback',
            data: 'action=settings',
            displayText: '⚙️ 設定'
          }
        }
      ]
    };

    try {
      const richMenuId = await this.client.createRichMenu(richMenuObject);
      logger.info('Rich menu created successfully', { richMenuId });
      return richMenuId;
    } catch (error) {
      logger.error({ error }, 'Failed to create rich menu');
      throw error;
    }
  }

  // Broadcast message to multiple users
  async broadcastMessage(userIds: string[], message: string, messageType: 'text' | 'flex' = 'text'): Promise<void> {
    try {
      const season = this.getCurrentSeason();
      const theme = SEASONAL_THEMES[season];
      
      if (messageType === 'text') {
        const formattedMessage = `${theme.emoji} ${message}\n\n${theme.greeting}`;
        
        await this.client.multicast(userIds, {
          type: 'text',
          text: formattedMessage
        });
      }

      logger.info('Broadcast message sent successfully', { userCount: userIds.length, messageType });
    } catch (error) {
      logger.error({ error, userCount: userIds.length }, 'Failed to send broadcast message');
      throw error;
    }
  }

  // Handle webhook events
  async handleWebhook(events: WebhookEvent[]): Promise<void> {
    const promises = events.map(async (event) => {
      try {
        switch (event.type) {
          case 'message':
            await this.handleMessageEvent(event);
            break;
          case 'postback':
            await this.handlePostbackEvent(event);
            break;
          case 'follow':
            await this.handleFollowEvent(event);
            break;
          case 'unfollow':
            await this.handleUnfollowEvent(event);
            break;
          default:
            logger.info('Unhandled event type', { eventType: event.type });
        }
      } catch (error) {
        logger.error({ error, event }, 'Error handling webhook event');
      }
    });

    await Promise.all(promises);
  }

  private async handleMessageEvent(event: MessageEvent): Promise<void> {
    const { replyToken, source, message } = event;
    const userId = source.userId;

    if (!userId) return;

    if (message.type === 'text') {
      const userMessage = message.text.toLowerCase().trim();
      
      // Japanese greetings and responses
      if (userMessage.includes('おはよう') || userMessage.includes('こんにちは') || userMessage.includes('こんばんは')) {
        const season = this.getCurrentSeason();
        const theme = SEASONAL_THEMES[season];
        
        await this.client.replyMessage(replyToken, {
          type: 'text',
          text: `${theme.emoji} こんにちは！\n${theme.greeting}\n\n何かお手伝いできることはありますか？`
        });
      } else if (userMessage.includes('メニュー') || userMessage.includes('ヘルプ')) {
        await this.sendMenuOptions(replyToken);
      } else {
        // Default response with polite Japanese
        await this.client.replyMessage(replyToken, {
          type: 'text',
          text: 'お疲れ様です。\nご質問やご要望がございましたら、お気軽にお声かけください。\n\nメニューからお選びいただくか、「ヘルプ」とお送りください。'
        });
      }
    }
  }

  private async handlePostbackEvent(event: any): Promise<void> {
    const { replyToken, postback } = event;
    const data = new URLSearchParams(postback.data);
    const action = data.get('action');

    switch (action) {
      case 'schedule':
        await this.sendScheduleInfo(replyToken);
        break;
      case 'students':
        await this.sendStudentManagementMenu(replyToken);
        break;
      case 'reports':
        await this.sendReportsMenu(replyToken);
        break;
      case 'events':
        await this.sendEventsMenu(replyToken);
        break;
      case 'billing':
        await this.sendBillingMenu(replyToken);
        break;
      case 'settings':
        await this.sendSettingsMenu(replyToken);
        break;
      default:
        await this.client.replyMessage(replyToken, {
          type: 'text',
          text: '申し訳ございません。そちらの機能は現在準備中です。'
        });
    }
  }

  private async handleFollowEvent(event: any): Promise<void> {
    const userId = event.source.userId;
    const season = this.getCurrentSeason();
    const theme = SEASONAL_THEMES[season];
    
    if (userId) {
      await this.client.pushMessage(userId, {
        type: 'text',
        text: `${theme.emoji} EikaiwaGrowにお友達登録いただき、ありがとうございます！\n\n${theme.greeting}\n\nこちらのアプリでは以下のことができます：\n• 📅 授業スケジュールの確認\n• 👥 生徒の管理\n• 📊 成績レポートの確認\n• 🎪 イベント情報\n• 💰 請求・支払い管理\n\nメニューからお選びください！`
      });
    }
  }

  private async handleUnfollowEvent(event: any): Promise<void> {
    const userId = event.source.userId;
    logger.info('User unfollowed', { userId });
    // Handle cleanup if needed
  }

  private async sendMenuOptions(replyToken: string): Promise<void> {
    await this.client.replyMessage(replyToken, {
      type: 'text',
      text: '📋 メニュー一覧\n\n📅 スケジュール - 授業予定を確認\n👥 生徒管理 - 生徒情報の管理\n📊 レポート - 成績・進捗レポート\n🎪 イベント - 学校イベント情報\n💰 請求・支払い - 料金管理\n⚙️ 設定 - アプリの設定\n\nお選びください。'
    });
  }

  private async sendScheduleInfo(replyToken: string): Promise<void> {
    await this.client.replyMessage(replyToken, {
      type: 'text',
      text: '📅 スケジュール機能\n\n今日の授業、今週の予定、月間カレンダーをご確認いただけます。\n\nWebアプリでより詳細な情報をご覧ください。'
    });
  }

  private async sendStudentManagementMenu(replyToken: string): Promise<void> {
    await this.client.replyMessage(replyToken, {
      type: 'text',
      text: '👥 生徒管理機能\n\n• 生徒リスト\n• 出席状況\n• 成績管理\n• 保護者連絡先\n\nWebアプリでより詳細な管理が可能です。'
    });
  }

  private async sendReportsMenu(replyToken: string): Promise<void> {
    await this.client.replyMessage(replyToken, {
      type: 'text',
      text: '📊 レポート機能\n\n• 月次レポート\n• 生徒別成績\n• 出席率統計\n• 売上分析\n\n詳細なレポートはWebアプリでご確認ください。'
    });
  }

  private async sendEventsMenu(replyToken: string): Promise<void> {
    await this.client.replyMessage(replyToken, {
      type: 'text',
      text: '🎪 イベント機能\n\n• 今後のイベント\n• 参加者管理\n• イベント作成\n• 通知設定\n\nWebアプリでイベントの詳細管理ができます。'
    });
  }

  private async sendBillingMenu(replyToken: string): Promise<void> {
    await this.client.replyMessage(replyToken, {
      type: 'text',
      text: '💰 請求・支払い機能\n\n• 月謝管理\n• 請求書発行\n• 支払い状況確認\n• PayPay・コンビニ決済\n\nWebアプリで詳細な管理が可能です。'
    });
  }

  private async sendSettingsMenu(replyToken: string): Promise<void> {
    await this.client.replyMessage(replyToken, {
      type: 'text',
      text: '⚙️ 設定機能\n\n• 通知設定\n• プロフィール編集\n• 言語設定\n• プライバシー設定\n\nWebアプリで詳細な設定変更ができます。'
    });
  }

  // Create lesson photo message for parents
  async createLessonPhotoMessage(data: {
    studentName: string;
    photoUrl: string;
    message: string;
    vocabulary: Array<{ english: string; japanese: string; romaji: string }>;
    lessonNotes: string;
    date: string;
  }): Promise<FlexMessage> {
    const season = this.getCurrentSeason();
    const theme = SEASONAL_THEMES[season];

    return {
      type: 'flex',
      altText: `${data.studentName}さんのレッスン写真`,
      contents: {
        type: 'bubble',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: `${theme.emoji} レッスン写真`,
              weight: 'bold',
              color: '#FFFFFF',
              size: 'lg'
            },
            {
              type: 'text',
              text: data.date,
              color: '#FFFFFF',
              size: 'sm',
              margin: 'xs'
            }
          ],
          backgroundColor: theme.color,
          paddingAll: '12px'
        },
        hero: {
          type: 'image',
          url: data.photoUrl,
          size: 'full',
          aspectRatio: '20:13',
          aspectMode: 'cover'
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: data.studentName + 'さん',
              weight: 'bold',
              size: 'xl',
              margin: 'none'
            },
            {
              type: 'text',
              text: data.message,
              size: 'md',
              margin: 'md',
              wrap: true
            },
            ...(data.vocabulary.length > 0 ? [
              {
                type: 'separator',
                margin: 'lg'
              },
              {
                type: 'text',
                text: '📚 今日の新しい単語',
                weight: 'bold',
                size: 'md',
                margin: 'lg',
                color: '#666666'
              },
              ...data.vocabulary.slice(0, 3).map((word: any) => ({
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: word.english,
                    flex: 2,
                    weight: 'bold',
                    color: '#2563EB'
                  },
                  {
                    type: 'text',
                    text: `${word.japanese} (${word.romaji})`,
                    flex: 3,
                    size: 'sm',
                    color: '#666666'
                  }
                ],
                margin: 'sm'
              }))
            ] : []),
            ...(data.lessonNotes ? [
              {
                type: 'separator',
                margin: 'lg'
              },
              {
                type: 'text',
                text: '📝 レッスンメモ',
                weight: 'bold',
                size: 'md',
                margin: 'lg',
                color: '#666666'
              },
              {
                type: 'text',
                text: data.lessonNotes,
                size: 'sm',
                margin: 'sm',
                wrap: true,
                color: '#666666'
              }
            ] : [])
          ]
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: 'いつもありがとうございます！',
              size: 'sm',
              color: '#999999',
              align: 'center'
            }
          ],
          margin: 'sm'
        }
      }
    };
  }

  // Send lesson photo message to parent
  async sendLessonPhotoToParent(parentLineId: string, data: {
    studentName: string;
    photoUrl: string;
    message: string;
    vocabulary: Array<{ english: string; japanese: string; romaji: string }>;
    lessonNotes: string;
    date: string;
  }): Promise<void> {
    try {
      const flexMessage = await this.createLessonPhotoMessage(data);
      await this.client.pushMessage(parentLineId, flexMessage);
      
      logger.info('Lesson photo sent to parent successfully', { 
        parentLineId, 
        studentName: data.studentName 
      });
    } catch (error) {
      logger.error({ 
        error, 
        parentLineId, 
        studentName: data.studentName 
      }, 'Failed to send lesson photo to parent');
      throw error;
    }
  }
}

export const lineService = new LineService();