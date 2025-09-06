import { NextRequest, NextResponse } from 'next/server';

// Mock data for demo purposes
const mockPayments = [
  {
    id: 'pay_1',
    amount: 15000,
    currency: 'JPY',
    status: 'SUCCEEDED',
    provider: 'Stripe',
    type: 'RECURRING',
    description: '月謝 - 2024年11月',
    processedAt: '2024-11-01T09:00:00Z',
    createdAt: '2024-10-28T09:00:00Z',
    customer: {
      name: '田中 花子',
      email: 'tanaka@example.com',
      student: {
        firstName: '太郎',
        lastName: '田中',
        level: 'BEGINNER'
      }
    },
    invoice: {
      invoiceNumber: 'INV-2024-1101',
      dueDate: '2024-11-01',
      status: 'PAID'
    }
  },
  {
    id: 'pay_2',
    amount: 20000,
    currency: 'JPY',
    status: 'SUCCEEDED',
    provider: 'PayPay',
    type: 'RECURRING',
    description: '月謝 - 2024年11月',
    processedAt: '2024-11-01T10:30:00Z',
    createdAt: '2024-10-28T10:30:00Z',
    customer: {
      name: '佐藤 美咲',
      email: 'sato@example.com',
      student: {
        firstName: '次郎',
        lastName: '佐藤',
        level: 'INTERMEDIATE'
      }
    },
    invoice: {
      invoiceNumber: 'INV-2024-1102',
      dueDate: '2024-11-01',
      status: 'PAID'
    }
  },
  {
    id: 'pay_3',
    amount: 15000,
    currency: 'JPY',
    status: 'PENDING',
    provider: 'Bank Transfer',
    type: 'RECURRING',
    description: '月謝 - 2024年12月',
    processedAt: null,
    createdAt: '2024-11-28T09:00:00Z',
    customer: {
      name: '山田 太郎',
      email: 'yamada@example.com',
      student: {
        firstName: '花子',
        lastName: '山田',
        level: 'BEGINNER'
      }
    },
    invoice: {
      invoiceNumber: 'INV-2024-1201',
      dueDate: '2024-12-01',
      status: 'OPEN'
    }
  },
  {
    id: 'pay_4',
    amount: 25000,
    currency: 'JPY',
    status: 'SUCCEEDED',
    provider: 'Credit Card',
    type: 'RECURRING',
    description: '月謝 - 2024年11月',
    processedAt: '2024-11-02T14:00:00Z',
    createdAt: '2024-10-29T14:00:00Z',
    customer: {
      name: '鈴木 健太',
      email: 'suzuki@example.com',
      student: {
        firstName: '大輔',
        lastName: '鈴木',
        level: 'ADVANCED'
      }
    },
    invoice: {
      invoiceNumber: 'INV-2024-1103',
      dueDate: '2024-11-01',
      status: 'PAID'
    }
  },
  {
    id: 'pay_5',
    amount: 15000,
    currency: 'JPY',
    status: 'FAILED',
    provider: 'Credit Card',
    type: 'RECURRING',
    description: '月謝 - 2024年12月',
    processedAt: null,
    createdAt: '2024-11-28T11:00:00Z',
    customer: {
      name: '高橋 美穂',
      email: 'takahashi@example.com',
      student: {
        firstName: '麻衣',
        lastName: '高橋',
        level: 'INTERMEDIATE'
      }
    },
    invoice: {
      invoiceNumber: 'INV-2024-1202',
      dueDate: '2024-12-01',
      status: 'OPEN'
    }
  }
];

const mockInvoices = [
  {
    id: 'inv_1',
    invoiceNumber: 'INV-2024-1201',
    status: 'OPEN',
    subtotal: 15000,
    taxAmount: 1500,
    totalAmount: 16500,
    dueDate: '2024-12-01',
    issueDate: '2024-11-20',
    paidAt: null,
    currency: 'JPY',
    customer: {
      name: '山田 太郎',
      email: 'yamada@example.com',
      student: {
        firstName: '花子',
        lastName: '山田',
        level: 'BEGINNER'
      }
    },
    paidAmount: 0,
    isPaid: false,
    isOverdue: false
  },
  {
    id: 'inv_2',
    invoiceNumber: 'INV-2024-1202',
    status: 'OPEN',
    subtotal: 15000,
    taxAmount: 1500,
    totalAmount: 16500,
    dueDate: '2024-12-01',
    issueDate: '2024-11-20',
    paidAt: null,
    currency: 'JPY',
    customer: {
      name: '高橋 美穂',
      email: 'takahashi@example.com',
      student: {
        firstName: '麻衣',
        lastName: '高橋',
        level: 'INTERMEDIATE'
      }
    },
    paidAmount: 0,
    isPaid: false,
    isOverdue: false
  },
  {
    id: 'inv_3',
    invoiceNumber: 'INV-2024-1203',
    status: 'OVERDUE',
    subtotal: 20000,
    taxAmount: 2000,
    totalAmount: 22000,
    dueDate: '2024-11-15',
    issueDate: '2024-11-01',
    paidAt: null,
    currency: 'JPY',
    customer: {
      name: '伊藤 健太',
      email: 'ito@example.com',
      student: {
        firstName: '健太',
        lastName: '伊藤',
        level: 'ADVANCED'
      }
    },
    paidAmount: 0,
    isPaid: false,
    isOverdue: true
  },
  {
    id: 'inv_4',
    invoiceNumber: 'INV-2024-1101',
    status: 'PAID',
    subtotal: 15000,
    taxAmount: 1500,
    totalAmount: 16500,
    dueDate: '2024-11-01',
    issueDate: '2024-10-20',
    paidAt: '2024-11-01T09:00:00Z',
    currency: 'JPY',
    customer: {
      name: '田中 花子',
      email: 'tanaka@example.com',
      student: {
        firstName: '太郎',
        lastName: '田中',
        level: 'BEGINNER'
      }
    },
    paidAmount: 16500,
    isPaid: true,
    isOverdue: false
  },
  {
    id: 'inv_5',
    invoiceNumber: 'INV-2024-1102',
    status: 'PAID',
    subtotal: 20000,
    taxAmount: 2000,
    totalAmount: 22000,
    dueDate: '2024-11-01',
    issueDate: '2024-10-20',
    paidAt: '2024-11-01T10:30:00Z',
    currency: 'JPY',
    customer: {
      name: '佐藤 美咲',
      email: 'sato@example.com',
      student: {
        firstName: '次郎',
        lastName: '佐藤',
        level: 'INTERMEDIATE'
      }
    },
    paidAmount: 22000,
    isPaid: true,
    isOverdue: false
  }
];

export async function GET(request: NextRequest) {
  try {
    // Calculate summary
    const summary = {
      totalRevenue: mockPayments
        .filter(p => p.status === 'SUCCEEDED')
        .reduce((sum, p) => sum + p.amount, 0),
      totalPending: mockInvoices
        .filter(i => i.status === 'OPEN')
        .reduce((sum, i) => sum + i.totalAmount, 0),
      overduePending: mockInvoices
        .filter(i => i.isOverdue)
        .reduce((sum, i) => sum + i.totalAmount, 0),
      successfulPayments: mockPayments.filter(p => p.status === 'SUCCEEDED').length,
      failedPayments: mockPayments.filter(p => p.status === 'FAILED').length,
      pendingInvoices: mockInvoices.filter(i => i.status === 'OPEN').length,
      overdueInvoices: mockInvoices.filter(i => i.isOverdue).length,
    };

    return NextResponse.json({
      payments: mockPayments,
      invoices: mockInvoices,
      summary
    });
  } catch (error) {
    console.error('Failed to fetch payment data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, invoiceId } = body;

    if (action === 'mark-paid') {
      // Find the invoice to mark as paid
      const invoice = mockInvoices.find(i => i.id === invoiceId);
      if (invoice) {
        return NextResponse.json({
          success: true,
          invoice: {
            ...invoice,
            status: 'PAID',
            isPaid: true,
            paidAt: new Date().toISOString(),
            invoiceNumber: invoice.invoiceNumber
          }
        });
      }
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    if (action === 'send-reminder') {
      // Simulate sending a reminder
      return NextResponse.json({
        success: true,
        message: `リマインダーを送信しました。`
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Failed to process payment action:', error);
    return NextResponse.json(
      { error: 'Failed to process payment action' },
      { status: 500 }
    );
  }
}