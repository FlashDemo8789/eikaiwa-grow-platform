# EikaiwaGrow - Japanese Market Features

## 概要 (Overview)

EikaiwaGrowは日本の英会話教室のために特別に設計された包括的な管理システムです。日本の文化、ビジネス慣行、および技術的好みに完全に適合しています。

## 🇯🇵 日本市場向け機能 (Japanese Market Features)

### 1. LINE Business API 連携

#### LINE Login OAuth
- 完全なLINEログイン認証システム
- 日本語UIでのユーザーフレンドリーな認証フロー
- LINE友達登録状況の自動検出
- メールアドレス取得とアカウント連携

```typescript
// LINE認証の使用例
import { lineAuthService } from '@/services/line-auth.service';

const authUrl = lineAuthService.generateAuthUrl('/dashboard');
// ユーザーをLINEログインにリダイレクト
```

#### LINE Messaging API
- 季節に応じた自動メッセージ配信
- リッチメニューの作成と管理
- フレックスメッセージによる美しい通知
- 保護者への自動連絡システム
- ブロードキャスト機能

```typescript
// メッセージ送信例
await lineService.sendEventNotification(userId, {
  name: 'ハロウィンパーティー',
  date: '2024年10月31日',
  location: '第1教室',
  description: '仮装してお越しください！'
});
```

#### LIFF (LINE Front-end Framework)
- LINE内でのWebアプリ体験
- QRコード読み取り機能
- 共有機能（日本のグループ共有文化に対応）
- モバイル最適化されたUI

### 2. 日本語ローカリゼーション (Internationalization)

#### 完全な日本語対応
- `next-intl`を使用した多言語システム
- 包括的な日本語翻訳
- 日本標準時(JST)対応
- 日本の祝日カレンダー統合

#### 文化的に適切な表現
- 敬語・丁寧語の使い分け
- 季節の挨拶文
- ビジネス文書に適した文言
- 保護者向けの適切な敬語表現

#### 日本式日付・時刻フォーマット
```typescript
// 日本式日付フォーマット
japaneseUtils.formatJapaneseDate(new Date()); // "2024年3月15日（金）"
japaneseUtils.formatJapaneseEraDate(new Date()); // "令和6年3月15日"
```

### 3. 日本のUI/UX 適応

#### 情報密度の高いレイアウト
- 日本人が好む情報密度の高いデザイン
- モバイルファーストのレスポンシブデザイン（95%のモバイル利用率に対応）
- Noto Sans JP フォントによる美しい日本語表示

#### 季節テーマシステム
- 春（桜）、夏（向日葵）、秋（紅葉）、冬（雪）の自動切り替え
- 季節ごとの配色とアイコン
- 文化的イベントに合わせたデザイン

#### 日本文化に根ざした色彩
```css
:root {
  --sakura: #F8BBD0;    /* 桜色 */
  --momiji: #FF6B35;    /* 紅葉色 */
  --sora: #87CEEB;      /* 空色 */
  --yamabuki: #F4C430;  /* 山吹色 */
  --murasaki: #9A4C95;  /* 紫色 */
  --midori: #4F7942;    /* 緑色 */
}
```

### 4. 日本のビジネス機能

#### 印鑑(ハンコ)システム
- デジタル印鑑の作成と管理
- 文書への印鑑押印シミュレーション
- 伝統的・現代的・学校用スタイル
- サイズと色のカスタマイズ

```tsx
<HankoSeal 
  name="田中太郎" 
  style="traditional" 
  size="medium" 
  color="#cc0000" 
/>
```

#### 日本式請求書システム
- 正式な日本の請求書フォーマット
- 消費税計算（10%対応）
- 印鑑付きの公式文書
- 銀行振込情報の表示

#### 学校年度システム（4月開始）
- 日本の学校年度カレンダー
- 3学期制対応
- 年齢に基づく学年自動判定
- 日本の教育制度に準拠

### 5. 文化的テンプレート

#### 季節のイベントテンプレート
- 入学式、お花見、七夕、運動会、ハロウィン、クリスマス、新年イベント
- 各イベントの文化的背景を考慮した内容
- 準備チェックリストと材料リスト
- 活動内容の提案

```typescript
const springEvents = SEASONAL_EVENTS.spring;
// 入学式、お花見イベントなどが含まれます
```

#### 保護者コミュニケーションテンプレート
- 適切な敬語レベルでの文書作成
- 用途別テンプレート（進捗報告、イベント案内、緊急連絡など）
- 季節の挨拶文の自動挿入
- 文化的に適切な表現の使用

### 6. 日本の決済システム

#### PayPay統合
- PayPay APIを使用した決済処理
- QRコード決済サポート
- 返金処理対応

#### コンビニ決済
- セブン-イレブン、ファミリーマート、ローソン、ミニストップ対応
- 支払い番号生成
- バーコード生成機能

#### 銀行振込
- 日本の銀行システムに対応
- 振込先情報の自動生成
- 手数料案内

#### その他の決済方法
- クレジットカード（JCB対応）
- 日本の信用カード番号バリデーション

```typescript
// 決済方法の使用例
await japanesePaymentService.createPayPayPayment({
  merchantPaymentId: 'PAY-001',
  amount: { amount: 8000, currency: 'JPY' },
  orderDescription: '3月分月謝'
});
```

### 7. 技術的特徴

#### フォント最適化
- Noto Sans JP による美しい日本語表示
- フォントサブセット最適化
- レスポンシブタイポグラフィ

#### パフォーマンス最適化
- 日本のモバイル環境に最適化
- 画像の遅延読み込み
- 効率的なバンドルサイズ

#### アクセシビリティ
- 日本語スクリーンリーダー対応
- ハイコントラスト モード サポート
- キーボード ナビゲーション

## 📁 ファイル構造

```
src/
├── services/
│   ├── line.service.ts              # LINE Business API service
│   ├── line-auth.service.ts         # LINE Login OAuth service  
│   ├── liff.service.ts              # LIFF integration service
│   ├── japanese-utils.service.ts    # Japanese utilities
│   └── japanese-payment.service.ts  # Payment processing
├── components/
│   └── ui/
│       └── japanese/
│           ├── japanese-layout.tsx       # Japanese layout component
│           ├── japanese-form.tsx         # Japanese form components
│           ├── hanko-seal.tsx           # Digital seal components
│           ├── japanese-invoice.tsx      # Invoice components
│           ├── seasonal-templates.tsx    # Seasonal event templates
│           └── parent-communication.tsx  # Parent communication
├── messages/
│   ├── ja.json                     # Japanese translations
│   └── en.json                     # English translations
├── app/
│   └── api/
│       ├── auth/
│       │   └── line/               # LINE authentication routes
│       └── line/
│           └── webhook/            # LINE webhook handler
└── i18n.ts                        # Internationalization config
```

## 🚀 セットアップとデプロイ

### 環境変数の設定

```bash
# LINE Business API
LINE_CHANNEL_ACCESS_TOKEN=""
LINE_CHANNEL_SECRET=""
LINE_LOGIN_CHANNEL_ID=""
LINE_LOGIN_CHANNEL_SECRET=""
LINE_LIFF_ID=""

# Japanese Payment Services
PAYPAY_API_KEY=""
PAYPAY_SECRET=""
PAYPAY_MERCHANT_ID=""
```

### インストール

```bash
npm install
npm run build
npm start
```

### LINE Webhook 設定

1. LINE Developers Console でWebhook URLを設定: `https://your-domain.com/api/line/webhook`
2. 必要なスコープを設定: `profile`, `openid`, `email`
3. LIFF アプリを作成してLIFF IDを取得

## 🎯 使用例

### 季節のイベント企画
```tsx
import { SeasonalTemplate } from '@/components/ui/japanese/seasonal-templates';

<SeasonalTemplate 
  season="current"
  eventType="festival"
  onEventSelect={(event) => console.log('Selected:', event.name)}
/>
```

### 保護者への連絡作成
```tsx
import { ParentCommunicationComposer } from '@/components/ui/japanese/parent-communication';

<ParentCommunicationComposer 
  onSend={(message) => sendMessage(message)}
  onSave={(draft) => saveDraft(draft)}
/>
```

### 日本式フォーム
```tsx
import { JapaneseNameForm, JapaneseAddressForm } from '@/components/ui/japanese/japanese-form';

<JapaneseNameForm 
  name={{ kanji: '田中太郎', furigana: 'たなかたろう' }}
  onChange={setName}
  required
/>
```

## 📊 日本市場への適合性

### 文化的適応
- ✅ 日本の学校年度（4月開始）
- ✅ 3学期制システム
- ✅ 適切な敬語使用
- ✅ 季節感を重視したデザイン
- ✅ 情報密度の高いレイアウト

### 技術的適応  
- ✅ LINE エコシステム完全統合
- ✅ モバイルファースト設計（95%のモバイル利用率）
- ✅ 日本語フォント最適化
- ✅ 日本時間・祝日対応
- ✅ 日本の決済システム対応

### ビジネス要件
- ✅ 印鑑システム
- ✅ 正式な請求書フォーマット
- ✅ 保護者とのフォーマルなコミュニケーション
- ✅ 季節的なイベント管理
- ✅ 日本の教育制度準拠

## 🤝 サポート

日本市場向け機能についてのご質問やサポートが必要な場合は、開発チームまでお気軽にご連絡ください。

---

**EikaiwaGrow - 日本の英会話教室のための完璧なソリューション**