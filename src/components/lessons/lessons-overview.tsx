"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, FileText, TrendingUp, Users, Clock, CheckCircle2 } from "lucide-react"

// Mock data - in real app this would come from API
const mockOverviewData = {
  totalLessons: 124,
  completedLessons: 98,
  upcomingLessons: 26,
  studentsImpacted: 156,
  averageRating: 4.7,
  completionRate: 79,
  thisWeek: {
    planned: 12,
    completed: 8,
    cancelled: 1
  },
  templates: {
    total: 45,
    mostUsed: "会話練習テンプレート"
  }
}

export function LessonsOverview() {
  const completionPercentage = Math.round((mockOverviewData.completedLessons / mockOverviewData.totalLessons) * 100)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Lessons */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">総レッスン数</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{mockOverviewData.totalLessons}</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <Badge variant="secondary" className="text-xs">
              今週 {mockOverviewData.thisWeek.planned}予定
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Completion Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">完了率</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completionPercentage}%</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <span>{mockOverviewData.completedLessons}/{mockOverviewData.totalLessons} 完了</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2 mt-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Lessons */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">今後のレッスン</CardTitle>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{mockOverviewData.upcomingLessons}</div>
          <div className="flex gap-1 mt-2">
            <Badge variant="outline" className="text-xs">
              今日 4件
            </Badge>
            <Badge variant="outline" className="text-xs">
              明日 6件
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Students Impact */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">対象生徒数</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{mockOverviewData.studentsImpacted}</div>
          <div className="text-xs text-muted-foreground mt-1">
            アクティブな生徒への授業提供
          </div>
        </CardContent>
      </Card>

      {/* Weekly Progress */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">今週の進捗</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {mockOverviewData.thisWeek.planned}
              </div>
              <div className="text-sm text-muted-foreground">計画済み</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {mockOverviewData.thisWeek.completed}
              </div>
              <div className="text-sm text-muted-foreground">完了</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {mockOverviewData.thisWeek.cancelled}
              </div>
              <div className="text-sm text-muted-foreground">キャンセル</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Usage */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">テンプレート活用状況</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">利用可能テンプレート</span>
            <span className="text-2xl font-bold">{mockOverviewData.templates.total}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">最も使用されているテンプレート</span>
            <Badge variant="default">{mockOverviewData.templates.mostUsed}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-lg">レッスン品質メトリクス</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">
                {mockOverviewData.averageRating}/5.0
              </div>
              <div className="text-sm text-muted-foreground">平均評価</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">
                {mockOverviewData.completionRate}%
              </div>
              <div className="text-sm text-muted-foreground">目標達成率</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">
                42分
              </div>
              <div className="text-sm text-muted-foreground">平均レッスン時間</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-orange-600">
                92%
              </div>
              <div className="text-sm text-muted-foreground">生徒満足度</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}