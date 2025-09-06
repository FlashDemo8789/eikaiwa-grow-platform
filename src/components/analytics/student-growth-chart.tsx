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
  AreaChart,
  Area
} from "recharts"
import { Users, UserPlus, UserCheck } from "lucide-react"

interface StudentGrowthChartProps {
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  dateRange: {
    from: Date
    to: Date
  }
}

interface StudentGrowthData {
  totalStudents: number
  newStudents: number
  activeStudents: number
  growthRate: number
  trends: Array<{
    period: string
    total: number
    new: number
    active: number
  }>
}

export function StudentGrowthChart({ period, dateRange }: StudentGrowthChartProps) {
  const [data, setData] = useState<StudentGrowthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStudentGrowthData()
  }, [period, dateRange])

  const fetchStudentGrowthData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const queryParams = new URLSearchParams({
        period,
        dateFrom: dateRange.from.toISOString(),
        dateTo: dateRange.to.toISOString(),
        metrics: 'student_growth'
      })

      const response = await fetch(`/api/analytics?${queryParams}`)
      if (!response.ok) {
        throw new Error('Failed to fetch student growth data')
      }

      const result = await response.json()
      setData(result.data.studentGrowth)
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
          <CardTitle>生徒成長トレンド</CardTitle>
          <CardDescription>期間別の生徒数推移と成長率</CardDescription>
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
          <CardTitle>生徒成長トレンド</CardTitle>
          <CardDescription>データの読み込みに失敗しました</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">{error || 'データが見つかりません'}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総生徒数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalStudents.toLocaleString()}</div>
            <p className="text-xs text-green-600">
              成長率: +{data.growthRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">新規生徒</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.newStudents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              期間中の新規登録
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">アクティブ生徒</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeStudents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              活動中の生徒数
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>生徒数推移</CardTitle>
          <CardDescription>
            期間別の総生徒数、新規生徒数、アクティブ生徒数の推移
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data.trends}>
              <defs>
                <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="period" 
                fontSize={12}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                fontSize={12}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelFormatter={(label) => `期間: ${label}`}
                formatter={(value, name) => [
                  `${value}人`,
                  name === "total" ? "総生徒数" : 
                  name === "active" ? "アクティブ生徒" : "新規生徒"
                ]}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="total"
                stackId="1"
                stroke="#8884d8"
                fillOpacity={0.6}
                fill="url(#totalGradient)"
                name="総生徒数"
              />
              <Area
                type="monotone"
                dataKey="active"
                stackId="2"
                stroke="#22c55e"
                fillOpacity={0.6}
                fill="url(#activeGradient)"
                name="アクティブ生徒"
              />
              <Line
                type="monotone"
                dataKey="new"
                stroke="#f59e0b"
                strokeWidth={2}
                name="新規生徒"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Growth Rate Chart */}
      <Card>
        <CardHeader>
          <CardTitle>成長率トレンド</CardTitle>
          <CardDescription>
            期間別の生徒数成長率の推移
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
                  const currentIndex = data.trends.findIndex(item => item.period === props.label)
                  const previousValue = currentIndex > 0 ? data.trends[currentIndex - 1].total : 0
                  const growthRate = previousValue > 0 ? ((Number(value) - previousValue) / previousValue) * 100 : 0
                  return [`${growthRate.toFixed(1)}%`, "成長率"]
                }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                name="成長率"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}