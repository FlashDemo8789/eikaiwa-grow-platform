"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Calendar,
  Clock,
  Target,
  Play,
  BookOpen,
  FileText,
  Users,
  CheckCircle2,
  Circle,
  Download,
  Edit,
  Copy
} from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { Lesson } from "@/types/lesson"

interface ViewLessonDialogProps {
  lesson: Lesson
  open: boolean
  onClose: () => void
}

export function ViewLessonDialog({ lesson, open, onClose }: ViewLessonDialogProps) {
  const statusConfig = {
    planned: { label: "計画済み", color: "blue" },
    in_progress: { label: "進行中", color: "orange" },
    completed: { label: "完了", color: "green" },
    cancelled: { label: "キャンセル", color: "red" },
    rescheduled: { label: "再スケジュール", color: "purple" },
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{lesson.title}</DialogTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(lesson.scheduledDate, "yyyy年MM月dd日(E)", { locale: ja })}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {lesson.startTime} - {lesson.endTime}
                </div>
                <Badge 
                  variant="outline"
                  className={cn(
                    statusConfig[lesson.status].color === "blue" && "border-blue-200 text-blue-700 bg-blue-50",
                    statusConfig[lesson.status].color === "orange" && "border-orange-200 text-orange-700 bg-orange-50",
                    statusConfig[lesson.status].color === "green" && "border-green-200 text-green-700 bg-green-50",
                    statusConfig[lesson.status].color === "red" && "border-red-200 text-red-700 bg-red-50",
                    statusConfig[lesson.status].color === "purple" && "border-purple-200 text-purple-700 bg-purple-50"
                  )}
                >
                  {statusConfig[lesson.status].label}
                </Badge>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" />
                編集
              </Button>
              <Button variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-1" />
                複製
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                印刷
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">概要</TabsTrigger>
              <TabsTrigger value="objectives">目標</TabsTrigger>
              <TabsTrigger value="activities">活動</TabsTrigger>
              <TabsTrigger value="materials">教材</TabsTrigger>
              <TabsTrigger value="progress">進捗</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">基本情報</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">コース</label>
                      <div className="mt-1">
                        <Badge variant="secondary">{lesson.courseName}</Badge>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">担当教師</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {lesson.teacherName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{lesson.teacherName}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">レッスンの説明</label>
                      <p className="mt-1 text-sm">{lesson.description || "説明なし"}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <div className="text-center">
                        <div className="text-lg font-semibold">{lesson.objectives.length}</div>
                        <div className="text-xs text-muted-foreground">学習目標</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{lesson.activities.length}</div>
                        <div className="text-xs text-muted-foreground">学習活動</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{lesson.materials.length}</div>
                        <div className="text-xs text-muted-foreground">教材</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">進捗状況</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>全体完了率</span>
                        <span className="font-medium">{lesson.progress.overallCompletion}%</span>
                      </div>
                      <Progress value={lesson.progress.overallCompletion} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">目標達成</div>
                        <div className="font-medium">
                          {lesson.progress.objectivesCompleted}/{lesson.progress.totalObjectives}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">活動完了</div>
                        <div className="font-medium">
                          {lesson.progress.activitiesCompleted}/{lesson.progress.totalActivities}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">語彙練習</div>
                        <div className="font-medium">
                          {lesson.progress.vocabularyPracticed}/{lesson.progress.totalVocabulary}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">所要時間</div>
                        <div className="font-medium">{lesson.progress.timeSpent}分</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="objectives" className="space-y-4">
              {lesson.objectives.length > 0 ? (
                <div className="space-y-3">
                  {lesson.objectives.map((objective) => (
                    <Card key={objective.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {objective.achieved ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground" />
                            )}
                            <div>
                              <div className="font-medium">{objective.description}</div>
                              <Badge variant="outline" className="text-xs mt-1">
                                {objective.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>学習目標が設定されていません</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="activities" className="space-y-4">
              {lesson.activities.length > 0 ? (
                <div className="space-y-4">
                  {lesson.activities.map((activity) => (
                    <Card key={activity.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {activity.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />
                            )}
                            <div className="flex-1">
                              <div className="font-medium mb-1">{activity.name}</div>
                              <div className="text-sm text-muted-foreground mb-2">
                                {activity.description}
                              </div>
                              <div className="flex gap-2 mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {activity.type}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {activity.duration}分
                                </Badge>
                              </div>
                              {activity.instructions && (
                                <div className="text-sm">
                                  <strong>手順:</strong> {activity.instructions}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>学習活動が設定されていません</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="materials" className="space-y-4">
              {lesson.materials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lesson.materials.map((material) => (
                    <Card key={material.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                          <div className="flex-1">
                            <div className="font-medium">{material.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {material.type}
                            </div>
                            {material.description && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {material.description}
                              </div>
                            )}
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>教材がアップロードされていません</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="progress" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">完了状況</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>学習目標</span>
                          <span>{lesson.progress.objectivesCompleted}/{lesson.progress.totalObjectives}</span>
                        </div>
                        <Progress 
                          value={(lesson.progress.objectivesCompleted / lesson.progress.totalObjectives) * 100} 
                          className="h-2"
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>学習活動</span>
                          <span>{lesson.progress.activitiesCompleted}/{lesson.progress.totalActivities}</span>
                        </div>
                        <Progress 
                          value={(lesson.progress.activitiesCompleted / lesson.progress.totalActivities) * 100} 
                          className="h-2"
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>語彙練習</span>
                          <span>{lesson.progress.vocabularyPracticed}/{lesson.progress.totalVocabulary}</span>
                        </div>
                        <Progress 
                          value={(lesson.progress.vocabularyPracticed / lesson.progress.totalVocabulary) * 100} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">生徒の参加状況</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {lesson.studentNotes.length > 0 ? (
                      <div className="space-y-3">
                        {lesson.studentNotes.slice(0, 5).map((note) => (
                          <div key={note.id} className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {note.studentName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="text-sm font-medium">{note.studentName}</div>
                              <div className="flex gap-1">
                                <Badge variant="outline" className="text-xs">
                                  {note.attendance}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {note.performance}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                        {lesson.studentNotes.length > 5 && (
                          <div className="text-sm text-muted-foreground text-center">
                            他 {lesson.studentNotes.length - 5}名
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">参加記録なし</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}