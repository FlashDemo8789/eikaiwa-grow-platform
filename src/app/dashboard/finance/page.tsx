'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart,
  Users,
  GraduationCap,
  FileText,
  Download,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  Calculator
} from 'lucide-react';

// Types for financial data
interface FinancialKPI {
  label: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  format: 'currency' | 'percentage' | 'number';
  icon: React.ReactNode;
}

interface ProfitLossData {
  period: string;
  revenue: {
    studentFees: number;
    privateClasses: number;
    materialSales: number;
    eventFees: number;
    total: number;
  };
  expenses: {
    teacherSalaries: number;
    rent: number;
    utilities: number;
    materials: number;
    marketing: number;
    insurance: number;
    other: number;
    total: number;
  };
  netIncome: number;
}

interface CashFlowData {
  month: string;
  cashIn: number;
  cashOut: number;
  netCashFlow: number;
  runningBalance: number;
}

interface ExpenseCategory {
  category: string;
  amount: number;
  percentage: number;
  budget: number;
  variance: number;
  color: string;
}

interface StudentPayment {
  id: string;
  studentName: string;
  course: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'paid' | 'pending' | 'overdue';
  paymentMethod?: string;
}

interface TeacherPayroll {
  id: string;
  teacherName: string;
  hoursWorked: number;
  hourlyRate: number;
  bonuses: number;
  deductions: number;
  grossPay: number;
  netPay: number;
  status: 'processed' | 'pending';
}

interface RevenueforecastData {
  month: string;
  projected: number;
  actual?: number;
  studentCount: number;
  averageFeePerStudent: number;
}

interface BudgetComparison {
  category: string;
  budgeted: number;
  actual: number;
  variance: number;
  variancePercentage: number;
}

interface FiscalYear {
  year: number;
  label: string;
  startDate: Date;
  endDate: Date;
}

// Japanese formatting utilities
const formatCurrency = (amount: number, currency: string = 'JPY'): string => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('ja-JP').format(value);
};

const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Fiscal year utilities (April to March)
const getCurrentFiscalYear = (): FiscalYear => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-based, so March = 2, April = 3
  
  if (currentMonth >= 3) { // April onwards
    return {
      year: currentYear,
      label: `FY${currentYear}`,
      startDate: new Date(currentYear, 3, 1), // April 1st
      endDate: new Date(currentYear + 1, 2, 31), // March 31st next year
    };
  } else { // January to March
    return {
      year: currentYear - 1,
      label: `FY${currentYear - 1}`,
      startDate: new Date(currentYear - 1, 3, 1), // April 1st previous year
      endDate: new Date(currentYear, 2, 31), // March 31st current year
    };
  }
};

const getFiscalYears = (): FiscalYear[] => {
  const current = getCurrentFiscalYear();
  const years: FiscalYear[] = [];
  
  for (let i = 2; i >= -1; i--) {
    const year = current.year - i;
    years.push({
      year,
      label: `FY${year}`,
      startDate: new Date(year, 3, 1),
      endDate: new Date(year + 1, 2, 31),
    });
  }
  
  return years;
};

export default function FinancialReportsPage() {
  // State management
  const [loading, setLoading] = useState(true);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<FiscalYear>(getCurrentFiscalYear());
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [kpis, setKpis] = useState<FinancialKPI[]>([]);
  const [profitLossData, setProfitLossData] = useState<ProfitLossData[]>([]);
  const [cashFlowData, setCashFlowData] = useState<CashFlowData[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [studentPayments, setStudentPayments] = useState<StudentPayment[]>([]);
  const [teacherPayroll, setTeacherPayroll] = useState<TeacherPayroll[]>([]);
  const [revenueForecasts, setRevenueForecasts] = useState<RevenueforecastData[]>([]);
  const [budgetComparisons, setBudgetComparisons] = useState<BudgetComparison[]>([]);
  
  const { toast } = useToast();
  const fiscalYears = getFiscalYears();

  // Data fetching
  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      
      // Simulate API call - in real implementation, this would fetch from your backend
      const mockData = generateMockFinancialData(selectedFiscalYear, selectedPeriod);
      
      setKpis(mockData.kpis);
      setProfitLossData(mockData.profitLoss);
      setCashFlowData(mockData.cashFlow);
      setExpenseCategories(mockData.expenses);
      setStudentPayments(mockData.studentPayments);
      setTeacherPayroll(mockData.teacherPayroll);
      setRevenueForecasts(mockData.revenueForecasts);
      setBudgetComparisons(mockData.budgetComparisons);
      
    } catch (error) {
      console.error('Failed to fetch financial data:', error);
      toast({
        title: "エラー",
        description: "財務データの取得に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, [selectedFiscalYear, selectedPeriod]);

  // Mock data generation
  const generateMockFinancialData = (fiscalYear: FiscalYear, period: string) => {
    // Generate comprehensive mock data for demonstration
    const kpis: FinancialKPI[] = [
      {
        label: "総収入",
        value: 45800000,
        change: 12.5,
        changeType: 'increase',
        format: 'currency',
        icon: <TrendingUp className="h-5 w-5" />
      },
      {
        label: "純利益",
        value: 8900000,
        change: -2.3,
        changeType: 'decrease',
        format: 'currency',
        icon: <Calculator className="h-5 w-5" />
      },
      {
        label: "利益率",
        value: 19.4,
        change: 1.2,
        changeType: 'increase',
        format: 'percentage',
        icon: <Target className="h-5 w-5" />
      },
      {
        label: "在籍生徒数",
        value: 385,
        change: 18,
        changeType: 'increase',
        format: 'number',
        icon: <Users className="h-5 w-5" />
      }
    ];

    const profitLoss: ProfitLossData[] = [
      {
        period: "2024年3月",
        revenue: {
          studentFees: 3200000,
          privateClasses: 480000,
          materialSales: 120000,
          eventFees: 85000,
          total: 3885000
        },
        expenses: {
          teacherSalaries: 1680000,
          rent: 420000,
          utilities: 85000,
          materials: 180000,
          marketing: 220000,
          insurance: 45000,
          other: 120000,
          total: 2750000
        },
        netIncome: 1135000
      }
    ];

    const cashFlow: CashFlowData[] = Array.from({length: 12}, (_, i) => ({
      month: `2024年${i + 1}月`,
      cashIn: 3500000 + Math.random() * 500000,
      cashOut: 2800000 + Math.random() * 400000,
      netCashFlow: 700000 + Math.random() * 200000 - 100000,
      runningBalance: 15000000 + (i * 100000) + Math.random() * 500000
    }));

    const expenses: ExpenseCategory[] = [
      { category: "講師給与", amount: 1680000, percentage: 42.1, budget: 1600000, variance: 80000, color: "#ef4444" },
      { category: "家賃", amount: 420000, percentage: 10.5, budget: 420000, variance: 0, color: "#3b82f6" },
      { category: "マーケティング", amount: 220000, percentage: 5.5, budget: 250000, variance: -30000, color: "#10b981" },
      { category: "教材費", amount: 180000, percentage: 4.5, budget: 170000, variance: 10000, color: "#f59e0b" },
      { category: "光熱費", amount: 85000, percentage: 2.1, budget: 90000, variance: -5000, color: "#8b5cf6" }
    ];

    const studentPayments: StudentPayment[] = [
      {
        id: "1",
        studentName: "田中 太郎",
        course: "ビジネス英語",
        amount: 32000,
        dueDate: "2024-04-01",
        paidDate: "2024-03-28",
        status: "paid",
        paymentMethod: "クレジットカード"
      },
      {
        id: "2",
        studentName: "佐藤 花子",
        course: "一般英語",
        amount: 28000,
        dueDate: "2024-04-05",
        status: "pending"
      },
      {
        id: "3",
        studentName: "鈴木 次郎",
        course: "TOEIC対策",
        amount: 35000,
        dueDate: "2024-03-25",
        status: "overdue"
      }
    ];

    const teacherPayroll: TeacherPayroll[] = [
      {
        id: "1",
        teacherName: "Smith John",
        hoursWorked: 120,
        hourlyRate: 3500,
        bonuses: 20000,
        deductions: 42000,
        grossPay: 440000,
        netPay: 398000,
        status: "processed"
      },
      {
        id: "2",
        teacherName: "Johnson Mary",
        hoursWorked: 96,
        hourlyRate: 3200,
        bonuses: 15000,
        deductions: 32000,
        grossPay: 322200,
        netPay: 290200,
        status: "pending"
      }
    ];

    const revenueForecasts: RevenueforecastData[] = Array.from({length: 6}, (_, i) => ({
      month: `2024年${i + 4}月`,
      projected: 3800000 + Math.random() * 400000,
      actual: i < 2 ? 3850000 + Math.random() * 300000 : undefined,
      studentCount: 385 + Math.floor(Math.random() * 20),
      averageFeePerStudent: 9800 + Math.floor(Math.random() * 400)
    }));

    const budgetComparisons: BudgetComparison[] = [
      { category: "収入", budgeted: 42000000, actual: 45800000, variance: 3800000, variancePercentage: 9.0 },
      { category: "講師給与", budgeted: 19200000, actual: 20160000, variance: -960000, variancePercentage: -5.0 },
      { category: "家賃", budgeted: 5040000, actual: 5040000, variance: 0, variancePercentage: 0 },
      { category: "マーケティング", budgeted: 3000000, actual: 2640000, variance: 360000, variancePercentage: 12.0 }
    ];

    return {
      kpis,
      profitLoss,
      cashFlow,
      expenses,
      studentPayments,
      teacherPayroll,
      revenueForecasts,
      budgetComparisons
    };
  };

  // Export functions
  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${selectedFiscalYear.label}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "エクスポート完了",
      description: `${filename}をダウンロードしました。`,
    });
  };

  const exportTaxReport = () => {
    const taxData = {
      fiscalYear: selectedFiscalYear.label,
      totalRevenue: profitLossData.reduce((sum, p) => sum + p.revenue.total, 0),
      totalExpenses: profitLossData.reduce((sum, p) => sum + p.expenses.total, 0),
      netIncome: profitLossData.reduce((sum, p) => sum + p.netIncome, 0),
      consumptionTax: profitLossData.reduce((sum, p) => sum + (p.revenue.total * 0.1), 0),
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(taxData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tax_report_${selectedFiscalYear.label}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "税務レポート生成完了",
      description: "税務申告用データをエクスポートしました。",
    });
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return <ArrowUp className="h-4 w-4 text-green-600" />;
      case 'decrease':
        return <ArrowDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      paid: { label: "支払い済み", className: "bg-green-100 text-green-800" },
      pending: { label: "未払い", className: "bg-yellow-100 text-yellow-800" },
      overdue: { label: "延滞", className: "bg-red-100 text-red-800" },
      processed: { label: "処理済み", className: "bg-green-100 text-green-800" }
    };
    
    return config[status as keyof typeof config] || { label: status, className: "bg-gray-100 text-gray-800" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner className="h-8 w-8 mr-3" />
        財務データを読み込み中...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">財務レポート</h1>
          <p className="text-gray-600">英会話スクールの包括的な財務分析</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="fiscal-year">会計年度:</Label>
            <Select
              value={selectedFiscalYear.label}
              onValueChange={(value) => {
                const year = fiscalYears.find(fy => fy.label === value);
                if (year) setSelectedFiscalYear(year);
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fiscalYears.map((fy) => (
                  <SelectItem key={fy.label} value={fy.label}>
                    {fy.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="period">期間:</Label>
            <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">月次</SelectItem>
                <SelectItem value="quarter">四半期</SelectItem>
                <SelectItem value="year">年次</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={fetchFinancialData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            更新
          </Button>
        </div>
      </div>

      {/* Financial KPIs Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">{kpi.label}</p>
                  <p className="text-2xl font-bold">
                    {kpi.format === 'currency' && formatCurrency(kpi.value)}
                    {kpi.format === 'percentage' && formatPercentage(kpi.value)}
                    {kpi.format === 'number' && formatNumber(kpi.value)}
                  </p>
                  <div className="flex items-center mt-2">
                    {getChangeIcon(kpi.changeType)}
                    <span className={`text-sm ml-1 ${
                      kpi.changeType === 'increase' ? 'text-green-600' : 
                      kpi.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {Math.abs(kpi.change)}%
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${
                  kpi.changeType === 'increase' ? 'bg-green-100' : 
                  kpi.changeType === 'decrease' ? 'bg-red-100' : 'bg-gray-100'
                }`}>
                  {kpi.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="profit-loss" className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
          <TabsTrigger value="profit-loss">損益計算書</TabsTrigger>
          <TabsTrigger value="revenue-forecast">売上予測</TabsTrigger>
          <TabsTrigger value="expense-tracking">経費管理</TabsTrigger>
          <TabsTrigger value="cash-flow">キャッシュフロー</TabsTrigger>
          <TabsTrigger value="student-payments">生徒支払い</TabsTrigger>
          <TabsTrigger value="teacher-payroll">講師給与</TabsTrigger>
          <TabsTrigger value="budget-comparison">予算実績</TabsTrigger>
          <TabsTrigger value="kpi-dashboard">KPI</TabsTrigger>
          <TabsTrigger value="tax-reports">税務レポート</TabsTrigger>
          <TabsTrigger value="export">エクスポート</TabsTrigger>
        </TabsList>

        {/* Profit & Loss Statement */}
        <TabsContent value="profit-loss" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                損益計算書
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profitLossData.map((data, index) => (
                <div key={index} className="space-y-6">
                  <h3 className="text-lg font-semibold">{data.period}</h3>
                  
                  {/* Revenue Section */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-green-700">収入</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pl-4">
                      <div>
                        <p className="text-sm text-gray-600">授業料</p>
                        <p className="font-semibold">{formatCurrency(data.revenue.studentFees)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">プライベートレッスン</p>
                        <p className="font-semibold">{formatCurrency(data.revenue.privateClasses)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">教材販売</p>
                        <p className="font-semibold">{formatCurrency(data.revenue.materialSales)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">イベント収入</p>
                        <p className="font-semibold">{formatCurrency(data.revenue.eventFees)}</p>
                      </div>
                    </div>
                    <div className="border-t pt-2">
                      <p className="font-bold text-green-700">総収入: {formatCurrency(data.revenue.total)}</p>
                    </div>
                  </div>

                  {/* Expenses Section */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-red-700">支出</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pl-4">
                      <div>
                        <p className="text-sm text-gray-600">講師給与</p>
                        <p className="font-semibold">{formatCurrency(data.expenses.teacherSalaries)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">家賃</p>
                        <p className="font-semibold">{formatCurrency(data.expenses.rent)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">光熱費</p>
                        <p className="font-semibold">{formatCurrency(data.expenses.utilities)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">教材費</p>
                        <p className="font-semibold">{formatCurrency(data.expenses.materials)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">マーケティング</p>
                        <p className="font-semibold">{formatCurrency(data.expenses.marketing)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">保険料</p>
                        <p className="font-semibold">{formatCurrency(data.expenses.insurance)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">その他</p>
                        <p className="font-semibold">{formatCurrency(data.expenses.other)}</p>
                      </div>
                    </div>
                    <div className="border-t pt-2">
                      <p className="font-bold text-red-700">総支出: {formatCurrency(data.expenses.total)}</p>
                    </div>
                  </div>

                  {/* Net Income */}
                  <div className="border-t-2 pt-4">
                    <p className="text-xl font-bold">
                      純利益: <span className={data.netIncome >= 0 ? 'text-green-700' : 'text-red-700'}>
                        {formatCurrency(data.netIncome)}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Forecasting */}
        <TabsContent value="revenue-forecast" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                売上予測
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueForecasts.map((forecast, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{forecast.month}</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>予測生徒数: {formatNumber(forecast.studentCount)}名</p>
                        <p>平均月謝: {formatCurrency(forecast.averageFeePerStudent)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="space-y-1">
                        <p className="font-semibold">予測売上: {formatCurrency(forecast.projected)}</p>
                        {forecast.actual && (
                          <p className="text-sm">
                            実績: <span className="font-medium">{formatCurrency(forecast.actual)}</span>
                            <span className={`ml-2 ${forecast.actual > forecast.projected ? 'text-green-600' : 'text-red-600'}`}>
                              ({formatCurrency(forecast.actual - forecast.projected)})
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expense Tracking */}
        <TabsContent value="expense-tracking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                経費カテゴリー分析
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expenseCategories.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{category.category}</span>
                      <span className="text-sm text-gray-600">{formatPercentage(category.percentage)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div
                          className="h-3 rounded-full"
                          style={{
                            backgroundColor: category.color,
                            width: `${category.percentage}%`
                          }}
                        ></div>
                      </div>
                      <span className="font-semibold">{formatCurrency(category.amount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>予算: {formatCurrency(category.budget)}</span>
                      <span className={category.variance > 0 ? 'text-red-600' : 'text-green-600'}>
                        差異: {formatCurrency(category.variance)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cash Flow Analysis */}
        <TabsContent value="cash-flow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                キャッシュフロー分析
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-4 p-3 bg-gray-50 rounded-lg font-medium text-sm">
                  <div>月</div>
                  <div>収入</div>
                  <div>支出</div>
                  <div>残高</div>
                </div>
                {cashFlowData.slice(0, 6).map((flow, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4 p-3 border-b">
                    <div className="font-medium">{flow.month}</div>
                    <div className="text-green-600">{formatCurrency(flow.cashIn)}</div>
                    <div className="text-red-600">{formatCurrency(flow.cashOut)}</div>
                    <div className={`font-semibold ${flow.runningBalance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(flow.runningBalance)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Student Payment History */}
        <TabsContent value="student-payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                生徒支払い履歴
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{payment.studentName}</h3>
                        <Badge className={getStatusBadge(payment.status).className}>
                          {getStatusBadge(payment.status).label}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>コース: {payment.course}</p>
                        <p>期限: {formatDate(payment.dueDate)}</p>
                        {payment.paidDate && <p>支払日: {formatDate(payment.paidDate)}</p>}
                        {payment.paymentMethod && <p>支払方法: {payment.paymentMethod}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatCurrency(payment.amount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teacher Payroll Summary */}
        <TabsContent value="teacher-payroll" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                講師給与サマリー
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teacherPayroll.map((payroll) => (
                  <div key={payroll.id} className="space-y-3 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{payroll.teacherName}</h3>
                      <Badge className={getStatusBadge(payroll.status).className}>
                        {getStatusBadge(payroll.status).label}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">勤務時間</p>
                        <p className="font-semibold">{formatNumber(payroll.hoursWorked)}時間</p>
                      </div>
                      <div>
                        <p className="text-gray-600">時給</p>
                        <p className="font-semibold">{formatCurrency(payroll.hourlyRate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">ボーナス</p>
                        <p className="font-semibold">{formatCurrency(payroll.bonuses)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">控除</p>
                        <p className="font-semibold text-red-600">{formatCurrency(payroll.deductions)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div>
                        <p className="text-sm text-gray-600">総支給額</p>
                        <p className="font-semibold">{formatCurrency(payroll.grossPay)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">差引支給額</p>
                        <p className="text-lg font-bold text-green-600">{formatCurrency(payroll.netPay)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget vs Actual Comparison */}
        <TabsContent value="budget-comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                予算実績比較
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgetComparisons.map((comparison, index) => (
                  <div key={index} className="space-y-2 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{comparison.category}</h3>
                      <Badge className={comparison.variancePercentage >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {formatPercentage(Math.abs(comparison.variancePercentage))}
                        {comparison.variancePercentage >= 0 ? ' 改善' : ' 悪化'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">予算</p>
                        <p className="font-semibold">{formatCurrency(comparison.budgeted)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">実績</p>
                        <p className="font-semibold">{formatCurrency(comparison.actual)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">差異</p>
                        <p className={`font-semibold ${comparison.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(comparison.variance)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* KPI Dashboard (duplicate of main KPIs for detailed view) */}
        <TabsContent value="kpi-dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {kpis.map((kpi, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {kpi.icon}
                    {kpi.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-3xl font-bold">
                        {kpi.format === 'currency' && formatCurrency(kpi.value)}
                        {kpi.format === 'percentage' && formatPercentage(kpi.value)}
                        {kpi.format === 'number' && formatNumber(kpi.value)}
                      </p>
                      <div className="flex items-center mt-2">
                        {getChangeIcon(kpi.changeType)}
                        <span className={`text-sm ml-1 ${
                          kpi.changeType === 'increase' ? 'text-green-600' : 
                          kpi.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          前期比 {Math.abs(kpi.change)}%
                        </span>
                      </div>
                    </div>
                    {/* Add trend visualization or additional metrics here */}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tax Preparation Reports */}
        <TabsContent value="tax-reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                税務レポート
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-medium">消費税関連</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>課税売上高:</span>
                        <span className="font-semibold">{formatCurrency(41220000)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>消費税（10%）:</span>
                        <span className="font-semibold">{formatCurrency(4122000)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>仕入税額控除:</span>
                        <span className="font-semibold">{formatCurrency(275000)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span>納付税額:</span>
                        <span className="font-bold text-red-600">{formatCurrency(3847000)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-medium">法人税関連</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>課税所得:</span>
                        <span className="font-semibold">{formatCurrency(8900000)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>法人税率:</span>
                        <span className="font-semibold">23.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>法人税額:</span>
                        <span className="font-semibold">{formatCurrency(2064800)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>地方法人税:</span>
                        <span className="font-semibold">{formatCurrency(206480)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span>合計税額:</span>
                        <span className="font-bold text-red-600">{formatCurrency(2271280)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button onClick={exportTaxReport} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    税務申告データをエクスポート
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export to Accounting Software */}
        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                会計ソフト連携・エクスポート
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">財務データエクスポート</h3>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => exportToCSV(profitLossData, '損益計算書')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      損益計算書 (CSV)
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => exportToCSV(cashFlowData, 'キャッシュフロー')}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      キャッシュフロー (CSV)
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => exportToCSV(studentPayments, '生徒支払い履歴')}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      生徒支払い履歴 (CSV)
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => exportToCSV(teacherPayroll, '講師給与')}
                    >
                      <GraduationCap className="h-4 w-4 mr-2" />
                      講師給与データ (CSV)
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">会計ソフト連携</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      弥生会計形式でエクスポート
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      freee形式でエクスポート
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      マネーフォワード形式でエクスポート
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      勘定奉行形式でエクスポート
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800 mb-1">エクスポートについて</p>
                    <p className="text-blue-700">
                      データは選択された会計年度（{selectedFiscalYear.label}）の情報がエクスポートされます。
                      会計ソフトによってインポート形式が異なる場合がございますので、
                      ご使用の会計ソフトのマニュアルをご確認ください。
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}