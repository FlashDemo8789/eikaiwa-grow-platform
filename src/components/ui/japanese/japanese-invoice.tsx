'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { japaneseUtils } from '@/services/japanese-utils.service';
import { HankoSeal } from './hanko-seal';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface InvoiceProps {
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  clientName: string;
  clientAddress: {
    zipCode: string;
    prefecture: string;
    city: string;
    town: string;
    building?: string;
  };
  schoolName: string;
  schoolAddress: {
    zipCode: string;
    prefecture: string;
    city: string;
    town: string;
    building?: string;
  };
  schoolPhone: string;
  principalName: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  bankInfo?: {
    bankName: string;
    branchName: string;
    accountType: string;
    accountNumber: string;
    accountName: string;
  };
  className?: string;
}

export function JapaneseInvoice({
  invoiceNumber,
  issueDate,
  dueDate,
  clientName,
  clientAddress,
  schoolName,
  schoolAddress,
  schoolPhone,
  principalName,
  items,
  subtotal,
  tax,
  total,
  notes,
  bankInfo,
  className = ''
}: InvoiceProps) {
  const t = useTranslations();

  const formatAddress = (addr: typeof clientAddress) => {
    return `〒${addr.zipCode} ${addr.prefecture}${addr.city}${addr.town}${addr.building ? ' ' + addr.building : ''}`;
  };

  const formatCurrency = (amount: number) => japaneseUtils.formatJapaneseCurrency(amount);

  return (
    <div className={`japanese-invoice bg-white p-8 max-w-4xl mx-auto ${className}`} style={{ fontFamily: '"Noto Sans JP", "Yu Gothic", "Meiryo", sans-serif' }}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold japanese-title mb-2">請求書</h1>
        <div className="text-sm text-gray-600">
          <p>Invoice No: {invoiceNumber}</p>
          <p>{japaneseUtils.formatJapaneseDate(issueDate)}発行</p>
        </div>
      </div>

      {/* Client and School Information */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Client Info */}
        <div>
          <div className="border-b-2 border-black pb-1 mb-3">
            <h2 className="text-lg font-bold">請求先</h2>
          </div>
          <div className="space-y-1 text-sm">
            <p className="font-bold text-lg">{clientName} 様</p>
            <p>{formatAddress(clientAddress)}</p>
          </div>
        </div>

        {/* School Info */}
        <div className="text-right">
          <div className="space-y-1 text-sm">
            <p className="font-bold text-lg">{schoolName}</p>
            <p>{formatAddress(schoolAddress)}</p>
            <p>TEL: {schoolPhone}</p>
            <div className="flex justify-end items-center mt-3">
              <div className="text-right mr-3">
                <p className="text-xs">校長</p>
                <p className="font-medium">{principalName}</p>
              </div>
              <HankoSeal name={principalName} size="medium" style="traditional" />
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="mb-8">
        <div className="grid grid-cols-2 gap-8 mb-4">
          <div>
            <div className="bg-gray-100 p-3 rounded">
              <p className="text-sm font-medium">支払期限</p>
              <p className="text-lg font-bold text-red-600">
                {japaneseUtils.formatJapaneseDate(dueDate)}
              </p>
            </div>
          </div>
          <div>
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm font-medium">請求金額</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(total)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">項目</th>
              <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium w-20">数量</th>
              <th className="border border-gray-300 px-3 py-2 text-right text-sm font-medium w-24">単価</th>
              <th className="border border-gray-300 px-3 py-2 text-right text-sm font-medium w-28">金額</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td className="border border-gray-300 px-3 py-2 text-sm">{item.description}</td>
                <td className="border border-gray-300 px-3 py-2 text-center text-sm">{item.quantity}</td>
                <td className="border border-gray-300 px-3 py-2 text-right text-sm">{formatCurrency(item.unitPrice)}</td>
                <td className="border border-gray-300 px-3 py-2 text-right text-sm font-medium">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
            {/* Empty rows for spacing */}
            {Array.from({ length: Math.max(0, 5 - items.length) }).map((_, index) => (
              <tr key={`empty-${index}`}>
                <td className="border border-gray-300 px-3 py-2 text-sm h-8">&nbsp;</td>
                <td className="border border-gray-300 px-3 py-2 text-center text-sm">&nbsp;</td>
                <td className="border border-gray-300 px-3 py-2 text-right text-sm">&nbsp;</td>
                <td className="border border-gray-300 px-3 py-2 text-right text-sm">&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-80">
          <div className="space-y-2">
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-sm">小計</span>
              <span className="text-sm font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-sm">消費税（10%）</span>
              <span className="text-sm font-medium">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between py-2 border-t-2 border-black">
              <span className="text-lg font-bold">合計金額</span>
              <span className="text-lg font-bold">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Information */}
      {bankInfo && (
        <div className="mb-8">
          <div className="bg-yellow-50 p-4 rounded border">
            <h3 className="font-bold text-sm mb-2">お振込先</h3>
            <div className="text-sm space-y-1">
              <p>銀行名: {bankInfo.bankName}</p>
              <p>支店名: {bankInfo.branchName}</p>
              <p>預金種別: {bankInfo.accountType}</p>
              <p>口座番号: {bankInfo.accountNumber}</p>
              <p>口座名義: {bankInfo.accountName}</p>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              ※振込手数料はお客様負担でお願いいたします
            </p>
          </div>
        </div>
      )}

      {/* Notes */}
      {notes && (
        <div className="mb-8">
          <div className="border-t pt-4">
            <h3 className="font-medium text-sm mb-2">備考</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{notes}</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t pt-4 text-center text-xs text-gray-500">
        <p>本請求書は{japaneseUtils.formatJapaneseDate(new Date())}に発行されました。</p>
        <p>ご質問がございましたら、上記連絡先までお気軽にお問い合わせください。</p>
      </div>
    </div>
  );
}

interface QuickInvoiceFormProps {
  onGenerate: (invoiceData: any) => void;
  className?: string;
}

export function QuickInvoiceForm({ onGenerate, className = '' }: QuickInvoiceFormProps) {
  const t = useTranslations();
  const [formData, setFormData] = React.useState({
    clientName: '',
    monthlyFee: 8000,
    materialFee: 0,
    eventFee: 0,
    discount: 0,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    notes: ''
  });

  const subtotal = formData.monthlyFee + formData.materialFee + formData.eventFee - formData.discount;
  const tax = Math.floor(subtotal * 0.1);
  const total = subtotal + tax;

  const handleGenerate = () => {
    const invoiceData = {
      ...formData,
      subtotal,
      tax,
      total,
      issueDate: new Date(),
      invoiceNumber: `INV-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    };
    onGenerate(invoiceData);
  };

  return (
    <div className={`quick-invoice-form p-6 bg-gray-50 rounded-lg ${className}`}>
      <h3 className="text-lg font-bold mb-4 japanese-heading">請求書作成</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">お客様名</label>
          <input
            type="text"
            value={formData.clientName}
            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="山田太郎"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">月謝</label>
            <input
              type="number"
              value={formData.monthlyFee}
              onChange={(e) => setFormData({ ...formData, monthlyFee: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border rounded-md"
              min="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">教材費</label>
            <input
              type="number"
              value={formData.materialFee}
              onChange={(e) => setFormData({ ...formData, materialFee: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border rounded-md"
              min="0"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">イベント費</label>
            <input
              type="number"
              value={formData.eventFee}
              onChange={(e) => setFormData({ ...formData, eventFee: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border rounded-md"
              min="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">割引額</label>
            <input
              type="number"
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border rounded-md"
              min="0"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">支払期限</label>
          <input
            type="date"
            value={formData.dueDate.toISOString().split('T')[0]}
            onChange={(e) => setFormData({ ...formData, dueDate: new Date(e.target.value) })}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">備考</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            rows={3}
            placeholder="特記事項がありましたらご記入ください"
          />
        </div>
        
        <div className="bg-blue-50 p-4 rounded-md">
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>小計:</span>
              <span>{japaneseUtils.formatJapaneseCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>消費税 (10%):</span>
              <span>{japaneseUtils.formatJapaneseCurrency(tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>合計:</span>
              <span>{japaneseUtils.formatJapaneseCurrency(total)}</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={!formData.clientName.trim()}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          請求書を生成
        </button>
      </div>
    </div>
  );
}