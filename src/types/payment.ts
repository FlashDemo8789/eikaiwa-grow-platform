import type { 
  PaymentMethodType, 
  PaymentProvider, 
  PaymentStatus, 
  PaymentType,
  InvoiceStatus,
  BillingSubscriptionStatus,
  BillingCycle,
  KonbiniStore,
  KonbiniStatus,
  PayPayStatus,
  RefundStatus,
  ReminderType,
  NotificationMethod
} from '@/lib/prisma-stub';

// Core payment interfaces
export interface CreatePaymentRequest {
  customerId: string;
  amount: number;
  currency?: string;
  description?: string;
  paymentMethodId?: string;
  provider: PaymentProvider;
  type: PaymentType;
  metadata?: Record<string, any>;
}

export interface PaymentMethodRequest {
  customerId: string;
  type: PaymentMethodType;
  provider: PaymentProvider;
  token?: string; // For Stripe
  isDefault?: boolean;
  metadata?: Record<string, any>;
}

export interface CreateInvoiceRequest {
  customerId: string;
  dueDate: Date;
  lineItems: InvoiceLineItemRequest[];
  notes?: string;
  metadata?: Record<string, any>;
}

export interface InvoiceLineItemRequest {
  description: string;
  quantity: number;
  unitPrice: number;
  metadata?: Record<string, any>;
}

export interface CreateSubscriptionRequest {
  customerId: string;
  planName: string;
  amount: number;
  billingCycle: BillingCycle;
  trialDays?: number;
  discountRate?: number;
  paymentMethodId?: string;
  metadata?: Record<string, any>;
}

export interface RefundRequest {
  paymentId: string;
  amount?: number;
  reason?: string;
}

// Stripe-specific interfaces
export interface StripeConnectAccount {
  accountId: string;
  organizationId: string;
  email: string;
  country: string;
  businessType: string;
  onboardingComplete: boolean;
  payoutsEnabled: boolean;
  chargesEnabled: boolean;
  detailsSubmitted: boolean;
}

export interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret?: string;
  paymentMethod?: string;
  metadata?: Record<string, any>;
}

// PayPay interfaces
export interface PayPayPaymentRequest {
  merchantPaymentId: string;
  amount: number;
  currency: string;
  codeType: 'ORDER_QR';
  redirectUrl?: string;
  redirectType?: 'WEB_LINK' | 'DEEPLINK';
  userAgent?: string;
  storeId?: string;
}

export interface PayPayQRCodeResponse {
  resultInfo: {
    code: string;
    message: string;
    codeId: string;
  };
  data?: {
    paymentId: string;
    status: string;
    acceptedAt: number;
    expiryDate: number;
    codeId: string;
    url: string;
    deeplink: string;
    amount: {
      amount: number;
      currency: string;
    };
  };
}

// Convenience store payment interfaces
export interface KonbiniPaymentRequest {
  amount: number;
  currency: string;
  store: KonbiniStore;
  customerName: string;
  customerEmail: string;
  expiryDays?: number;
  description?: string;
}

export interface KonbiniPaymentResponse {
  paymentCode: string;
  barcode?: string;
  qrCode?: string;
  expiresAt: Date;
  instructions: {
    [key in KonbiniStore]?: string;
  };
}

// Billing and subscription interfaces
export interface BillingCalculation {
  subtotal: number;
  taxAmount: number;
  discountAmount?: number;
  totalAmount: number;
  taxRate: number;
  appliedDiscounts?: {
    type: string;
    amount: number;
    percentage?: number;
  }[];
}

export interface PaymentSummary {
  totalRevenue: number;
  successfulPayments: number;
  failedPayments: number;
  refundedAmount: number;
  pendingAmount: number;
  averageTransactionValue: number;
  revenueGrowth: number;
  paymentMethodBreakdown: {
    [key in PaymentProvider]: number;
  };
}

// Webhook payload interfaces
export interface StripeWebhookPayload {
  id: string;
  object: 'event';
  type: string;
  data: {
    object: any;
    previous_attributes?: any;
  };
  created: number;
  livemode: boolean;
  pending_webhooks: number;
  request: {
    id: string;
    idempotency_key?: string;
  };
}

export interface PayPayWebhookPayload {
  paymentId: string;
  status: PayPayStatus;
  acceptedAt?: number;
  amount: {
    amount: number;
    currency: string;
  };
  merchantPaymentId: string;
  storeId?: string;
}

// Error types
export interface PaymentError {
  code: string;
  message: string;
  details?: Record<string, any>;
  provider?: PaymentProvider;
}

// Audit and compliance
export interface PaymentAuditEntry {
  action: string;
  entityType: string;
  entityId: string;
  oldData?: Record<string, any>;
  newData?: Record<string, any>;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
}

// Tax calculation
export interface TaxCalculation {
  taxableAmount: number;
  taxAmount: number;
  taxRate: number;
  exemptAmount?: number;
  taxRegion: string;
}

// Japanese tax rates
export const JAPAN_TAX_RATES = {
  CONSUMPTION_TAX: 0.10, // 10%
  REDUCED_TAX: 0.08, // 8% for food, newspapers
} as const;

// Payment method brands
export const CARD_BRANDS = {
  VISA: 'visa',
  MASTERCARD: 'mastercard',
  AMEX: 'amex',
  JCB: 'jcb',
  DINERS: 'diners',
  DISCOVER: 'discover',
} as const;

// Currency codes
export const SUPPORTED_CURRENCIES = {
  JPY: 'JPY',
  USD: 'USD',
  EUR: 'EUR',
} as const;

// Payment status groups
export const PAYMENT_STATUS_GROUPS = {
  PENDING: ['PENDING', 'PROCESSING'] as PaymentStatus[],
  SUCCESS: ['SUCCEEDED'] as PaymentStatus[],
  FAILED: ['FAILED', 'CANCELED'] as PaymentStatus[],
  REFUNDED: ['REFUNDED', 'PARTIALLY_REFUNDED'] as PaymentStatus[],
} as const;

// Subscription statuses that allow billing
export const BILLABLE_SUBSCRIPTION_STATUSES = [
  'ACTIVE',
  'TRIALING',
] as BillingSubscriptionStatus[];

// Default payment settings
export const PAYMENT_DEFAULTS = {
  CURRENCY: 'JPY',
  TAX_RATE: JAPAN_TAX_RATES.CONSUMPTION_TAX,
  INVOICE_DUE_DAYS: 30,
  REMINDER_DAYS: [7, 3, 1], // Days before due date to send reminders
  LATE_FEE_RATE: 0.02, // 2% monthly late fee
  MAX_RETRY_ATTEMPTS: 3,
  KONBINI_EXPIRY_DAYS: 7,
  PAYPAY_EXPIRY_HOURS: 24,
} as const;