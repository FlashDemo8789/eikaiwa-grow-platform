import { PrismaClient } from '@/lib/prisma-stub';
import * as QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { createCanvas } from 'canvas';
import type { 
  CreatePaymentRequest,
  KonbiniPaymentRequest,
  KonbiniPaymentResponse
} from '@/types/payment';
import { PAYMENT_DEFAULTS } from '@/types/payment';
import { logger } from '@/lib/logger';

export class KonbiniPaymentService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create convenience store payment
   */
  async createKonbiniPayment(paymentId: string, request: CreatePaymentRequest) {
    try {
      const customer = await this.prisma.customer.findUnique({
        where: { id: request.customerId },
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      // Default to 7-Eleven if no specific store requested
      const store = (request.metadata?.store as any) || 'SEVEN_ELEVEN';
      
      // Generate payment code (13 digits for most konbini)
      const paymentCode = this.generatePaymentCode();
      
      // Generate barcode
      const barcode = await this.generateBarcode(paymentCode);
      
      // Generate QR code for mobile payments
      const qrCode = await this.generateKonbiniQRCode(paymentCode, request.amount);
      
      // Set expiry (default 7 days)
      const expiryDays = request.metadata?.expiryDays || PAYMENT_DEFAULTS.KONBINI_EXPIRY_DAYS;
      const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

      // Create konbini payment record
      await this.prisma.konbiniPayment.create({
        data: {
          store,
          paymentCode,
          barcode,
          qrCode,
          expiresAt,
          status: 'PENDING',
          metadata: {
            customerName: customer.name || 'Customer',
            amount: request.amount,
            currency: request.currency || 'JPY',
            expiryDays,
          },
          paymentId,
        },
      });

      return {
        externalId: paymentCode,
        status: 'PENDING' as const,
        metadata: {
          paymentCode,
          barcode,
          qrCode,
          store,
          expiresAt: expiresAt.toISOString(),
          instructions: this.getKonbiniInstructions(store, paymentCode),
        },
      };
    } catch (error) {
      logger.error('Konbini payment creation failed', {
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
   * Check payment status (simulated - in real implementation this would integrate with konbini APIs)
   */
  async checkPaymentStatus(paymentCode: string) {
    try {
      const konbiniPayment = await this.prisma.konbiniPayment.findUnique({
        where: { paymentCode },
        include: { payment: true },
      });

      if (!konbiniPayment) {
        throw new Error('Konbini payment not found');
      }

      // Check if expired
      if (new Date() > konbiniPayment.expiresAt) {
        await this.prisma.konbiniPayment.update({
          where: { id: konbiniPayment.id },
          data: { status: 'EXPIRED' },
        });

        await this.prisma.payment.update({
          where: { id: konbiniPayment.paymentId },
          data: { status: 'FAILED' },
        });

        return {
          status: 'EXPIRED',
          paid: false,
        };
      }

      return {
        status: konbiniPayment.status,
        paid: konbiniPayment.status === 'PAID',
        paidAt: konbiniPayment.paidAt,
        expiresAt: konbiniPayment.expiresAt,
      };
    } catch (error) {
      logger.error('Failed to check konbini payment status', {
        error: error.message,
        paymentCode,
      });
      throw error;
    }
  }

  /**
   * Mark payment as paid (webhook handler or manual confirmation)
   */
  async confirmPayment(paymentCode: string, paidAt?: Date) {
    try {
      const konbiniPayment = await this.prisma.konbiniPayment.findUnique({
        where: { paymentCode },
        include: { payment: true },
      });

      if (!konbiniPayment) {
        throw new Error('Konbini payment not found');
      }

      if (konbiniPayment.status === 'PAID') {
        return { success: true, message: 'Payment already confirmed' };
      }

      const paymentDate = paidAt || new Date();

      // Update konbini payment
      await this.prisma.konbiniPayment.update({
        where: { id: konbiniPayment.id },
        data: {
          status: 'PAID',
          paidAt: paymentDate,
          metadata: {
            ...konbiniPayment.metadata,
            confirmedAt: new Date().toISOString(),
          },
        },
      });

      // Update main payment
      await this.prisma.payment.update({
        where: { id: konbiniPayment.paymentId },
        data: {
          status: 'SUCCEEDED',
          processedAt: paymentDate,
        },
      });

      logger.info('Konbini payment confirmed', {
        paymentCode,
        paymentId: konbiniPayment.paymentId,
        paidAt: paymentDate,
      });

      return { success: true, message: 'Payment confirmed successfully' };
    } catch (error) {
      logger.error('Failed to confirm konbini payment', {
        error: error.message,
        paymentCode,
      });
      throw error;
    }
  }

  /**
   * Cancel expired payments
   */
  async cancelExpiredPayments() {
    try {
      const now = new Date();
      
      // Find expired payments
      const expiredPayments = await this.prisma.konbiniPayment.findMany({
        where: {
          status: 'PENDING',
          expiresAt: { lt: now },
        },
      });

      for (const payment of expiredPayments) {
        await this.prisma.konbiniPayment.update({
          where: { id: payment.id },
          data: { status: 'EXPIRED' },
        });

        await this.prisma.payment.update({
          where: { id: payment.paymentId },
          data: { status: 'FAILED' },
        });
      }

      logger.info('Cancelled expired konbini payments', {
        count: expiredPayments.length,
      });

      return expiredPayments.length;
    } catch (error) {
      logger.error('Failed to cancel expired konbini payments', {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Generate unique payment code
   */
  private generatePaymentCode(): string {
    // Generate 13-digit code (common for Japanese konbini)
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return timestamp + random;
  }

  /**
   * Generate barcode for payment code
   */
  private async generateBarcode(paymentCode: string): Promise<string> {
    try {
      const canvas = createCanvas(200, 80);
      
      JsBarcode(canvas, paymentCode, {
        format: 'CODE128',
        width: 2,
        height: 80,
        displayValue: true,
        fontSize: 12,
        textMargin: 5,
      });

      return canvas.toDataURL();
    } catch (error) {
      logger.error('Failed to generate barcode', {
        error: error.message,
        paymentCode,
      });
      throw error;
    }
  }

  /**
   * Generate QR code for mobile payment
   */
  private async generateKonbiniQRCode(paymentCode: string, amount: number): Promise<string> {
    try {
      // Format: konbini:code:amount for mobile apps
      const qrData = `konbini:${paymentCode}:${amount}`;
      
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
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
      logger.error('Failed to generate konbini QR code', {
        error: error.message,
        paymentCode,
      });
      throw error;
    }
  }

  /**
   * Get payment instructions for each konbini store
   */
  private getKonbiniInstructions(store: string, paymentCode: string): Record<string, string> {
    const baseInstructions = {
      paymentCode,
      expiryNote: 'Payment must be completed before the expiry date.',
    };

    switch (store) {
      case 'SEVEN_ELEVEN':
        return {
          ...baseInstructions,
          storeName: 'セブン-イレブン',
          instructions: [
            '1. Go to any 7-Eleven store',
            '2. Use the multi-copy machine (マルチコピー機)',
            '3. Select "Payment Services" (料金支払い)',
            `4. Enter payment code: ${paymentCode}`,
            '5. Print the payment slip',
            '6. Take the slip to the cashier',
            '7. Pay the amount shown',
          ].join('\n'),
        };

      case 'FAMILY_MART':
        return {
          ...baseInstructions,
          storeName: 'ファミリーマート',
          instructions: [
            '1. Go to any FamilyMart store',
            '2. Use the Famiport machine',
            '3. Select "Payment" (代金支払い)',
            `4. Enter payment code: ${paymentCode}`,
            '5. Print the application form',
            '6. Take the form to the cashier',
            '7. Pay the amount shown',
          ].join('\n'),
        };

      case 'LAWSON':
        return {
          ...baseInstructions,
          storeName: 'ローソン',
          instructions: [
            '1. Go to any Lawson store',
            '2. Use the Loppi machine',
            '3. Select "Payment" (各種代金お支払い)',
            `4. Enter payment code: ${paymentCode}`,
            '5. Print the application form',
            '6. Take the form to the cashier',
            '7. Pay the amount shown',
          ].join('\n'),
        };

      case 'MINISTOP':
        return {
          ...baseInstructions,
          storeName: 'ミニストップ',
          instructions: [
            '1. Go to any Ministop store',
            '2. Use the MINISTOP Loppi machine',
            '3. Select "Payment Services" (料金支払い)',
            `4. Enter payment code: ${paymentCode}`,
            '5. Print the payment slip',
            '6. Take the slip to the cashier',
            '7. Pay the amount shown',
          ].join('\n'),
        };

      default:
        return {
          ...baseInstructions,
          storeName: 'コンビニエンスストア',
          instructions: [
            '1. Go to a participating convenience store',
            '2. Use the terminal machine',
            '3. Select payment services',
            `4. Enter payment code: ${paymentCode}`,
            '5. Print the payment slip',
            '6. Take the slip to the cashier',
            '7. Pay the amount shown',
          ].join('\n'),
        };
    }
  }

  /**
   * Get store-specific payment limits and fees
   */
  getKonbiniLimits(store: string) {
    const commonLimits = {
      minAmount: 1,
      maxAmount: 300000, // Common limit for most konbini
      currency: 'JPY',
    };

    switch (store) {
      case 'SEVEN_ELEVEN':
        return {
          ...commonLimits,
          fee: 0, // Usually no fee
          maxAmount: 300000,
        };

      case 'FAMILY_MART':
        return {
          ...commonLimits,
          fee: 0,
          maxAmount: 300000,
        };

      case 'LAWSON':
        return {
          ...commonLimits,
          fee: 0,
          maxAmount: 300000,
        };

      default:
        return commonLimits;
    }
  }
}