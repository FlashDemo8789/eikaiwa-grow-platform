"use client"

import { useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { 
  Plus, 
  FileText, 
  Calendar, 
  Users, 
  BookOpen, 
  TrendingUp,
  Search,
  Filter,
  Download,
  Copy
} from "lucide-react"

import { LessonsOverview } from "@/components/lessons/lessons-overview"
import { LessonsTable } from "@/components/lessons/lessons-table"
import { CreateLessonDialog } from "@/components/lessons/create-lesson-dialog"
import { LessonTemplates } from "@/components/lessons/lesson-templates"
import { LessonProgressTracker } from "@/components/lessons/lesson-progress-tracker"
import { LessonFilters } from "@/components/lessons/lesson-filters"
import { LessonCalendarView } from "@/components/lessons/lesson-calendar-view"

export default function LessonsPage() {
  const [activeTab, setActiveTab] = useState("all-lessons")
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table')

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">レッスンプランナー</h1>
          <p className="text-muted-foreground mt-2">
            授業計画の作成、管理、進捗追跡を効率的に行いましょう。
          </p>
        </div>
        
        <div className="flex gap-2">
          <CreateLessonDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新しいレッスン
            </Button>
          </CreateLessonDialog>
          
          <Button variant="outline">
            <Copy className="mr-2 h-4 w-4" />
            テンプレートから作成
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-center h-16">
                  <LoadingSpinner />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      }>
        <LessonsOverview />
      </Suspense>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all-lessons" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            すべてのレッスン
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            テンプレート
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            カレンダー表示
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            進捗管理
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all-lessons" className="space-y-6">
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <LessonFilters />
            
            <div className="flex gap-2">
              <Button 
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <FileText className="h-4 w-4 mr-1" />
                リスト
              </Button>
              <Button 
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('calendar')}
              >
                <Calendar className="h-4 w-4 mr-1" />
                カレンダー
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                エクスポート
              </Button>
            </div>
          </div>

          {/* Lessons Content */}
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          }>
            {viewMode === 'table' ? (
              <LessonsTable />
            ) : (
              <LessonCalendarView />
            )}
          </Suspense>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">レッスンテンプレート</h3>
              <p className="text-sm text-muted-foreground">
                再利用可能なレッスンプランのテンプレートを管理
              </p>
            </div>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              新しいテンプレート
            </Button>
          </div>

          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          }>
            <LessonTemplates />
          </Suspense>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">レッスンカレンダー</h3>
              <p className="text-sm text-muted-foreground">
                月間・週間でのレッスンスケジュール表示
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">今日</Button>
              <Button variant="outline" size="sm">週</Button>
              <Button variant="outline" size="sm">月</Button>
            </div>
          </div>

          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          }>
            <LessonCalendarView fullscreen />
          </Suspense>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">進捗管理</h3>
              <p className="text-sm text-muted-foreground">
                レッスンの完了率と生徒の学習進捗を追跡
              </p>
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              レポートエクスポート
            </Button>
          </div>

          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          }>
            <LessonProgressTracker />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}