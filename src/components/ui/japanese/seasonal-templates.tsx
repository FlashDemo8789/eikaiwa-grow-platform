'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { japaneseUtils } from '@/services/japanese-utils.service';
import { SEASONAL_THEMES } from '@/services/line.service';

interface SeasonalEvent {
  id: string;
  name: string;
  description: string;
  date: string;
  activities: string[];
  materials: string[];
  preparation: string[];
}

export const SEASONAL_EVENTS: Record<string, SeasonalEvent[]> = {
  spring: [
    {
      id: 'entrance_ceremony',
      name: '入学式',
      description: '新年度の始まりを祝う大切な式典です',
      date: '4月上旬',
      activities: [
        '新入生の紹介',
        '英語での自己紹介',
        '学校案内ツアー',
        '記念撮影',
        'ウェルカムパーティー'
      ],
      materials: [
        '入学証書（英語版）',
        'ウェルカムバッジ',
        '学校パンフレット',
        '記念品',
        '桜の装飾'
      ],
      preparation: [
        '会場の桜装飾',
        '新入生リストの準備',
        '式典プログラムの作成',
        '記念撮影スポットの設置',
        '保護者向け資料の準備'
      ]
    },
    {
      id: 'hanami_event',
      name: 'お花見イベント',
      description: '桜を楽しみながら英語でのコミュニケーション',
      date: '4月中旬',
      activities: [
        '桜の下でピクニック',
        '英語での花見の歌',
        '桜に関する英語レッスン',
        '写真撮影',
        '桜餅作り体験'
      ],
      materials: [
        'ピクニックシート',
        '桜の歌の楽譜',
        '英語の桜関連教材',
        'デジタルカメラ',
        '桜餅の材料'
      ],
      preparation: [
        '花見場所の確保',
        '天候の確認',
        '参加者の健康チェック',
        'アレルギー対応の確認',
        '緊急連絡先の準備'
      ]
    }
  ],
  summer: [
    {
      id: 'tanabata_festival',
      name: '七夕まつり',
      description: '願い事を英語で書いて短冊に飾ります',
      date: '7月7日',
      activities: [
        '英語で願い事を書く',
        '短冊作り',
        '七夕の歌（英語版）',
        '星座について学習',
        '天の川観察'
      ],
      materials: [
        '竹の枝',
        '色とりどりの短冊',
        '筆ペン・マーカー',
        '星座の資料',
        '望遠鏡（任意）'
      ],
      preparation: [
        '竹の準備と設置',
        '短冊の準備',
        '七夕の英語資料作成',
        '装飾の準備',
        '星座観察の準備'
      ]
    },
    {
      id: 'summer_camp',
      name: 'サマーキャンプ',
      description: '自然の中で英語を学ぶ集中プログラム',
      date: '7月下旬-8月上旬',
      activities: [
        'キャンプファイヤー',
        '英語での自然観察',
        'アウトドアクッキング',
        '星空観察',
        '国際交流ゲーム'
      ],
      materials: [
        'テント・寝袋',
        'キャンプ用品',
        '自然観察ガイド',
        '料理用具',
        '懐中電灯'
      ],
      preparation: [
        'キャンプ場の予約',
        '安全管理計画',
        '保護者への説明会',
        '健康管理の準備',
        '緊急時の対応計画'
      ]
    }
  ],
  autumn: [
    {
      id: 'sports_day',
      name: '運動会',
      description: '英語を使ったスポーツイベント',
      date: '10月中旬',
      activities: [
        '英語での応援合戦',
        '国際的なスポーツ体験',
        'チーム対抗ゲーム',
        '表彰式（英語）',
        '記念撮影'
      ],
      materials: [
        '運動用具',
        '応援グッズ',
        '表彰状（英語版）',
        'メダル・トロフィー',
        '救急用品'
      ],
      preparation: [
        '会場の準備',
        'チーム分けの決定',
        '安全対策の確認',
        '保護者への案内',
        '天候対策の準備'
      ]
    },
    {
      id: 'halloween_party',
      name: 'ハロウィンパーティー',
      description: '仮装して英語でハロウィンを楽しみます',
      date: '10月31日',
      activities: [
        '仮装コンテスト',
        'Trick or Treat',
        'ハロウィンソングの合唱',
        'パンプキンカービング',
        'ハロウィンクイズ'
      ],
      materials: [
        '仮装衣装',
        'ハロウィンお菓子',
        'かぼちゃ',
        'カービング用具',
        '装飾用品'
      ],
      preparation: [
        '教室の飾り付け',
        'お菓子の準備',
        '安全な仮装ガイドライン',
        '活動エリアの設定',
        '写真撮影の準備'
      ]
    }
  ],
  winter: [
    {
      id: 'christmas_event',
      name: 'クリスマスイベント',
      description: '英語圏のクリスマス文化を体験',
      date: '12月25日',
      activities: [
        'クリスマスソング合唱',
        'プレゼント交換',
        'クリスマスクッキー作り',
        '英語でのカード作成',
        'サンタとの記念撮影'
      ],
      materials: [
        'クリスマスツリー',
        'オーナメント',
        'プレゼント用品',
        'クッキーの材料',
        'サンタ衣装'
      ],
      preparation: [
        'ツリーの飾り付け',
        'プレゼント交換の準備',
        'クッキング材料の調達',
        '安全対策の確認',
        'アレルギー対応の準備'
      ]
    },
    {
      id: 'new_year_event',
      name: '新年イベント',
      description: '日本と英語圏の新年文化を比較学習',
      date: '1月上旬',
      activities: [
        '新年の挨拶（英語・日本語）',
        '書き初め（英語版）',
        '福笑いゲーム',
        '新年の抱負発表',
        'お雑煮作り体験'
      ],
      materials: [
        '書道用具',
        '福笑いセット',
        'お雑煮の材料',
        '新年カード',
        '和装小物'
      ],
      preparation: [
        '新年装飾の準備',
        '書き初め用紙の準備',
        '料理材料の調達',
        '文化比較資料の作成',
        '安全な調理環境の準備'
      ]
    }
  ]
};

interface SeasonalTemplateProps {
  season?: 'spring' | 'summer' | 'autumn' | 'winter' | 'current';
  eventType?: 'all' | 'ceremony' | 'festival' | 'educational' | 'cultural';
  compact?: boolean;
  onEventSelect?: (event: SeasonalEvent) => void;
  className?: string;
}

export function SeasonalTemplate({
  season = 'current',
  eventType = 'all',
  compact = false,
  onEventSelect,
  className = ''
}: SeasonalTemplateProps) {
  const t = useTranslations();
  
  const currentSeason = season === 'current' ? 
    japaneseUtils.getJapaneseSeason() : season;
  
  const seasonalTheme = SEASONAL_THEMES[currentSeason];
  const events = SEASONAL_EVENTS[currentSeason] || [];

  const filteredEvents = events.filter(event => {
    if (eventType === 'all') return true;
    
    const eventCategories: Record<string, string[]> = {
      ceremony: ['entrance_ceremony'],
      festival: ['tanabata_festival', 'halloween_party'],
      educational: ['summer_camp', 'sports_day'],
      cultural: ['hanami_event', 'christmas_event', 'new_year_event']
    };
    
    return eventCategories[eventType]?.includes(event.id) || false;
  });

  return (
    <div className={`seasonal-template ${className}`}>
      <div 
        className="seasonal-header p-4 rounded-t-lg"
        style={{ backgroundColor: seasonalTheme.color, opacity: 0.9 }}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">{seasonalTheme.emoji}</span>
          <div>
            <h2 className="text-xl font-bold text-white">
              {t(`seasonal.${currentSeason}.greeting`)}
            </h2>
            <p className="text-white opacity-90 text-sm">
              {t(`seasonal.${currentSeason}.events`)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-b-lg shadow-lg">
        {filteredEvents.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>この季節のイベントが見つかりません。</p>
          </div>
        ) : (
          <div className={`grid gap-4 p-4 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                compact={compact}
                seasonColor={seasonalTheme.color}
                onClick={() => onEventSelect?.(event)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface EventCardProps {
  event: SeasonalEvent;
  compact: boolean;
  seasonColor: string;
  onClick?: () => void;
}

function EventCard({ event, compact, seasonColor, onClick }: EventCardProps) {
  return (
    <div 
      className={`event-card border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${
        compact ? 'bg-gray-50' : 'bg-white'
      }`}
      onClick={onClick}
      style={{ borderLeftColor: seasonColor, borderLeftWidth: '4px' }}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg japanese-event-title">{event.name}</h3>
        <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600">
          {event.date}
        </span>
      </div>
      
      <p className="text-gray-600 text-sm mb-3">{event.description}</p>
      
      {!compact && (
        <>
          <div className="mb-3">
            <h4 className="font-medium text-sm mb-1">主な活動:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              {event.activities.slice(0, 3).map((activity, index) => (
                <li key={index} className="flex items-start gap-1">
                  <span className="text-blue-500">•</span>
                  {activity}
                </li>
              ))}
              {event.activities.length > 3 && (
                <li className="text-gray-400">他 {event.activities.length - 3} 項目...</li>
              )}
            </ul>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              準備: {event.preparation.length}項目
            </span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
              材料: {event.materials.length}個
            </span>
          </div>
        </>
      )}
    </div>
  );
}

interface EventPlannerProps {
  event: SeasonalEvent;
  onSave: (plan: any) => void;
  onClose: () => void;
  className?: string;
}

export function EventPlanner({ event, onSave, onClose, className = '' }: EventPlannerProps) {
  const t = useTranslations();
  const [plan, setPlan] = React.useState({
    eventId: event.id,
    date: '',
    time: '',
    location: '',
    participants: 0,
    budget: 0,
    selectedActivities: event.activities.slice(0, 3),
    selectedMaterials: event.materials.slice(0, 5),
    additionalNotes: ''
  });

  const handleSave = () => {
    const eventPlan = {
      ...plan,
      eventName: event.name,
      eventDescription: event.description,
      createdAt: new Date(),
      season: japaneseUtils.getJapaneseSeason()
    };
    onSave(eventPlan);
  };

  return (
    <div className={`event-planner bg-white p-6 rounded-lg shadow-lg ${className}`}>
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-bold japanese-title">{event.name} - イベント企画</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">開催日</label>
            <input
              type="date"
              value={plan.date}
              onChange={(e) => setPlan({ ...plan, date: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">開催時間</label>
            <input
              type="time"
              value={plan.time}
              onChange={(e) => setPlan({ ...plan, time: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">開催場所</label>
          <input
            type="text"
            value={plan.location}
            onChange={(e) => setPlan({ ...plan, location: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="例: 第1教室、体育館、校庭"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">参加予定者数</label>
            <input
              type="number"
              value={plan.participants}
              onChange={(e) => setPlan({ ...plan, participants: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border rounded-md"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">予算 (円)</label>
            <input
              type="number"
              value={plan.budget}
              onChange={(e) => setPlan({ ...plan, budget: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border rounded-md"
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">実施活動</label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {event.activities.map((activity, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="checkbox"
                  checked={plan.selectedActivities.includes(activity)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setPlan({
                        ...plan,
                        selectedActivities: [...plan.selectedActivities, activity]
                      });
                    } else {
                      setPlan({
                        ...plan,
                        selectedActivities: plan.selectedActivities.filter(a => a !== activity)
                      });
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm">{activity}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">必要な材料・用品</label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {event.materials.map((material, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="checkbox"
                  checked={plan.selectedMaterials.includes(material)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setPlan({
                        ...plan,
                        selectedMaterials: [...plan.selectedMaterials, material]
                      });
                    } else {
                      setPlan({
                        ...plan,
                        selectedMaterials: plan.selectedMaterials.filter(m => m !== material)
                      });
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm">{material}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">追加メモ・特記事項</label>
          <textarea
            value={plan.additionalNotes}
            onChange={(e) => setPlan({ ...plan, additionalNotes: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            rows={3}
            placeholder="アレルギー対応、特別な配慮事項、連絡事項など"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={handleSave}
            disabled={!plan.date || !plan.time || !plan.location}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            イベント企画を保存
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}