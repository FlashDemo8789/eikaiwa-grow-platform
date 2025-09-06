"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  Cell
} from "recharts"
import { UserCheck, Calendar, TrendingDown, Target } from "lucide-react"

interface RetentionRatesChartProps {
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  dateRange: {
    from: Date
    to: Date
  }
}

interface RetentionData {
  overallRate: number
  monthlyRate: number
  quarterlyRate: number
  yearlyRate: number
  cohortAnalysis: Array<{
    cohort: string
    month0: number
    month1: number
    month3: number
    month6: number
    month12: number
  }>
}

const COHORT_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1']

export function RetentionRatesChart({ period, dateRange }: RetentionRatesChartProps) {
  const [data, setData] = useState<RetentionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRetentionData()
  }, [period, dateRange])

  const fetchRetentionData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const queryParams = new URLSearchParams({
        period,
        dateFrom: dateRange.from.toISOString(),
        dateTo: dateRange.to.toISOString(),
        metrics: 'retention'
      })

      const response = await fetch(`/api/analytics?${queryParams}`)
      if (!response.ok) {
        throw new Error('Failed to fetch retention data')
      }

      const result = await response.json()
      setData(result.data.retention)
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
          <CardTitle>継続率分析</CardTitle>
          <CardDescription>生徒の継続率とコーホート分析</CardDescription>
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
          <CardTitle>継続率分析</CardTitle>
          <CardDescription>データの読み込みに失敗しました</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">{error || 'データが見つかりません'}</p>
        </CardContent>
      </Card>
    )
  }

  // Prepare cohort data for visualization
  const cohortChartData = data.cohortAnalysis.map(cohort => ({
    cohort: cohort.cohort,
    '開始時': cohort.month0,
    '1ヶ月後': cohort.month1,
    '3ヶ月後': cohort.month3,
    '6ヶ月後': cohort.month6,
    '12ヶ月後': cohort.month12 > 0 ? cohort.month12 : null,
  }))

  // Overall retention rates data
  const retentionSummary = [
    { period: '月次', rate: data.monthlyRate, icon: Calendar },
    { period: '四半期', rate: data.quarterlyRate, icon: Target },
    { period: '年次', rate: data.yearlyRate, icon: TrendingDown },
  ]

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">全体継続率</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overallRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              全期間の平均継続率
            </p>
          </CardContent>
        </Card>

        {retentionSummary.map((item, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.period}継続率</CardTitle>
              <item.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.rate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {item.period}ベースの継続率
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cohort Analysis Chart */}
      <Card>
        <CardHeader>
          <CardTitle>コーホート分析</CardTitle>
          <CardDescription>
            入学時期別の継続率推移
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={cohortChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="cohort" 
                fontSize={12}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                fontSize={12}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelFormatter={(label) => `コーホート: ${label}`}
                formatter={(value, name) => [
                  value ? `${value}%` : 'データなし',
                  name
                ]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="開始時"
                stroke="#8884d8"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="開始時"
              />
              <Line
                type="monotone"
                dataKey="1ヶ月後"
                stroke="#82ca9d"
                strokeWidth={2}
                name="1ヶ月後"
              />
              <Line
                type="monotone"
                dataKey="3ヶ月後"
                stroke="#ffc658"
                strokeWidth={2}
                name="3ヶ月後"
              />
              <Line
                type="monotone"
                dataKey="6ヶ月後"
                stroke="#ff7300"
                strokeWidth={2}
                name="6ヶ月後"
              />
              <Line
                type="monotone"
                dataKey="12ヶ月後"
                stroke="#8dd1e1"
                strokeWidth={2}
                name="12ヶ月後"
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Retention Rate Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>継続率比較</CardTitle>
          <CardDescription>
            期間別継続率の比較
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { name: '月次', rate: data.monthlyRate, target: 95 },
              { name: '四半期', rate: data.quarterlyRate, target: 85 },
              { name: '年次', rate: data.yearlyRate, target: 75 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                fontSize={12}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                fontSize={12}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value, name) => [
                  `${value}%`,
                  name === 'rate' ? '実際の継続率' : '目標継続率'
                ]}
              />
              <Legend />
              <Bar 
                dataKey="rate" 
                fill="#22c55e" 
                name="実際の継続率"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="target" 
                fill="#e5e7eb" 
                name="目標継続率"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cohort Heatmap Table */}
      <Card>
        <CardHeader>
          <CardTitle>コーホート継続率詳細</CardTitle>
          <CardDescription>
            各コーホートの詳細な継続率データ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">コーホート</th>
                  <th className="text-center p-2">開始時</th>
                  <th className="text-center p-2">1ヶ月後</th>
                  <th className="text-center p-2">3ヶ月後</th>
                  <th className="text-center p-2">6ヶ月後</th>
                  <th className="text-center p-2">12ヶ月後</th>
                </tr>
              </thead>
              <tbody>
                {data.cohortAnalysis.map((cohort, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-medium">{cohort.cohort}</td>
                    <td className="p-2 text-center">{cohort.month0}%</td>
                    <td className="p-2 text-center">
                      <span className={cohort.month1 >= 90 ? 'text-green-600' : cohort.month1 >= 80 ? 'text-yellow-600' : 'text-red-600'}>
                        {cohort.month1}%
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <span className={cohort.month3 >= 80 ? 'text-green-600' : cohort.month3 >= 70 ? 'text-yellow-600' : 'text-red-600'}>
                        {cohort.month3}%
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <span className={cohort.month6 >= 75 ? 'text-green-600' : cohort.month6 >= 65 ? 'text-yellow-600' : 'text-red-600'}>
                        {cohort.month6}%
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      {cohort.month12 > 0 ? (
                        <span className={cohort.month12 >= 70 ? 'text-green-600' : cohort.month12 >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                          {cohort.month12}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}