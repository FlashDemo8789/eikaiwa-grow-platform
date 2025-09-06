"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
  ScatterChart,
  Scatter
} from "recharts"
import { UserCheck, Star, Clock, Award, Users2, TrendingUp } from "lucide-react"
import { getInitials } from "@/lib/utils"

interface TeacherPerformanceChartProps {
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  dateRange: {
    from: Date
    to: Date
  }
}

interface TeacherPerformanceData {
  averageRating: number
  totalTeachers: number
  activeTeachers: number
  performanceDistribution: Array<{
    teacherId: string
    teacherName: string
    rating: number
    studentsCount: number
    hoursTeaching: number
    retentionRate: number
  }>
  trends: Array<{
    period: string
    averageRating: number
    teacherCount: number
  }>
}

export function TeacherPerformanceChart({ period, dateRange }: TeacherPerformanceChartProps) {
  const [data, setData] = useState<TeacherPerformanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTeacherPerformanceData()
  }, [period, dateRange])

  const fetchTeacherPerformanceData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const queryParams = new URLSearchParams({
        period,
        dateFrom: dateRange.from.toISOString(),
        dateTo: dateRange.to.toISOString(),
        metrics: 'teacher_performance'
      })

      const response = await fetch(`/api/analytics?${queryParams}`)
      if (!response.ok) {
        throw new Error('Failed to fetch teacher performance data')
      }

      const result = await response.json()
      setData(result.data.teacherPerformance)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const getPerformanceLevel = (rating: number) => {
    if (rating >= 4.5) return { label: '優秀', color: 'bg-green-500' }
    if (rating >= 4.0) return { label: '良好', color: 'bg-blue-500' }
    if (rating >= 3.5) return { label: '普通', color: 'bg-yellow-500' }
    return { label: '要改善', color: 'bg-red-500' }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>講師成果分析</CardTitle>
          <CardDescription>講師の評価、授業時間、生徒継続率の分析</CardDescription>
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
          <CardTitle>講師成果分析</CardTitle>
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
            <CardTitle className="text-sm font-medium">平均評価</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              5点満点の講師評価
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総講師数</CardTitle>
            <Users2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalTeachers}</div>
            <p className="text-xs text-muted-foreground">
              登録講師の総数
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">アクティブ講師</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeTeachers}</div>
            <p className="text-xs text-green-600">
              稼働率: {((data.activeTeachers / data.totalTeachers) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle>講師成果推移</CardTitle>
          <CardDescription>
            期間別の評価と講師数の推移
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data.trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="period" 
                fontSize={12}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                yAxisId="rating"
                fontSize={12}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `${value}点`}
                domain={[0, 5]}
              />
              <YAxis 
                yAxisId="count"
                orientation="right"
                fontSize={12}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `${value}人`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelFormatter={(label) => `期間: ${label}`}
                formatter={(value, name) => [
                  name === 'averageRating' ? `${value}点` : `${value}人`,
                  name === 'averageRating' ? '平均評価' : '講師数'
                ]}
              />
              <Legend />
              <Line
                yAxisId="rating"
                type="monotone"
                dataKey="averageRating"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                name="平均評価"
              />
              <Line
                yAxisId="count"
                type="monotone"
                dataKey="teacherCount"
                stroke="#3b82f6"
                strokeWidth={2}
                name="講師数"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Teacher Performance Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>講師パフォーマンス分布</CardTitle>
          <CardDescription>
            評価と生徒継続率の関係
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={data.performanceDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="rating"
                fontSize={12}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `${value}点`}
                domain={[3, 5]}
                name="評価"
              />
              <YAxis 
                dataKey="retentionRate"
                fontSize={12}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `${value}%`}
                domain={[70, 100]}
                name="継続率"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value, name, props) => [
                  name === 'rating' ? `${value}点` : `${value}%`,
                  name === 'rating' ? '評価' : '継続率'
                ]}
                labelFormatter={() => ''}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-card border border-border rounded-lg p-3">
                        <p className="font-medium">{data.teacherName}</p>
                        <p className="text-sm text-muted-foreground">評価: {data.rating}点</p>
                        <p className="text-sm text-muted-foreground">継続率: {data.retentionRate}%</p>
                        <p className="text-sm text-muted-foreground">生徒数: {data.studentsCount}人</p>
                        <p className="text-sm text-muted-foreground">授業時間: {data.hoursTeaching}時間</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Scatter 
                dataKey="retentionRate" 
                fill="#8b5cf6"
                name="講師"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>優秀講師</CardTitle>
          <CardDescription>
            評価、生徒数、継続率の総合ランキング
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.performanceDistribution
              .sort((a, b) => {
                // Sort by composite score (rating * 0.4 + retention rate * 0.4 + students count * 0.2)
                const scoreA = a.rating * 0.4 + (a.retentionRate / 100) * 0.4 + (a.studentsCount / 100) * 0.2
                const scoreB = b.rating * 0.4 + (b.retentionRate / 100) * 0.4 + (b.studentsCount / 100) * 0.2
                return scoreB - scoreA
              })
              .slice(0, 6)
              .map((teacher, index) => {
                const performance = getPerformanceLevel(teacher.rating)
                return (
                  <div key={teacher.teacherId} className="flex items-center space-x-4 p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${index < 3 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 'bg-muted-foreground'}`}>
                        {index + 1}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" />
                        <AvatarFallback>{getInitials(teacher.teacherName)}</AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{teacher.teacherName}</h4>
                        <Badge className={`${performance.color} text-white`}>
                          {performance.label}
                        </Badge>
                      </div>
                      <div className="flex space-x-6 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center space-x-1">
                          <Star className="h-3 w-3" />
                          <span>{teacher.rating.toFixed(1)}点</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Users2 className="h-3 w-3" />
                          <span>{teacher.studentsCount}人</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{teacher.hoursTeaching}時間</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <TrendingUp className="h-3 w-3" />
                          <span>継続率 {teacher.retentionRate.toFixed(1)}%</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {(teacher.rating * 0.4 + (teacher.retentionRate / 100) * 0.4 + (teacher.studentsCount / 100) * 0.2).toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">総合スコア</div>
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>講師別成果比較</CardTitle>
          <CardDescription>
            上位講師の詳細な成果比較
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data.performanceDistribution.slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="teacherName" 
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
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value, name) => [
                  name === 'rating' ? `${value}点` : 
                  name === 'retentionRate' ? `${value}%` :
                  name === 'studentsCount' ? `${value}人` : `${value}時間`,
                  name === 'rating' ? '評価' : 
                  name === 'retentionRate' ? '継続率' :
                  name === 'studentsCount' ? '生徒数' : '授業時間'
                ]}
              />
              <Legend />
              <Bar 
                dataKey="rating" 
                fill="#f59e0b" 
                name="評価"
                yAxisId="rating"
              />
              <Bar 
                dataKey="studentsCount" 
                fill="#22c55e" 
                name="生徒数"
              />
              <Bar 
                dataKey="retentionRate" 
                fill="#3b82f6" 
                name="継続率"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}