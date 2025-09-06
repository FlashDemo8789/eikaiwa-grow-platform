"use client"

import { Suspense, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StudentGrowthChart } from "@/components/analytics/student-growth-chart"
import { RevenueAnalyticsChart } from "@/components/analytics/revenue-analytics-chart"
import { RetentionRatesChart } from "@/components/analytics/retention-rates-chart"
import { ClassPerformanceChart } from "@/components/analytics/class-performance-chart"
import { TeacherPerformanceChart } from "@/components/analytics/teacher-performance-chart"
import { DateRangeSelector } from "@/components/analytics/date-range-selector"
import { ExportButton } from "@/components/analytics/export-button"
import { 
  CalendarDays, 
  TrendingUp, 
  Users, 
  GraduationCap,
  UserCheck,
  Download,
  Filter
} from "lucide-react"

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly'>('monthly')
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    to: new Date()
  })

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">分析ダッシュボード</h1>
          <p className="text-muted-foreground">
            学校の包括的な分析データと洞察
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <ExportButton />
          <DateRangeSelector 
            dateRange={dateRange} 
            onDateRangeChange={setDateRange} 
          />
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-lg">フィルター</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">日次</SelectItem>
                  <SelectItem value="weekly">週次</SelectItem>
                  <SelectItem value="monthly">月次</SelectItem>
                  <SelectItem value="quarterly">四半期</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Performance Indicators */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総生徒数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-green-600">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              前月比 +12.5%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">月間収益</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥1,562,500</div>
            <p className="text-xs text-green-600">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              前月比 +8.3%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">継続率</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87.5%</div>
            <p className="text-xs text-green-600">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              前月比 +2.1%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均出席率</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89.3%</div>
            <p className="text-xs text-green-600">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              前月比 +1.8%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="growth" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-fit lg:grid-cols-5">
          <TabsTrigger value="growth" className="text-xs lg:text-sm">生徒成長</TabsTrigger>
          <TabsTrigger value="revenue" className="text-xs lg:text-sm">収益分析</TabsTrigger>
          <TabsTrigger value="retention" className="text-xs lg:text-sm">継続率</TabsTrigger>
          <TabsTrigger value="class" className="text-xs lg:text-sm">授業成果</TabsTrigger>
          <TabsTrigger value="teacher" className="text-xs lg:text-sm">講師成果</TabsTrigger>
        </TabsList>

        <TabsContent value="growth" className="space-y-6">
          <Suspense fallback={
            <Card>
              <CardHeader>
                <CardTitle>生徒成長トレンド</CardTitle>
                <CardDescription>読み込み中...</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-64">
                <LoadingSpinner size="md" />
              </CardContent>
            </Card>
          }>
            <StudentGrowthChart period={selectedPeriod} dateRange={dateRange} />
          </Suspense>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Suspense fallback={
            <Card>
              <CardHeader>
                <CardTitle>収益分析</CardTitle>
                <CardDescription>読み込み中...</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-64">
                <LoadingSpinner size="md" />
              </CardContent>
            </Card>
          }>
            <RevenueAnalyticsChart period={selectedPeriod} dateRange={dateRange} />
          </Suspense>
        </TabsContent>

        <TabsContent value="retention" className="space-y-6">
          <Suspense fallback={
            <Card>
              <CardHeader>
                <CardTitle>継続率分析</CardTitle>
                <CardDescription>読み込み中...</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-64">
                <LoadingSpinner size="md" />
              </CardContent>
            </Card>
          }>
            <RetentionRatesChart period={selectedPeriod} dateRange={dateRange} />
          </Suspense>
        </TabsContent>

        <TabsContent value="class" className="space-y-6">
          <Suspense fallback={
            <Card>
              <CardHeader>
                <CardTitle>授業成果分析</CardTitle>
                <CardDescription>読み込み中...</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-64">
                <LoadingSpinner size="md" />
              </CardContent>
            </Card>
          }>
            <ClassPerformanceChart period={selectedPeriod} dateRange={dateRange} />
          </Suspense>
        </TabsContent>

        <TabsContent value="teacher" className="space-y-6">
          <Suspense fallback={
            <Card>
              <CardHeader>
                <CardTitle>講師成果分析</CardTitle>
                <CardDescription>読み込み中...</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-64">
                <LoadingSpinner size="md" />
              </CardContent>
            </Card>
          }>
            <TeacherPerformanceChart period={selectedPeriod} dateRange={dateRange} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}