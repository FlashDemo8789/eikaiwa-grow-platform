import { PrismaClient } from '@/lib/prisma-stub';
import axios from 'axios';
import crypto from 'crypto';
import * as QRCode from 'qrcode';
import type { 
  CreatePaymentRequest,
  PayPayPaymentRequest,
  PayPayQRCodeResponse,
  PayPayWebhookPayload
} from '@/types/payment';
import { logger } from '@/lib/logger';

export class PayPayService {
  private prisma: PrismaClient;
  private apiKey: string;
  private secret: string;
  private merchantId: string;
  private baseUrl: string;

  constructor(prisma: PrismaClient) {
    if (!process.env.PAYPAY_API_KEY || !process.env.PAYPAY_SECRET || !process.env.PAYPAY_MERCHANT_ID) {
      throw new Error('PayPay credentials are required');
    }

    this.prisma = prisma;
    this.apiKey = process.env.PAYPAY_API_KEY;
    this.secret = process.env.PAYPAY_SECRET;
    this.merchantId = process.env.PAYPAY_MERCHANT_ID;
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://api.paypay.ne.jp' 
      : 'https://stg-api.sandbox.paypay.ne.jp';
  }

  /**
   * Create PayPay QR code payment
   */
  async createQRPayment(paymentId: string, request: CreatePaymentRequest) {
    try {
      const merchantPaymentId = `eikaiwa-${paymentId}-${Date.now()}`;
      
      const payPayRequest: PayPayPaymentRequest = {
        merchantPaymentId,
        amount: Math.round(request.amount),
        currency: request.currency || 'JPY',
        codeType: 'ORDER_QR',
        redirectUrl: `${process.env.APP_URL}/payment/paypay/callback`,
        redirectType: 'WEB_LINK',
        userAgent: 'EikaiwaGrow/1.0',
      };

      const response = await this.makePayPayRequest<PayPayQRCodeResponse>(
        'POST',
        '/v2/codes',
        payPayRequest
      );

      if (response.resultInfo.code !== 'SUCCESS') {
        throw new Error(`PayPay API error: ${response.resultInfo.message}`);
      }

      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create PayPay payment record
      await this.prisma.payPayPayment.create({
        data: {
          payPayOrderId: response.data!.paymentId,
          merchantPaymentId,
          qrCodeUrl: response.data!.url,
          deepLink: response.data!.deeplink,
          expiresAt,
          status: 'PENDING',
          metadata: {
            codeId: response.data!.codeId,
            amount: response.data!.amount,
          },
          paymentId,
        },
      });

      return {
        externalId: response.data!.paymentId,
        status: 'PENDING' as const,
        metadata: {
          payPayOrderId: response.data!.paymentId,
          merchantPaymentId,
          qrCodeUrl: response.data!.url,
          deepLink: response.data!.deeplink,
          codeId: response.data!.codeId,
          expiresAt: expiresAt.toISOString(),
        },
      };
    } catch (error) {
      logger.error('PayPay QR payment creation failed', {
        error: error.message,
        paymentId,
        request,
      });

      return {
        externalId: null,
        status: 'FAILED' as const,
        metadata: {
          error: error.message,
        },
      };
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(merchantPaymentId: string) {
    try {
      const response = await this.makePayPayRequest(
        'GET',
        `/v2/payments/${merchantPaymentId}`
      );

      return {
        status: this.mapPayPayStatusToPaymentStatus(response.data.status),
        payPayData: response.data,
      };
    } catch (error) {
      logger.error('Failed to check PayPay payment status', {
        error: error.message,
        merchantPaymentId,
      });
      throw error;
    }
  }

  /**
   * Process refund (PayPay doesn't support partial refunds)
   */
  async processRefund(payment: any, amount: number, reason?: string) {
    try {
      const payPayPayment = await this.prisma.payPayPayment.findUnique({
        where: { paymentId: payment.id },
      });

      if (!payPayPayment) {
        throw new Error('PayPay payment record not found');
      }

      // PayPay only supports full refunds
      if (amount !== Number(payment.amount)) {
        throw new Error('PayPay only supports full refunds');
      }

      const refundRequest = {
        merchantRefundId: `refund-${payment.id}-${Date.now()}`,
        paymentId: payPayPayment.payPayOrderId,
        amount: {
          amount: Math.round(amount),
          currency: payment.currency,
        },
        reason: reason || 'Customer requested refund',
      };

      const response = await this.makePayPayRequest(
        'POST',
        '/v2/refunds',
        refundRequest
      );

      if (response.resultInfo.code !== 'SUCCESS') {
        throw new Error(`PayPay refund error: ${response.resultInfo.message}`);
      }

      return {
        externalId: response.data.refundId,
        status: 'SUCCEEDED' as const,
        processedAt: new Date(),
      };
    } catch (error) {
      logger.error('PayPay refund failed', {
        error: error.message,
        paymentId: payment.id,
        amount,
      });
      throw error;
    }
  }

  /**
   * Handle PayPay webhook
   */
  async handleWebhook(payload: PayPayWebhookPayload, signature: string) {
    try {
      // Verify webhook signature
      if (!this.verifyWebhookSignature(payload, signature)) {
        throw new Error('Invalid webhook signature');
      }

      const payPayPayment = await this.prisma.payPayPayment.findUnique({
        where: { payPayOrderId: payload.paymentId },
        include: { payment: true },
      });

      if (!payPayPayment) {
        logger.warn('PayPay webhook for unknown payment', { paymentId: payload.paymentId });
        return;
      }

      // Update PayPay payment status
      await this.prisma.payPayPayment.update({
        where: { id: payPayPayment.id },
        data: {
          status: payload.status,
          metadata: {
            ...payPayPayment.metadata,
            webhookData: payload,
            updatedAt: new Date().toISOString(),
          },
        },
      });

      // Update main payment status
      const paymentStatus = this.mapPayPayStatusToPaymentStatus(payload.status);
      await this.prisma.payment.update({
        where: { id: payPayPayment.paymentId },
        data: {
          status: paymentStatus,
          processedAt: payload.status === 'CAPTURED' ? new Date() : null,
        },
      });

      logger.info('PayPay webhook processed', {
        paymentId: payPayPayment.paymentId,
        payPayOrderId: payload.paymentId,
        status: payload.status,
      });

      return { received: true };
    } catch (error) {
      logger.error('PayPay webhook processing failed', {
        error: error.message,
        payload,
      });
      throw error;
    }
  }

  /**
   * Generate QR code image for payment
   */
  async generateQRCode(qrCodeUrl: string): Promise<string> {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        width: 256,
      });

      return qrCodeDataUrl;
    } catch (error) {
      logger.error('Failed to generate QR code', {
        error: error.message,
        qrCodeUrl,
      });
      throw error;
    }
  }

  /**
   * Cancel payment
   */
  async cancelPayment(merchantPaymentId: string) {
    try {
      const response = await this.makePayPayRequest(
        'DELETE',
        `/v2/codes/payments/${merchantPaymentId}`
      );

      return response.resultInfo.code === 'SUCCESS';
    } catch (error) {
      logger.error('Failed to cancel PayPay payment', {
        error: error.message,
        merchantPaymentId,
      });
      throw error;
    }
  }

  /**
   * Make authenticated PayPay API request
   */
  private async makePayPayRequest<T = any>(
    method: 'GET' | 'POST' | 'DELETE',
    endpoint: string,
    body?: any
  ): Promise<T> {
    const nonce = crypto.randomUUID();
    const timestamp = Math.floor(Date.now() / 1000);
    
    const contentType = 'application/json';
    const requestBody = body ? JSON.stringify(body) : '';
    
    // Create signature
    const signatureString = [
      method,
      endpoint,
      requestBody,
      timestamp,
      nonce,
    ].join('\n');

    const signature = crypto
      .createHmac('sha256', this.secret)
      .update(signatureString)
      .digest('base64');

    const headers = {
      'Content-Type': contentType,
      'X-ASSUME-MERCHANT': this.merchantId,
      'X-PP-NONCE': nonce,
      'X-PP-TIMESTAMP': timestamp.toString(),
      'Authorization': `hmac OPA-Auth:${this.apiKey}:${signature}`,
    };

    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers,
        data: body,
        timeout: 30000,
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error('PayPay API request failed', {
          method,
          endpoint,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        });
        throw new Error(`PayPay API error: ${error.response?.data?.resultInfo?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Verify webhook signature
   */
  private verifyWebhookSignature(payload: any, signature: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.secret)
        .update(JSON.stringify(payload))
        .digest('base64');

      return crypto.timingSafeEqual(
        Buffer.from(signature, 'base64'),
        Buffer.from(expectedSignature, 'base64')
      );
    } catch (error) {
      logger.error('Failed to verify PayPay webhook signature', {
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Map PayPay status to internal payment status
   */
  private mapPayPayStatusToPaymentStatus(payPayStatus: string) {
    switch (payPayStatus) {
      case 'PENDING':
        return 'PENDING' as const;
      case 'AUTHORIZED':
        return 'PROCESSING' as const;
      case 'CAPTURED':
        return 'SUCCEEDED' as const;
      case 'CANCELED':
        return 'CANCELED' as const;
      case 'EXPIRED':
        return 'FAILED' as const;
      default:
        return 'PENDING' as const;
    }
  }
}