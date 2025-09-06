'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { japaneseUtils } from '@/services/japanese-utils.service';

export interface ParentCommunicationTemplate {
  id: string;
  title: string;
  type: 'notification' | 'progress' | 'event' | 'billing' | 'emergency' | 'seasonal';
  formality: 'formal' | 'polite' | 'casual';
  template: string;
  variables: string[];
  description: string;
}

export const PARENT_COMMUNICATION_TEMPLATES: ParentCommunicationTemplate[] = [
  {
    id: 'monthly_progress',
    title: '月次進捗レポート',
    type: 'progress',
    formality: 'formal',
    template: `{parentName}様

いつもお世話になっております。
{schoolName}の{teacherName}です。

{studentName}さんの{month}月の学習状況をご報告いたします。

【出席状況】
・出席日数：{attendanceDays}日/{totalDays}日
・出席率：{attendanceRate}%

【学習進捗】
・現在のレベル：{currentLevel}
・今月の重点学習項目：{focusAreas}
・習得スキル：{acquiredSkills}

【今月の成果】
{achievements}

【来月の学習目標】
{nextMonthGoals}

【ご家庭でのサポートのお願い】
{homeSupport}

ご不明な点やご相談がございましたら、お気軽にお声かけください。

今後ともよろしくお願いいたします。

{schoolName}
{teacherName}
TEL: {schoolPhone}
Email: {schoolEmail}`,
    variables: [
      'parentName', 'schoolName', 'teacherName', 'studentName', 'month',
      'attendanceDays', 'totalDays', 'attendanceRate', 'currentLevel',
      'focusAreas', 'acquiredSkills', 'achievements', 'nextMonthGoals',
      'homeSupport', 'schoolPhone', 'schoolEmail'
    ],
    description: '月次の学習進捗を保護者様に丁寧にお伝えするテンプレート'
  },
  {
    id: 'event_invitation',
    title: 'イベント参加のご案内',
    type: 'event',
    formality: 'polite',
    template: `{parentName}様

{seasonalGreeting}

{schoolName}より、{eventName}のご案内をいたします。

【イベント概要】
・日時：{eventDate} {eventTime}
・場所：{eventLocation}
・対象：{targetStudents}
・参加費：{eventFee}

【イベント内容】
{eventDescription}

【持ち物】
{requiredItems}

【参加申し込み】
参加をご希望の場合は、{applicationDeadline}までに
お申し込みください。

{applicationMethod}

お子様の成長を見守る大切な機会となりますので、
ぜひご参加いただければと思います。

ご質問がございましたら、お気軽にお問い合わせください。

{schoolName}
{teacherName}
TEL: {schoolPhone}`,
    variables: [
      'parentName', 'seasonalGreeting', 'schoolName', 'eventName',
      'eventDate', 'eventTime', 'eventLocation', 'targetStudents',
      'eventFee', 'eventDescription', 'requiredItems', 'applicationDeadline',
      'applicationMethod', 'teacherName', 'schoolPhone'
    ],
    description: '学校イベントへの参加案内を送るテンプレート'
  },
  {
    id: 'absence_concern',
    title: '欠席が続く際のご連絡',
    type: 'notification',
    formality: 'formal',
    template: `{parentName}様

いつもお世話になっております。
{schoolName}の{teacherName}です。

{studentName}さんが{absencePeriod}お休みされており、
体調面や学習面でご心配をしております。

現在の状況はいかがでしょうか。
差し支えのない範囲で、状況をお聞かせください。

【お休みの期間】
{absenceDates}

【現在の学習進度】
{currentProgress}

【復帰時のサポート】
授業に復帰される際は、以下のサポートを
準備しております：

{supportOptions}

無理のない範囲で結構ですので、
お子様の体調を最優先に考えていただければと思います。

何かお手伝いできることがございましたら、
いつでもご連絡ください。

一日も早い回復を心よりお祈りしております。

{schoolName}
{teacherName}
TEL: {schoolPhone}
Email: {schoolEmail}`,
    variables: [
      'parentName', 'schoolName', 'teacherName', 'studentName',
      'absencePeriod', 'absenceDates', 'currentProgress', 'supportOptions',
      'schoolPhone', 'schoolEmail'
    ],
    description: '生徒の欠席が続く際の心配と支援を伝えるテンプレート'
  },
  {
    id: 'payment_reminder',
    title: 'お支払いのご案内',
    type: 'billing',
    formality: 'formal',
    template: `{parentName}様

いつもお世話になっております。
{schoolName}事務局です。

{month}月分の月謝につきまして、
お支払いのご案内をいたします。

【請求内容】
・月謝：{tuitionFee}円
・教材費：{materialFee}円
・イベント費：{eventFee}円
・合計金額：{totalAmount}円（税込）

【お支払い期限】
{paymentDueDate}

【お支払い方法】
{paymentMethods}

お支払いがお済みでない場合は、
お早めにお手続きをお願いいたします。

ご不明な点やお支払いに関するご相談が
ございましたら、お気軽にご連絡ください。

今後ともよろしくお願いいたします。

{schoolName} 事務局
TEL: {schoolPhone}
受付時間：{officeHours}`,
    variables: [
      'parentName', 'schoolName', 'month', 'tuitionFee', 'materialFee',
      'eventFee', 'totalAmount', 'paymentDueDate', 'paymentMethods',
      'schoolPhone', 'officeHours'
    ],
    description: 'お支払いの案内を丁寧にお伝えするテンプレート'
  },
  {
    id: 'seasonal_greeting',
    title: '季節のご挨拶',
    type: 'seasonal',
    formality: 'polite',
    template: `{parentName}様

{seasonalGreeting}

いつも{schoolName}の教育活動にご理解とご協力を
いただき、ありがとうございます。

{seasonalComment}

【今シーズンの活動予定】
{seasonalActivities}

【お知らせ】
{announcements}

{closingGreeting}

何かご質問やご要望がございましたら、
お気軽にお声かけください。

{schoolName}
{teacherName}
TEL: {schoolPhone}`,
    variables: [
      'parentName', 'seasonalGreeting', 'schoolName', 'seasonalComment',
      'seasonalActivities', 'announcements', 'closingGreeting',
      'teacherName', 'schoolPhone'
    ],
    description: '季節に応じた挨拶文を送るテンプレート'
  },
  {
    id: 'emergency_notification',
    title: '緊急時のお知らせ',
    type: 'emergency',
    formality: 'formal',
    template: `{parentName}様

{schoolName}より緊急のお知らせです。

【件名】{emergencyTitle}

【発生時刻】{emergencyTime}

【状況】
{emergencyDescription}

【対応状況】
{responseActions}

【お子様への影響】
{studentImpact}

【今後の予定】
{futureSchedule}

【お願い】
{parentRequests}

追加情報が入り次第、改めてご連絡いたします。

ご不明な点がございましたら、
下記までお電話ください。

{schoolName}
緊急連絡先：{emergencyPhone}
通常連絡先：{schoolPhone}`,
    variables: [
      'parentName', 'schoolName', 'emergencyTitle', 'emergencyTime',
      'emergencyDescription', 'responseActions', 'studentImpact',
      'futureSchedule', 'parentRequests', 'emergencyPhone', 'schoolPhone'
    ],
    description: '緊急時の保護者への連絡テンプレート'
  }
];

interface ParentCommunicationComposerProps {
  template?: ParentCommunicationTemplate;
  onSend?: (message: any) => void;
  onSave?: (draft: any) => void;
  className?: string;
}

export function ParentCommunicationComposer({
  template,
  onSend,
  onSave,
  className = ''
}: ParentCommunicationComposerProps) {
  const t = useTranslations();
  const [selectedTemplate, setSelectedTemplate] = React.useState<ParentCommunicationTemplate | null>(template || null);
  const [variables, setVariables] = React.useState<Record<string, string>>({});
  const [customMessage, setCustomMessage] = React.useState('');
  const [recipients, setRecipients] = React.useState<string[]>([]);
  const [sendMethod, setSendMethod] = React.useState<'email' | 'line' | 'both'>('email');

  React.useEffect(() => {
    if (selectedTemplate) {
      const defaultVariables: Record<string, string> = {};
      selectedTemplate.variables.forEach(variable => {
        defaultVariables[variable] = getDefaultValue(variable);
      });
      setVariables(defaultVariables);
      setCustomMessage(selectedTemplate.template);
    }
  }, [selectedTemplate]);

  const getDefaultValue = (variable: string): string => {
    const defaults: Record<string, string> = {
      schoolName: 'EikaiwaGrow English School',
      teacherName: '田中先生',
      schoolPhone: '03-1234-5678',
      schoolEmail: 'info@eikaiwa-grow.com',
      seasonalGreeting: japaneseUtils.getCurrentSeason() === 'spring' ? '春の陽気が心地よい季節となりました' :
                       japaneseUtils.getCurrentSeason() === 'summer' ? '暑い日が続いておりますが、いかがお過ごしでしょうか' :
                       japaneseUtils.getCurrentSeason() === 'autumn' ? '秋の深まりを感じる頃となりました' :
                       '寒い日が続いておりますが、お元気でお過ごしでしょうか',
      month: `${new Date().getMonth() + 1}月`,
      eventDate: japaneseUtils.formatJapaneseDate(new Date()),
      paymentDueDate: japaneseUtils.formatJapaneseDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
      emergencyTime: japaneseUtils.formatJapaneseDate(new Date()) + ' ' + japaneseUtils.formatJapaneseTime(new Date()),
      officeHours: '月〜金 9:00-18:00'
    };
    return defaults[variable] || '';
  };

  const processTemplate = (template: string, vars: Record<string, string>): string => {
    let processed = template;
    Object.entries(vars).forEach(([key, value]) => {
      processed = processed.replace(new RegExp(`{${key}}`, 'g'), value);
    });
    return processed;
  };

  const handleVariableChange = (variable: string, value: string) => {
    const newVariables = { ...variables, [variable]: value };
    setVariables(newVariables);
    if (selectedTemplate) {
      setCustomMessage(processTemplate(selectedTemplate.template, newVariables));
    }
  };

  const handleSend = () => {
    if (onSend) {
      onSend({
        template: selectedTemplate,
        message: customMessage,
        variables,
        recipients,
        sendMethod,
        sentAt: new Date()
      });
    }
  };

  const handleSaveDraft = () => {
    if (onSave) {
      onSave({
        template: selectedTemplate,
        message: customMessage,
        variables,
        recipients,
        sendMethod,
        savedAt: new Date()
      });
    }
  };

  return (
    <div className={`parent-communication-composer bg-white p-6 rounded-lg shadow-lg ${className}`}>
      <h2 className="text-xl font-bold japanese-title mb-6">保護者への連絡作成</h2>

      {!selectedTemplate ? (
        <div className="space-y-4">
          <h3 className="font-medium mb-3">テンプレートを選択してください</h3>
          <div className="grid gap-3">
            {PARENT_COMMUNICATION_TEMPLATES.map((template) => (
              <div
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className="p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{template.title}</h4>
                  <div className="flex gap-1">
                    <span className={`text-xs px-2 py-1 rounded ${
                      template.type === 'emergency' ? 'bg-red-100 text-red-700' :
                      template.type === 'billing' ? 'bg-yellow-100 text-yellow-700' :
                      template.type === 'event' ? 'bg-purple-100 text-purple-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {template.type}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      template.formality === 'formal' ? 'bg-gray-100 text-gray-700' :
                      template.formality === 'polite' ? 'bg-green-100 text-green-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {template.formality === 'formal' ? '敬語' : 
                       template.formality === 'polite' ? '丁寧語' : 'カジュアル'}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{template.description}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">{selectedTemplate.title}</h3>
            <button
              onClick={() => setSelectedTemplate(null)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              テンプレート変更
            </button>
          </div>

          {selectedTemplate.variables.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">内容を入力してください</h4>
              <div className="grid grid-cols-2 gap-4">
                {selectedTemplate.variables.map((variable) => (
                  <div key={variable}>
                    <label className="block text-sm font-medium mb-1">
                      {getVariableLabel(variable)}
                    </label>
                    <input
                      type="text"
                      value={variables[variable] || ''}
                      onChange={(e) => handleVariableChange(variable, e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      placeholder={getVariablePlaceholder(variable)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">メッセージプレビュー</label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full px-3 py-2 border rounded-md japanese-text"
              rows={12}
              style={{ fontFamily: '"Noto Sans JP", "Yu Gothic", "Meiryo", sans-serif' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">送信方法</label>
              <select
                value={sendMethod}
                onChange={(e) => setSendMethod(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="email">メール</option>
                <option value="line">LINE</option>
                <option value="both">メール + LINE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">宛先</label>
              <input
                type="text"
                placeholder="保護者を選択..."
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={handleSend}
              disabled={!customMessage.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              送信
            </button>
            <button
              onClick={handleSaveDraft}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              下書き保存
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions
function getVariableLabel(variable: string): string {
  const labels: Record<string, string> = {
    parentName: '保護者名',
    studentName: '生徒名',
    schoolName: '学校名',
    teacherName: '教師名',
    month: '月',
    attendanceDays: '出席日数',
    totalDays: '総日数',
    attendanceRate: '出席率',
    eventName: 'イベント名',
    eventDate: '開催日',
    eventTime: '開催時間',
    eventLocation: '開催場所',
    tuitionFee: '月謝',
    totalAmount: '合計金額',
    paymentDueDate: '支払期限',
    emergencyTitle: '緊急事態のタイトル',
    emergencyTime: '発生時刻',
    schoolPhone: '学校電話番号'
  };
  return labels[variable] || variable;
}

function getVariablePlaceholder(variable: string): string {
  const placeholders: Record<string, string> = {
    parentName: '田中様',
    studentName: '田中太郎',
    schoolName: 'EikaiwaGrow English School',
    teacherName: '田中先生',
    attendanceDays: '15',
    totalDays: '20',
    attendanceRate: '75',
    eventName: 'ハロウィンパーティー',
    tuitionFee: '8000',
    totalAmount: '8800'
  };
  return placeholders[variable] || '';
}