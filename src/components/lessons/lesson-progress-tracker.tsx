"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  TrendingUp,
  Target,
  Users,
  Calendar,
  Clock,
  BookOpen,
  Award,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react"
import { format, subDays, subWeeks, subMonths } from "date-fns"
import { ja } from "date-fns/locale"
import { cn } from "@/lib/utils"

// Mock progress data
const mockProgressData = {
  overview: {
    totalLessons: 45,
    completedLessons: 38,
    completionRate: 84,
    averageScore: 4.2,
    studentsImpacted: 67,
    totalObjectives: 156,
    completedObjectives: 142,
    objectiveCompletionRate: 91
  },
  recentTrends: {
    lessonsCompleted: {
      current: 12,
      previous: 8,
      change: 50
    },
    averageCompletion: {
      current: 87,
      previous: 82,
      change: 5
    },
    studentEngagement: {
      current: 94,
      previous: 91,
      change: 3
    }
  },
  courseProgress: [
    {
      courseId: "1",
      courseName: "初級英会話",
      totalLessons: 20,
      completedLessons: 18,
      completionRate: 90,
      averageScore: 4.5,
      studentsEnrolled: 25
    },
    {
      courseId: "2", 
      courseName: "ビジネス英語",
      totalLessons: 15,
      completedLessons: 12,
      completionRate: 80,
      averageScore: 4.1,
      studentsEnrolled: 18
    },
    {
      courseId: "3",
      courseName: "TOEIC対策",
      totalLessons: 8,
      completedLessons: 6,
      completionRate: 75,
      averageScore: 3.8,
      studentsEnrolled: 12
    },
    {
      courseId: "4",
      courseName: "子供英語",
      totalLessons: 2,
      completedLessons: 2,
      completionRate: 100,
      averageScore: 4.8,
      studentsEnrolled: 12
    }
  ],
  studentProgress: [
    {
      studentId: "1",
      studentName: "田中太郎",
      lessonsAttended: 15,
      averageScore: 4.6,
      completionRate: 92,
      recentImprovement: "excellent"
    },
    {
      studentId: "2", 
      studentName: "佐藤花子",
      lessonsAttended: 18,
      averageScore: 4.3,
      completionRate: 89,
      recentImprovement: "good"
    },
    {
      studentId: "3",
      studentName: "山田次郎",
      lessonsAttended: 12,
      averageScore: 3.8,
      completionRate: 78,
      recentImprovement: "needs_attention"
    },
    {
      studentId: "4",
      studentName: "鈴木美咲", 
      lessonsAttended: 20,
      averageScore: 4.7,
      completionRate: 95,
      recentImprovement: "excellent"
    }
  ]
}

const improvementLabels = {
  excellent: { label: "優秀", color: "bg-green-100 text-green-800" },
  good: { label: "良好", color: "bg-blue-100 text-blue-800" },
  stable: { label: "安定", color: "bg-gray-100 text-gray-800" },
  needs_attention: { label: "要注意", color: "bg-orange-100 text-orange-800" }
}

interface LessonProgressTrackerProps {
  className?: string
}

export function LessonProgressTracker({ className }: LessonProgressTrackerProps) {
  const [timeRange, setTimeRange] = useState("month")
  const [selectedCourse, setSelectedCourse] = useState<string>("")

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="h-3 w-3 text-green-600" />
    if (change < 0) return <ArrowDown className="h-3 w-3 text-red-600" />
    return <Minus className="h-3 w-3 text-gray-600" />
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600"
    if (change < 0) return "text-red-600"
    return "text-gray-600"
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Controls */}
      <div className="flex items-center gap-4">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">先週</SelectItem>
            <SelectItem value="month">先月</SelectItem>
            <SelectItem value="quarter">四半期</SelectItem>
            <SelectItem value="year">年間</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="すべてのコース" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">すべてのコース</SelectItem>
            {mockProgressData.courseProgress.map((course) => (
              <SelectItem key={course.courseId} value={course.courseId}>
                {course.courseName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline">
          <BarChart3 className="h-4 w-4 mr-2" />
          詳細レポート
        </Button>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">レッスン完了率</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockProgressData.overview.completionRate}%</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {getChangeIcon(mockProgressData.recentTrends.averageCompletion.change)}
              <span className={cn("ml-1", getChangeColor(mockProgressData.recentTrends.averageCompletion.change))}>
                {mockProgressData.recentTrends.averageCompletion.change > 0 ? "+" : ""}
                {mockProgressData.recentTrends.averageCompletion.change}%
              </span>
              <span className="ml-1">前期比</span>
            </div>
            <Progress value={mockProgressData.overview.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">完了レッスン数</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockProgressData.overview.completedLessons}/{mockProgressData.overview.totalLessons}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {getChangeIcon(mockProgressData.recentTrends.lessonsCompleted.change)}
              <span className={cn("ml-1", getChangeColor(mockProgressData.recentTrends.lessonsCompleted.change))}>
                +{mockProgressData.recentTrends.lessonsCompleted.current - mockProgressData.recentTrends.lessonsCompleted.previous}レッスン
              </span>
              <span className="ml-1">今期</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均評価</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockProgressData.overview.averageScore}/5.0</div>
            <div className="flex text-xs text-muted-foreground mt-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div
                    key={star}
                    className={cn(
                      "w-2 h-2 rounded-full mr-0.5",
                      star <= mockProgressData.overview.averageScore ? "bg-yellow-400" : "bg-gray-200"
                    )}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">生徒参加率</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockProgressData.recentTrends.studentEngagement.current}%</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {getChangeIcon(mockProgressData.recentTrends.studentEngagement.change)}
              <span className={cn("ml-1", getChangeColor(mockProgressData.recentTrends.studentEngagement.change))}>
                +{mockProgressData.recentTrends.studentEngagement.change}%
              </span>
              <span className="ml-1">前期比</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Progress Tabs */}
      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            コース別進捗
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            生徒別進捗
          </TabsTrigger>
          <TabsTrigger value="objectives" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            目標達成状況
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>コース別進捗状況</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockProgressData.courseProgress.map((course) => (
                  <div key={course.courseId} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{course.courseName}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>{course.studentsEnrolled}名受講</span>
                          <span>平均評価: {course.averageScore}/5.0</span>
                        </div>
                      </div>
                      <Badge 
                        variant="outline"
                        className={cn(
                          course.completionRate >= 90 && "border-green-200 text-green-800 bg-green-50",
                          course.completionRate >= 75 && course.completionRate < 90 && "border-blue-200 text-blue-800 bg-blue-50",
                          course.completionRate < 75 && "border-orange-200 text-orange-800 bg-orange-50"
                        )}
                      >
                        {course.completionRate}%完了
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>進捗状況</span>
                        <span>{course.completedLessons}/{course.totalLessons}レッスン</span>
                      </div>
                      <Progress value={course.completionRate} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>生徒別学習進捗</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockProgressData.studentProgress.map((student) => (
                  <div key={student.studentId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {student.studentName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{student.studentName}</div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{student.lessonsAttended}回参加</span>
                          <span>評価: {student.averageScore}/5.0</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{student.completionRate}%</div>
                        <div className="text-xs text-muted-foreground">完了率</div>
                      </div>
                      <Badge 
                        variant="outline"
                        className={improvementLabels[student.recentImprovement as keyof typeof improvementLabels].color}
                      >
                        {improvementLabels[student.recentImprovement as keyof typeof improvementLabels].label}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="objectives" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>目標達成率</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-3xl font-bold text-green-600">
                    {mockProgressData.overview.objectiveCompletionRate}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {mockProgressData.overview.completedObjectives}/{mockProgressData.overview.totalObjectives}目標達成
                  </div>
                  <Progress value={mockProgressData.overview.objectiveCompletionRate} className="h-3" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>カテゴリー別達成状況</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { category: "スピーキング", achieved: 45, total: 52, percentage: 87 },
                    { category: "リスニング", achieved: 38, total: 42, percentage: 90 },
                    { category: "語彙", achieved: 34, total: 38, percentage: 89 },
                    { category: "文法", achieved: 25, total: 24, percentage: 96 }
                  ].map((item) => (
                    <div key={item.category} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{item.category}</span>
                        <span>{item.achieved}/{item.total} ({item.percentage}%)</span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}