'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  AlertCircle,
  RefreshCw,
  Check,
  Send,
  Eye,
  FileText,
  Clock
} from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  type: string;
  description: string;
  processedAt: string | null;
  createdAt: string;
  customer: {
    name: string;
    email: string;
    student?: {
      firstName: string;
      lastName: string;
      level: string;
    };
  };
  invoice?: {
    invoiceNumber: string;
    dueDate: string;
    status: string;
  };
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  dueDate: string;
  issueDate: string;
  paidAt: string | null;
  currency: string;
  customer: {
    name: string;
    email: string;
    student?: {
      firstName: string;
      lastName: string;
      level: string;
    };
  };
  paidAmount: number;
  isPaid: boolean;
  isOverdue: boolean;
}

interface PaymentSummary {
  totalRevenue: number;
  totalPending: number;
  overduePending: number;
  successfulPayments: number;
  failedPayments: number;
  pendingInvoices: number;
  overdueInvoices: number;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  
  const { toast } = useToast();

  // Fetch payment data from demo API
  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/demo/payments');
      if (!response.ok) throw new Error('Failed to fetch payment data');
      
      const data = await response.json();
      setPayments(data.payments);
      setInvoices(data.invoices);
      setSummary(data.summary);
      
    } catch (error) {
      console.error('Failed to fetch payment data:', error);
      toast({
        title: "エラー",
        description: "支払いデータの取得に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'succeeded':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'processing':
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'JPY') => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    setProcessingAction(invoiceId);
    try {
      const response = await fetch('/api/demo/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'mark-paid',
          invoiceId: invoiceId
        })
      });

      if (!response.ok) throw new Error('Failed to mark invoice as paid');

      const result = await response.json();
      
      toast({
        title: "支払い完了",
        description: `請求書 ${result.invoice.invoiceNumber} を支払い済みにしました。`,
      });

      // Refresh data
      fetchPaymentData();

    } catch (error) {
      console.error('Failed to mark invoice as paid:', error);
      toast({
        title: "エラー",
        description: "支払い処理に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(null);
    }
  };

  const handleSendReminder = async (invoiceId: string) => {
    setProcessingAction(invoiceId);
    try {
      const response = await fetch('/api/demo/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send-reminder',
          invoiceId: invoiceId
        })
      });

      if (!response.ok) throw new Error('Failed to send reminder');

      const result = await response.json();
      
      toast({
        title: "リマインダー送信完了",
        description: result.message,
      });

    } catch (error) {
      console.error('Failed to send reminder:', error);
      toast({
        title: "エラー",
        description: "リマインダー送信に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner className="h-8 w-8 mr-3" />
        支払いデータを読み込み中...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">支払い管理</h1>
          <p className="text-gray-600">請求書と支払いの管理</p>
        </div>
        <Button onClick={fetchPaymentData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          更新
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">総収入</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(summary.totalRevenue)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">未払い合計</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {formatCurrency(summary.totalPending)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">延滞金額</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(summary.overduePending)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">延滞請求書</p>
                  <p className="text-2xl font-bold text-red-600">
                    {summary.overdueInvoices}件
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="invoices" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="invoices">請求書</TabsTrigger>
          <TabsTrigger value="payments">支払い履歴</TabsTrigger>
        </TabsList>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                請求書一覧
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">請求書がありません</p>
                ) : (
                  invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{invoice.invoiceNumber}</h3>
                          <Badge className={getStatusBadgeColor(invoice.status)}>
                            {invoice.status === 'OPEN' ? '未払い' : 
                             invoice.status === 'PAID' ? '支払い済み' :
                             invoice.status === 'OVERDUE' ? '延滞' : invoice.status}
                          </Badge>
                          {invoice.isOverdue && (
                            <Badge className="bg-red-100 text-red-800">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              延滞中
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center gap-4">
                            <span>顧客: {invoice.customer.name}</span>
                            {invoice.customer.student && (
                              <span>生徒: {invoice.customer.student.firstName} {invoice.customer.student.lastName}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <span>金額: {formatCurrency(invoice.totalAmount)}</span>
                            <span>発行日: {formatDate(invoice.issueDate)}</span>
                            <span>期限: {formatDate(invoice.dueDate)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {invoice.status !== 'PAID' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendReminder(invoice.id)}
                              disabled={processingAction === invoice.id}
                            >
                              {processingAction === invoice.id ? (
                                <LoadingSpinner className="h-4 w-4 mr-1" />
                              ) : (
                                <Send className="h-4 w-4 mr-1" />
                              )}
                              督促
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleMarkAsPaid(invoice.id)}
                              disabled={processingAction === invoice.id}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {processingAction === invoice.id ? (
                                <LoadingSpinner className="h-4 w-4 mr-1" />
                              ) : (
                                <Check className="h-4 w-4 mr-1" />
                              )}
                              支払い済み
                            </Button>
                          </>
                        )}
                        {invoice.status === 'PAID' && (
                          <Badge className="bg-green-100 text-green-800">
                            <Check className="h-3 w-3 mr-1" />
                            完了
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                支払い履歴
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">支払い履歴がありません</p>
                ) : (
                  payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{payment.description || `Payment ${payment.id.slice(0, 8)}`}</h3>
                          <Badge className={getStatusBadgeColor(payment.status)}>
                            {payment.status === 'SUCCEEDED' ? '成功' :
                             payment.status === 'PENDING' ? '処理中' :
                             payment.status === 'FAILED' ? '失敗' : payment.status}
                          </Badge>
                          <Badge variant="secondary">
                            {payment.provider}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center gap-4">
                            <span>顧客: {payment.customer.name}</span>
                            {payment.customer.student && (
                              <span>生徒: {payment.customer.student.firstName} {payment.customer.student.lastName}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <span>金額: {formatCurrency(payment.amount)}</span>
                            <span>作成日: {formatDate(payment.createdAt)}</span>
                            {payment.processedAt && (
                              <span>処理日: {formatDate(payment.processedAt)}</span>
                            )}
                          </div>
                          {payment.invoice && (
                            <div className="flex items-center gap-4">
                              <span>請求書: {payment.invoice.invoiceNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {formatCurrency(payment.amount)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.currency}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}