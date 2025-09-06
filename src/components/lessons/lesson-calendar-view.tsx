"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Target,
  CheckCircle2
} from "lucide-react"
import { format, addMonths, subMonths, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns"
import { ja } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { Lesson, LessonStatus } from "@/types/lesson"

interface LessonCalendarViewProps {
  fullscreen?: boolean
  onLessonSelect?: (lesson: Lesson) => void
}

// Mock lesson data with dates
const mockLessons: Lesson[] = [
  {
    id: "1",
    title: "基本挨拶と自己紹介",
    description: "初心者向けの基本的な挨拶練習",
    courseId: "1",
    courseName: "初級英会話",
    teacherId: "1",
    teacherName: "田中先生",
    scheduledDate: new Date("2024-01-15"),
    startTime: "10:00",
    endTime: "10:50",
    status: "completed" as LessonStatus,
    objectives: [],
    activities: [],
    materials: [],
    homework: [],
    vocabulary: [],
    studentNotes: [{} as any, {} as any, {} as any], // Mock 3 students
    progress: {
      objectivesCompleted: 2,
      totalObjectives: 2,
      activitiesCompleted: 4,
      totalActivities: 5,
      vocabularyPracticed: 12,
      totalVocabulary: 15,
      overallCompletion: 89,
      timeSpent: 50
    },
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-15")
  },
  {
    id: "2",
    title: "日常会話：食事について",
    courseId: "1",
    courseName: "初級英会話", 
    teacherId: "1",
    teacherName: "田中先生",
    scheduledDate: new Date("2024-01-16"),
    startTime: "10:00",
    endTime: "10:50",
    status: "in_progress" as LessonStatus,
    objectives: [],
    activities: [],
    materials: [],
    homework: [],
    vocabulary: [],
    studentNotes: [{} as any, {} as any], // Mock 2 students
    progress: {
      objectivesCompleted: 0,
      totalObjectives: 3,
      activitiesCompleted: 2,
      totalActivities: 6,
      vocabularyPracticed: 8,
      totalVocabulary: 20,
      overallCompletion: 35,
      timeSpent: 25
    },
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-16")
  },
  {
    id: "3",
    title: "ビジネス英語：会議の進行",
    courseId: "2",
    courseName: "ビジネス英語",
    teacherId: "2", 
    teacherName: "山田先生",
    scheduledDate: new Date("2024-01-17"),
    startTime: "14:00",
    endTime: "15:30",
    status: "planned" as LessonStatus,
    objectives: [],
    activities: [],
    materials: [],
    homework: [],
    vocabulary: [],
    studentNotes: [{} as any, {} as any, {} as any, {} as any], // Mock 4 students
    progress: {
      objectivesCompleted: 0,
      totalObjectives: 4,
      activitiesCompleted: 0,
      totalActivities: 8,
      vocabularyPracticed: 0,
      totalVocabulary: 25,
      overallCompletion: 0,
      timeSpent: 0
    },
    createdAt: new Date("2024-01-14"),
    updatedAt: new Date("2024-01-14")
  },
  {
    id: "4",
    title: "子供向け動物の名前",
    courseId: "4",
    courseName: "子供英語",
    teacherId: "3",
    teacherName: "佐藤先生",
    scheduledDate: new Date(),
    startTime: "15:00",
    endTime: "15:40",
    status: "planned" as LessonStatus,
    objectives: [],
    activities: [],
    materials: [],
    homework: [],
    vocabulary: [],
    studentNotes: [{} as any, {} as any, {} as any, {} as any, {} as any], // Mock 5 students
    progress: {
      objectivesCompleted: 0,
      totalObjectives: 2,
      activitiesCompleted: 0,
      totalActivities: 4,
      vocabularyPracticed: 0,
      totalVocabulary: 15,
      overallCompletion: 0,
      timeSpent: 0
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

const statusConfig = {
  planned: { label: "計画済み", color: "bg-blue-100 text-blue-800 border-blue-200" },
  in_progress: { label: "進行中", color: "bg-orange-100 text-orange-800 border-orange-200" },
  completed: { label: "完了", color: "bg-green-100 text-green-800 border-green-200" },
  cancelled: { label: "キャンセル", color: "bg-red-100 text-red-800 border-red-200" },
  rescheduled: { label: "再スケジュール", color: "bg-purple-100 text-purple-800 border-purple-200" },
}

export function LessonCalendarView({ fullscreen = false, onLessonSelect }: LessonCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getLessonsForDate = (date: Date) => {
    return mockLessons.filter(lesson => isSameDay(lesson.scheduledDate, date))
  }

  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson)
    setDetailsOpen(true)
    onLessonSelect?.(lesson)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1))
  }

  return (
    <>
      <Card className={cn("h-full", fullscreen && "min-h-[800px]")}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {format(currentMonth, "yyyy年MM月", { locale: ja })}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
                今日
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {monthDays.map((day) => {
              const dayLessons = getLessonsForDate(day)
              const isToday = isSameDay(day, new Date())
              const isSelected = selectedDate && isSameDay(day, selectedDate)

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "min-h-[120px] p-2 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
                    isToday && "border-primary bg-primary/5",
                    isSelected && "bg-accent",
                    fullscreen && "min-h-[150px]"
                  )}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className="text-sm font-medium mb-2">
                    {format(day, "d")}
                  </div>
                  
                  <div className="space-y-1">
                    {dayLessons.slice(0, fullscreen ? 4 : 2).map((lesson) => (
                      <div
                        key={lesson.id}
                        className={cn(
                          "p-1 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity",
                          statusConfig[lesson.status].color
                        )}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLessonClick(lesson)
                        }}
                      >
                        <div className="font-medium truncate">{lesson.title}</div>
                        <div className="flex items-center gap-1 opacity-75">
                          <Clock className="h-2 w-2" />
                          {lesson.startTime}
                        </div>
                      </div>
                    ))}
                    
                    {dayLessons.length > (fullscreen ? 4 : 2) && (
                      <div className="text-xs text-muted-foreground">
                        +{dayLessons.length - (fullscreen ? 4 : 2)} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Selected Date Details */}
          {selectedDate && (
            <div className="mt-6 p-4 border rounded-lg bg-muted/30">
              <h3 className="font-medium mb-3">
                {format(selectedDate, "yyyy年MM月dd日(E)", { locale: ja })}のレッスン
              </h3>
              
              {getLessonsForDate(selectedDate).length > 0 ? (
                <div className="space-y-3">
                  {getLessonsForDate(selectedDate).map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-3 bg-background rounded-lg cursor-pointer hover:shadow-sm transition-shadow"
                      onClick={() => handleLessonClick(lesson)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-medium">{lesson.title}</div>
                          <Badge 
                            variant="outline"
                            className={statusConfig[lesson.status].color}
                          >
                            {statusConfig[lesson.status].label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {lesson.startTime} - {lesson.endTime}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {lesson.studentNotes.length}名
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {lesson.progress.overallCompletion}%完了
                          </div>
                        </div>
                      </div>
                      
                      {lesson.status === 'completed' && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">この日にはレッスンの予定がありません</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lesson Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedLesson?.title}</DialogTitle>
          </DialogHeader>
          
          {selectedLesson && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">日時</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{format(selectedLesson.scheduledDate, "MM月dd日(E)", { locale: ja })}</span>
                    <Clock className="h-4 w-4 ml-2" />
                    <span>{selectedLesson.startTime} - {selectedLesson.endTime}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ステータス</label>
                  <div className="mt-1">
                    <Badge 
                      variant="outline"
                      className={statusConfig[selectedLesson.status].color}
                    >
                      {statusConfig[selectedLesson.status].label}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">コース・担当教師</label>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="secondary">{selectedLesson.courseName}</Badge>
                  <span className="text-sm">{selectedLesson.teacherName}</span>
                </div>
              </div>

              {selectedLesson.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">説明</label>
                  <p className="mt-1 text-sm">{selectedLesson.description}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-lg font-semibold">{selectedLesson.studentNotes.length}</div>
                  <div className="text-xs text-muted-foreground">参加生徒</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-lg font-semibold">{selectedLesson.progress.overallCompletion}%</div>
                  <div className="text-xs text-muted-foreground">完了率</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-lg font-semibold">{selectedLesson.progress.timeSpent}分</div>
                  <div className="text-xs text-muted-foreground">所要時間</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}