// Stub Prisma client for MVP deployment
// This bypasses Prisma requirements during build

// Export mock Prisma types to avoid type errors
export type PrismaClient = any;
export type Prisma = any;

// Mock Decimal type for numeric values
export class Decimal {
  constructor(public value: number | string) {}
  toString() { return String(this.value); }
  toNumber() { return Number(this.value); }
  toFixed(digits: number = 2) { return Number(this.value).toFixed(digits); }
  static isDecimal(value: any): value is Decimal { return value instanceof Decimal; }
}

// Mock types for reminders
export type ReminderType = 'PAYMENT_DUE' | 'OVERDUE' | 'CUSTOM';
export type NotificationMethod = 'EMAIL' | 'SMS' | 'BOTH';
export type ReminderStatus = 'PENDING' | 'SENT' | 'FAILED';

// Mock EventStatus enum
export const EventStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
} as const;

// Mock enums that are commonly used
export const PaymentStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED', 
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  CANCELLED: 'CANCELLED'
} as const;

export const PaymentMethod = {
  CREDIT_CARD: 'CREDIT_CARD',
  DEBIT_CARD: 'DEBIT_CARD',
  BANK_TRANSFER: 'BANK_TRANSFER',
  PAYPAY: 'PAYPAY',
  KONBINI: 'KONBINI',
  CASH: 'CASH',
  OTHER: 'OTHER'
} as const;

export const UserRole = {
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STAFF: 'STAFF',
  PARENT: 'PARENT',
  STUDENT: 'STUDENT'
} as const;

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  PENDING: 'PENDING'
} as const;

export const SubscriptionStatus = {
  ACTIVE: 'ACTIVE',
  CANCELLED: 'CANCELLED',
  PAST_DUE: 'PAST_DUE',
  UNPAID: 'UNPAID',
  TRIALING: 'TRIALING'
} as const;

export const InvoiceStatus = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
  CANCELLED: 'CANCELLED'
} as const;

export const prisma = new Proxy({} as any, {
  get: (target, prop) => {
    // Return a function that returns a promise for any property access
    if (typeof prop === 'string') {
      return new Proxy(() => {}, {
        get: (_, method) => {
          // Return async functions for all Prisma methods
          return async (...args: any[]) => {
            console.log(`Prisma stub: ${String(prop)}.${String(method)} called`);
            
            // Return mock data based on the method
            switch (method) {
              case 'findMany':
              case 'findFirst':
              case 'findUnique':
                return [];
              case 'create':
              case 'update':
              case 'upsert':
                return { id: 'mock-id', ...args[0]?.data };
              case 'delete':
              case 'deleteMany':
                return { count: 0 };
              case 'count':
                return 0;
              default:
                return null;
            }
          };
        },
        apply: () => {
          // Handle direct function calls
          return Promise.resolve(null);
        }
      });
    }
    return undefined;
  }
});

export default prisma;