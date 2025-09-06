"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  MoreHorizontal,
  Edit,
  Copy,
  Trash2,
  Eye,
  Download,
  Calendar,
  Clock,
  Users,
  Target,
  FileText
} from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { Lesson, LessonStatus } from "@/types/lesson"
import { ViewLessonDialog } from "./view-lesson-dialog"
import { EditLessonDialog } from "./edit-lesson-dialog"
import { DeleteLessonDialog } from "./delete-lesson-dialog"

// Mock data - in real app this would come from API
const mockLessons: Lesson[] = [
  {
    id: "1",
    title: "基本挨拶と自己紹介",
    description: "基本的な挨拶表現と自己紹介の練習",
    courseId: "1",
    courseName: "初級英会話",
    teacherId: "1",
    teacherName: "田中先生",
    scheduledDate: new Date("2024-01-15"),
    startTime: "10:00",
    endTime: "10:50",
    status: "completed" as LessonStatus,
    objectives: [
      {
        id: "1",
        description: "基本挨拶をマスターする",
        category: "speaking",
        achieved: true,
        order: 1
      },
      {
        id: "2",
        description: "自己紹介ができるようになる",
        category: "speaking",
        achieved: true,
        order: 2
      }
    ],
    activities: [],
    materials: [],
    homework: [],
    vocabulary: [],
    studentNotes: [],
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
    description: "レストランでの注文や食事に関する表現",
    courseId: "1",
    courseName: "初級英会話",
    teacherId: "1",
    teacherName: "田中先生",
    scheduledDate: new Date("2024-01-16"),
    startTime: "10:00",
    endTime: "10:50",
    status: "in_progress" as LessonStatus,
    objectives: [
      {
        id: "3",
        description: "食べ物の名前を覚える",
        category: "vocabulary",
        achieved: false,
        order: 1
      }
    ],
    activities: [],
    materials: [],
    homework: [],
    vocabulary: [],
    studentNotes: [],
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
    description: "会議での基本的な表現と進行方法",
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
    studentNotes: [],
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
]

const statusConfig = {
  planned: { label: "計画済み", color: "blue" },
  in_progress: { label: "進行中", color: "orange" },
  completed: { label: "完了", color: "green" },
  cancelled: { label: "キャンセル", color: "red" },
  rescheduled: { label: "再スケジュール", color: "purple" },
}

interface LessonsTableProps {
  className?: string
}

export function LessonsTable({ className }: LessonsTableProps) {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [dialogType, setDialogType] = useState<"view" | "edit" | "delete" | null>(null)

  const handleAction = (action: string, lesson: Lesson) => {
    setSelectedLesson(lesson)
    switch (action) {
      case "view":
        setDialogType("view")
        break
      case "edit":
        setDialogType("edit")
        break
      case "delete":
        setDialogType("delete")
        break
      case "duplicate":
        // Handle duplicate logic
        console.log("Duplicating lesson:", lesson.id)
        break
      case "export":
        // Handle export logic
        console.log("Exporting lesson:", lesson.id)
        break
    }
  }

  const closeDialog = () => {
    setDialogType(null)
    setSelectedLesson(null)
  }

  return (
    <>
      <div className={cn("rounded-md border", className)}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">レッスン情報</TableHead>
              <TableHead>コース・先生</TableHead>
              <TableHead>スケジュール</TableHead>
              <TableHead>進捗</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockLessons.map((lesson) => (
              <TableRow key={lesson.id} className="group">
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{lesson.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {lesson.description}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {lesson.objectives.length}個の目標
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {lesson.studentNotes.length}名参加
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {lesson.materials.length}個の教材
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-1">
                    <Badge variant="outline" className="text-xs">
                      {lesson.courseName}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {lesson.teacherName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{lesson.teacherName}</span>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      {format(lesson.scheduledDate, "MM月dd日(E)", { locale: ja })}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {lesson.startTime} - {lesson.endTime}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>完了率</span>
                      <span>{lesson.progress.overallCompletion}%</span>
                    </div>
                    <Progress 
                      value={lesson.progress.overallCompletion} 
                      className="h-2"
                    />
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>
                        目標: {lesson.progress.objectivesCompleted}/{lesson.progress.totalObjectives}
                      </div>
                      <div>
                        活動: {lesson.progress.activitiesCompleted}/{lesson.progress.totalActivities}
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge 
                    variant="outline"
                    className={cn(
                      "capitalize",
                      statusConfig[lesson.status].color === "blue" && "border-blue-200 text-blue-700 bg-blue-50",
                      statusConfig[lesson.status].color === "orange" && "border-orange-200 text-orange-700 bg-orange-50",
                      statusConfig[lesson.status].color === "green" && "border-green-200 text-green-700 bg-green-50",
                      statusConfig[lesson.status].color === "red" && "border-red-200 text-red-700 bg-red-50",
                      statusConfig[lesson.status].color === "purple" && "border-purple-200 text-purple-700 bg-purple-50"
                    )}
                  >
                    {statusConfig[lesson.status].label}
                  </Badge>
                </TableCell>

                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>アクション</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleAction("view", lesson)}>
                        <Eye className="mr-2 h-4 w-4" />
                        詳細表示
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction("edit", lesson)}>
                        <Edit className="mr-2 h-4 w-4" />
                        編集
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction("duplicate", lesson)}>
                        <Copy className="mr-2 h-4 w-4" />
                        複製
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleAction("export", lesson)}>
                        <Download className="mr-2 h-4 w-4" />
                        エクスポート
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleAction("delete", lesson)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        削除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs */}
      {dialogType === "view" && selectedLesson && (
        <ViewLessonDialog
          lesson={selectedLesson}
          open={true}
          onClose={closeDialog}
        />
      )}

      {dialogType === "edit" && selectedLesson && (
        <EditLessonDialog
          lesson={selectedLesson}
          open={true}
          onClose={closeDialog}
          onSave={(updatedLesson) => {
            // Handle save logic
            console.log("Saving lesson:", updatedLesson)
            closeDialog()
          }}
        />
      )}

      {dialogType === "delete" && selectedLesson && (
        <DeleteLessonDialog
          lesson={selectedLesson}
          open={true}
          onClose={closeDialog}
          onConfirm={() => {
            // Handle delete logic
            console.log("Deleting lesson:", selectedLesson.id)
            closeDialog()
          }}
        />
      )}
    </>
  )
}