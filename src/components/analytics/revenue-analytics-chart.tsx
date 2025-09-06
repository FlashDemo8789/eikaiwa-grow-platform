"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { 
  BarChart, 
  Bar,
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { TrendingUp, DollarSign, Wallet, PieChart as PieChartIcon } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface RevenueAnalyticsChartProps {
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  dateRange: {
    from: Date
    to: Date
  }
}

interface RevenueData {
  totalRevenue: number
  monthlyRevenue: number
  growthRate: number
  trends: Array<{
    period: string
    revenue: number
    expenses: number
    profit: number
  }>
  breakdown: {
    tuitionFees: number
    materialFees: number
    examFees: number
    other: number
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export function RevenueAnalyticsChart({ period, dateRange }: RevenueAnalyticsChartProps) {
  const [data, setData] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRevenueData()
  }, [period, dateRange])

  const fetchRevenueData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const queryParams = new URLSearchParams({
        period,
        dateFrom: dateRange.from.toISOString(),
        dateTo: dateRange.to.toISOString(),
        metrics: 'revenue'
      })

      const response = await fetch(`/api/analytics?${queryParams}`)
      if (!response.ok) {
        throw new Error('Failed to fetch revenue data')
      }

      const result = await response.json()
      setData(result.data.revenue)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>収益分析</CardTitle>
          <CardDescription>売上、費用、利益の分析</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <LoadingSpinner size="md" />
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>収益分析</CardTitle>
          <CardDescription>データの読み込みに失敗しました</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">{error || 'データが見つかりません'}</p>
        </CardContent>
      </Card>
    )
  }

  // Prepare pie chart data
  const pieData = [
    { name: '授業料', value: data.breakdown.tuitionFees, label: '授業料' },
    { name: '教材費', value: data.breakdown.materialFees, label: '教材費' },
    { name: '試験料', value: data.breakdown.examFees, label: '試験料' },
    { name: 'その他', value: data.breakdown.other, label: 'その他' },
  ]

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総収益</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</div>
            <p className="text-xs text-green-600">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              成長率: +{data.growthRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">月間収益</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.monthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              今月の収益
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均利益率</CardTitle>
            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.trends.length > 0 
                ? ((data.trends.reduce((acc, trend) => acc + (trend.profit / trend.revenue) * 100, 0) / data.trends.length)).toFixed(1)
                : '0'
              }%
            </div>
            <p className="text-xs text-muted-foreground">
              収益に対する利益の割合
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>収益推移</CardTitle>
          <CardDescription>
            期間別の売上、費用、利益の推移
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data.trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="period" 
                fontSize={12}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                fontSize={12}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `¥${(value / 1000)}K`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelFormatter={(label) => `期間: ${label}`}
                formatter={(value, name) => [
                  formatCurrency(Number(value)),
                  name === "revenue" ? "売上" : 
                  name === "expenses" ? "費用" : "利益"
                ]}
              />
              <Legend />
              <Bar 
                dataKey="revenue" 
                fill="#22c55e" 
                name="売上"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="expenses" 
                fill="#ef4444" 
                name="費用"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="profit" 
                fill="#3b82f6" 
                name="利益"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue Sources and Profit Margin */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Breakdown Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>収益源内訳</CardTitle>
            <CardDescription>
              収益の構成比
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value)), '金額']}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Profit Margin Trend */}
        <Card>
          <CardHeader>
            <CardTitle>利益率推移</CardTitle>
            <CardDescription>
              期間別の利益率の変化
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="period" 
                  fontSize={12}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  fontSize={12}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelFormatter={(label) => `期間: ${label}`}
                  formatter={(value, name, props) => {
                    const profitMargin = (props.payload.profit / props.payload.revenue) * 100
                    return [`${profitMargin.toFixed(1)}%`, "利益率"]
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  name="利益率"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}