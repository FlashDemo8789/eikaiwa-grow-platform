import axios from 'axios';
import { logger } from '@/lib/logger';

// PayPay payment interfaces
export interface PayPayPaymentRequest {
  merchantPaymentId: string;
  amount: {
    amount: number;
    currency: 'JPY';
  };
  orderDescription: string;
  userAuthorizationId?: string;
  redirectUrl?: string;
  metadata?: { [key: string]: string };
}

export interface PayPayPaymentResponse {
  resultInfo: {
    code: string;
    message: string;
    codeId: string;
  };
  data?: {
    paymentId: string;
    status: 'CREATED' | 'AUTHORIZED' | 'CAPTURED' | 'CANCELED' | 'REFUNDED';
    acceptedAt?: number;
    expiredAt?: number;
    links?: Array<{
      rel: string;
      href: string;
      method: string;
    }>;
  };
}

// Convenience store payment interfaces
export interface ConvenienceStorePayment {
  paymentId: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  dueDate: Date;
  instructions: {
    storeCode: string;
    paymentCode: string;
    barcode?: string;
  };
}

export interface BankTransferInfo {
  bankName: string;
  branchName: string;
  accountType: 'SAVINGS' | 'CHECKING';
  accountNumber: string;
  accountName: string;
  transferCode: string;
}

export class JapanesePaymentService {
  private payPayApiKey: string;
  private payPaySecret: string;
  private payPayMerchantId: string;
  private payPayBaseUrl: string;

  constructor() {
    this.payPayApiKey = process.env.PAYPAY_API_KEY || '';
    this.payPaySecret = process.env.PAYPAY_SECRET || '';
    this.payPayMerchantId = process.env.PAYPAY_MERCHANT_ID || '';
    this.payPayBaseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://api.paypay.ne.jp'
      : 'https://stg-api.sandbox.paypay.ne.jp';
  }

  // PayPay Integration
  async createPayPayPayment(request: PayPayPaymentRequest): Promise<PayPayPaymentResponse> {
    try {
      const response = await axios.post(
        `${this.payPayBaseUrl}/v2/payments`,
        request,
        {
          headers: {
            'Authorization': `Bearer ${this.payPayApiKey}`,
            'X-ASSUME-MERCHANT': this.payPayMerchantId,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info('PayPay payment created successfully', {
        merchantPaymentId: request.merchantPaymentId,
        amount: request.amount.amount,
        status: response.data.data?.status
      });

      return response.data;
    } catch (error) {
      logger.error({ error, request }, 'PayPay payment creation failed');
      throw new Error('PayPay決済の作成に失敗しました');
    }
  }

  // Get PayPay payment details
  async getPayPayPayment(merchantPaymentId: string): Promise<PayPayPaymentResponse> {
    try {
      const response = await axios.get(
        `${this.payPayBaseUrl}/v2/payments/${merchantPaymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.payPayApiKey}`,
            'X-ASSUME-MERCHANT': this.payPayMerchantId
          }
        }
      );

      return response.data;
    } catch (error) {
      logger.error({ error, merchantPaymentId }, 'PayPay payment retrieval failed');
      throw new Error('PayPay決済情報の取得に失敗しました');
    }
  }

  // Cancel PayPay payment
  async cancelPayPayPayment(merchantPaymentId: string): Promise<PayPayPaymentResponse> {
    try {
      const response = await axios.delete(
        `${this.payPayBaseUrl}/v2/payments/${merchantPaymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.payPayApiKey}`,
            'X-ASSUME-MERCHANT': this.payPayMerchantId
          }
        }
      );

      logger.info('PayPay payment canceled successfully', { merchantPaymentId });
      return response.data;
    } catch (error) {
      logger.error({ error, merchantPaymentId }, 'PayPay payment cancellation failed');
      throw new Error('PayPay決済のキャンセルに失敗しました');
    }
  }

  // Refund PayPay payment
  async refundPayPayPayment(
    merchantPaymentId: string, 
    refundId: string, 
    amount: number
  ): Promise<PayPayPaymentResponse> {
    try {
      const response = await axios.post(
        `${this.payPayBaseUrl}/v2/refunds`,
        {
          merchantRefundId: refundId,
          paymentId: merchantPaymentId,
          amount: {
            amount,
            currency: 'JPY'
          },
          reason: '顧客都合による返金'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.payPayApiKey}`,
            'X-ASSUME-MERCHANT': this.payPayMerchantId,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info('PayPay refund processed successfully', { 
        merchantPaymentId, 
        refundId, 
        amount 
      });

      return response.data;
    } catch (error) {
      logger.error({ error, merchantPaymentId, refundId }, 'PayPay refund failed');
      throw new Error('PayPay返金処理に失敗しました');
    }
  }

  // Generate convenience store payment
  async generateConvenienceStorePayment(
    amount: number,
    customerName: string,
    customerPhone: string,
    dueDate: Date,
    storeType: 'seven_eleven' | 'family_mart' | 'lawson' | 'ministop' = 'seven_eleven'
  ): Promise<ConvenienceStorePayment> {
    try {
      const paymentId = `CONV-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const paymentCode = this.generatePaymentCode(paymentId);
      
      const storeMap = {
        seven_eleven: {
          code: '7EL',
          name: 'セブン-イレブン'
        },
        family_mart: {
          code: 'FAM',
          name: 'ファミリーマート'
        },
        lawson: {
          code: 'LAW',
          name: 'ローソン'
        },
        ministop: {
          code: 'MIN',
          name: 'ミニストップ'
        }
      };

      const store = storeMap[storeType];
      const barcode = this.generateBarcode(paymentCode, amount);

      const payment: ConvenienceStorePayment = {
        paymentId,
        amount,
        customerName,
        customerPhone,
        dueDate,
        instructions: {
          storeCode: store.code,
          paymentCode,
          barcode
        }
      };

      logger.info('Convenience store payment generated', {
        paymentId,
        storeType,
        amount,
        dueDate: dueDate.toISOString()
      });

      return payment;
    } catch (error) {
      logger.error({ error }, 'Convenience store payment generation failed');
      throw new Error('コンビニ決済の生成に失敗しました');
    }
  }

  // Get bank transfer information
  getBankTransferInfo(): BankTransferInfo {
    return {
      bankName: '三菱UFJ銀行',
      branchName: '新宿支店',
      accountType: 'SAVINGS',
      accountNumber: '1234567',
      accountName: 'エイカイワグロー カ）',
      transferCode: `TRF-${Date.now().toString().slice(-8)}`
    };
  }

  // Validate Japanese credit card number (basic validation)
  validateJapaneseCreditCard(cardNumber: string): {
    isValid: boolean;
    cardType: string | null;
    issuer: string | null;
  } {
    const cleaned = cardNumber.replace(/\s/g, '');
    
    // Basic Luhn algorithm check
    const isValidLuhn = this.luhnCheck(cleaned);
    
    if (!isValidLuhn) {
      return { isValid: false, cardType: null, issuer: null };
    }

    // Japanese credit card patterns
    const cardPatterns = {
      'VISA': /^4[0-9]{15}$/,
      'MasterCard': /^5[1-5][0-9]{14}$/,
      'JCB': /^35(2[89]|[3-8][0-9])[0-9]{12}$/,
      'AMEX': /^3[47][0-9]{13}$/,
      'Diners': /^3[0689][0-9]{12,15}$/
    };

    for (const [cardType, pattern] of Object.entries(cardPatterns)) {
      if (pattern.test(cleaned)) {
        const issuer = cardType === 'JCB' ? 'JCB（日本発行）' : cardType;
        return { isValid: true, cardType, issuer };
      }
    }

    return { isValid: false, cardType: null, issuer: null };
  }

  // Format payment amount in Japanese style
  formatPaymentAmount(amount: number, includeTax: boolean = true): string {
    const baseAmount = amount;
    const tax = includeTax ? Math.floor(amount * 0.1) : 0;
    const total = baseAmount + tax;

    let formatted = `¥${total.toLocaleString('ja-JP')}`;
    
    if (includeTax && tax > 0) {
      formatted += ` (税込み: ¥${tax.toLocaleString('ja-JP')})`;
    }

    return formatted;
  }

  // Generate payment instructions in Japanese
  generatePaymentInstructions(
    paymentMethod: 'paypay' | 'convenience' | 'bank_transfer' | 'credit_card',
    paymentData: any
  ): {
    title: string;
    instructions: string[];
    dueDate?: string;
    amount: string;
  } {
    const dueDate = paymentData.dueDate ? 
      `${paymentData.dueDate.getFullYear()}年${paymentData.dueDate.getMonth() + 1}月${paymentData.dueDate.getDate()}日` : 
      undefined;
    
    const amount = this.formatPaymentAmount(paymentData.amount);

    switch (paymentMethod) {
      case 'paypay':
        return {
          title: 'PayPay決済のご案内',
          amount,
          dueDate,
          instructions: [
            '1. PayPayアプリを開いてください',
            '2. 「支払う」をタップしてください',
            '3. QRコードを読み取るか、支払いリンクを開いてください',
            '4. 金額を確認して「支払う」をタップしてください',
            '5. 決済完了の画面が表示されたら完了です'
          ]
        };

      case 'convenience':
        const storeName = paymentData.storeName || 'コンビニ';
        return {
          title: `${storeName}でのお支払い方法`,
          amount,
          dueDate,
          instructions: [
            `1. ${storeName}の店舗にお越しください`,
            '2. レジで「インターネット代金支払い」とお伝えください',
            `3. 支払い番号「${paymentData.paymentCode}」をお伝えください`,
            '4. 金額を確認してお支払いください',
            '5. 領収書を必ず受け取ってください'
          ]
        };

      case 'bank_transfer':
        return {
          title: '銀行振込でのお支払い方法',
          amount,
          dueDate,
          instructions: [
            '1. 以下の口座にお振込みください',
            `   銀行名: ${paymentData.bankName}`,
            `   支店名: ${paymentData.branchName}`,
            `   口座種別: ${paymentData.accountType === 'SAVINGS' ? '普通預金' : '当座預金'}`,
            `   口座番号: ${paymentData.accountNumber}`,
            `   口座名義: ${paymentData.accountName}`,
            '2. 振込み人名義にお客様のお名前をご入力ください',
            '3. 振込手数料はお客様負担となります',
            '4. 振込み完了後、確認の連絡をいたします'
          ]
        };

      case 'credit_card':
        return {
          title: 'クレジットカードでのお支払い',
          amount,
          instructions: [
            '1. カード情報を正確に入力してください',
            '2. セキュリティコード（CVV）を入力してください',
            '3. 「支払う」ボタンをクリックしてください',
            '4. 認証画面が表示された場合は認証を完了してください',
            '5. 決済完了の画面が表示されたら完了です'
          ]
        };

      default:
        return {
          title: 'お支払い方法',
          amount,
          instructions: ['お支払い方法の詳細をご確認ください']
        };
    }
  }

  // Helper methods
  private generatePaymentCode(paymentId: string): string {
    // Generate 13-digit payment code for convenience stores
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString().slice(2, 7);
    return `${timestamp}${random}`;
  }

  private generateBarcode(paymentCode: string, amount: number): string {
    // Generate JAN-13 compatible barcode
    const amountStr = amount.toString().padStart(6, '0');
    const code = `91${paymentCode.slice(0, 6)}${amountStr}`;
    const checkDigit = this.calculateJANCheckDigit(code);
    return `${code}${checkDigit}`;
  }

  private calculateJANCheckDigit(code: string): string {
    let sum = 0;
    for (let i = 0; i < code.length; i++) {
      const digit = parseInt(code[i]);
      sum += digit * (i % 2 === 0 ? 1 : 3);
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit.toString();
  }

  private luhnCheck(cardNumber: string): boolean {
    let sum = 0;
    let alternate = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let n = parseInt(cardNumber.charAt(i), 10);
      
      if (alternate) {
        n *= 2;
        if (n > 9) {
          n = (n % 10) + 1;
        }
      }
      
      sum += n;
      alternate = !alternate;
    }
    
    return sum % 10 === 0;
  }
}

export const japanesePaymentService = new JapanesePaymentService();