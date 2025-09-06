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
  RadialBarChart,
  RadialBar
} from "recharts"
import { BookOpen, Users, Star, CheckCircle2, Trophy } from "lucide-react"

interface ClassPerformanceChartProps {
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  dateRange: {
    from: Date
    to: Date
  }
}

interface ClassPerformanceData {
  averageAttendance: number
  completionRate: number
  satisfactionScore: number
  trends: Array<{
    period: string
    attendance: number
    completion: number
    satisfaction: number
  }>
  topPerformingClasses: Array<{
    className: string
    attendance: number
    completion: number
    satisfaction: number
  }>
}

export function ClassPerformanceChart({ period, dateRange }: ClassPerformanceChartProps) {
  const [data, setData] = useState<ClassPerformanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchClassPerformanceData()
  }, [period, dateRange])

  const fetchClassPerformanceData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const queryParams = new URLSearchParams({
        period,
        dateFrom: dateRange.from.toISOString(),
        dateTo: dateRange.to.toISOString(),
        metrics: 'class_performance'
      })

      const response = await fetch(`/api/analytics?${queryParams}`)
      if (!response.ok) {
        throw new Error('Failed to fetch class performance data')
      }

      const result = await response.json()
      setData(result.data.classPerformance)
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
          <CardTitle>授業成果分析</CardTitle>
          <CardDescription>出席率、完了率、満足度の分析</CardDescription>
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
          <CardTitle>授業成果分析</CardTitle>
          <CardDescription>データの読み込みに失敗しました</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">{error || 'データが見つかりません'}</p>
        </CardContent>
      </Card>
    )
  }

  // Prepare radial chart data for overall performance
  const performanceData = [
    {
      name: '出席率',
      value: data.averageAttendance,
      fill: '#22c55e'
    },
    {
      name: '完了率',
      value: data.completionRate,
      fill: '#3b82f6'
    },
    {
      name: '満足度',
      value: data.satisfactionScore * 20, // Convert 5-point scale to percentage
      fill: '#f59e0b'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均出席率</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.averageAttendance.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              全クラス平均出席率
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">完了率</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.completionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              コース完了率
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">満足度スコア</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.satisfactionScore.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              5点満点の評価
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle>成果推移</CardTitle>
          <CardDescription>
            期間別の出席率、完了率、満足度の推移
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data.trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="period" 
                fontSize={12}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                yAxisId="percentage"
                fontSize={12}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
              />
              <YAxis 
                yAxisId="satisfaction"
                orientation="right"
                fontSize={12}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `${value}点`}
                domain={[0, 5]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelFormatter={(label) => `期間: ${label}`}
                formatter={(value, name) => [
                  name === 'satisfaction' ? `${value}点` : `${value}%`,
                  name === 'attendance' ? '出席率' :
                  name === 'completion' ? '完了率' : '満足度'
                ]}
              />
              <Legend />
              <Line
                yAxisId="percentage"
                type="monotone"
                dataKey="attendance"
                stroke="#22c55e"
                strokeWidth={2}
                name="出席率"
              />
              <Line
                yAxisId="percentage"
                type="monotone"
                dataKey="completion"
                stroke="#3b82f6"
                strokeWidth={2}
                name="完了率"
              />
              <Line
                yAxisId="satisfaction"
                type="monotone"
                dataKey="satisfaction"
                stroke="#f59e0b"
                strokeWidth={2}
                name="満足度"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Overall Performance Radial Chart and Top Classes */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Overall Performance */}
        <Card>
          <CardHeader>
            <CardTitle>総合パフォーマンス</CardTitle>
            <CardDescription>
              主要指標の概要
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="40%" outerRadius="90%" data={performanceData}>
                <RadialBar
                  minAngle={15}
                  label={{ position: 'insideStart', fill: '#fff' }}
                  background
                  clockWise
                  dataKey="value"
                />
                <Legend 
                  iconSize={18} 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                  wrapperStyle={{
                    lineHeight: '40px'
                  }}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    name === '満足度' ? `${(Number(value) / 20).toFixed(1)}点` : `${value}%`,
                    name
                  ]}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Performing Classes */}
        <Card>
          <CardHeader>
            <CardTitle>優秀クラス</CardTitle>
            <CardDescription>
              総合的に成果の高いクラス
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topPerformingClasses.map((classData, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                    <Trophy className={`h-4 w-4 ${index === 0 ? 'text-yellow-600' : index === 1 ? 'text-gray-500' : index === 2 ? 'text-amber-600' : 'text-primary'}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{classData.className}</h4>
                    <div className="flex space-x-4 text-sm text-muted-foreground">
                      <span>出席: {classData.attendance.toFixed(1)}%</span>
                      <span>完了: {classData.completion.toFixed(1)}%</span>
                      <span>満足: {classData.satisfaction.toFixed(1)}点</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {((classData.attendance + classData.completion + (classData.satisfaction * 20)) / 3).toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">総合スコア</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Performance Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>クラス別パフォーマンス比較</CardTitle>
          <CardDescription>
            上位クラスの詳細な成果比較
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data.topPerformingClasses}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="className" 
                fontSize={12}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={80}
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
                formatter={(value, name) => [
                  name === 'satisfaction' ? `${value}点` : `${value}%`,
                  name === 'attendance' ? '出席率' :
                  name === 'completion' ? '完了率' : '満足度'
                ]}
              />
              <Legend />
              <Bar 
                dataKey="attendance" 
                fill="#22c55e" 
                name="出席率"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="completion" 
                fill="#3b82f6" 
                name="完了率"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="satisfaction" 
                fill="#f59e0b" 
                name="満足度"
                radius={[4, 4, 0, 0]}
                yAxisId="satisfaction"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}