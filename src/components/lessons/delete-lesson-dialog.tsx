"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Calendar, Clock, Users } from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import type { Lesson } from "@/types/lesson"

interface DeleteLessonDialogProps {
  lesson: Lesson
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DeleteLessonDialog({ lesson, open, onClose, onConfirm }: DeleteLessonDialogProps) {
  const hasProgress = lesson.progress.overallCompletion > 0
  const hasStudents = lesson.studentNotes.length > 0
  const isCompleted = lesson.status === "completed"

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            レッスンを削除
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                このレッスンを完全に削除します。この操作は元に戻すことができません。
              </p>

              {/* Lesson Info */}
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="font-medium">{lesson.title}</div>
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(lesson.scheduledDate, "yyyy年MM月dd日(E)", { locale: ja })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {lesson.startTime} - {lesson.endTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {lesson.studentNotes.length}名参加
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{lesson.courseName}</Badge>
                  <Badge variant="outline">{lesson.teacherName}</Badge>
                </div>
              </div>

              {/* Warnings */}
              {(hasProgress || hasStudents || isCompleted) && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-amber-600">⚠️ 注意事項:</p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    {isCompleted && (
                      <li>• このレッスンは既に完了しています</li>
                    )}
                    {hasProgress && (
                      <li>• 進捗データ ({lesson.progress.overallCompletion}% 完了) が失われます</li>
                    )}
                    {hasStudents && (
                      <li>• {lesson.studentNotes.length}名の生徒の学習記録が削除されます</li>
                    )}
                    {lesson.homework.length > 0 && (
                      <li>• {lesson.homework.length}件の宿題課題が削除されます</li>
                    )}
                    {lesson.materials.length > 0 && (
                      <li>• {lesson.materials.length}個の教材ファイルが削除されます</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>
            キャンセル
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            削除する
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}