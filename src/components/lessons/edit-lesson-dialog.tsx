"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Calendar as CalendarIcon,
  Clock,
  Save,
  X,
  Plus,
  Target,
  Play
} from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { 
  type Lesson, 
  type UpdateLessonRequest, 
  type LessonObjective, 
  type LessonActivity,
  type ObjectiveCategory,
  type ActivityType,
  type LessonStatus,
  OBJECTIVE_CATEGORIES,
  ACTIVITY_TYPES
} from "@/types/lesson"

interface EditLessonDialogProps {
  lesson: Lesson
  open: boolean
  onClose: () => void
  onSave: (updatedLesson: UpdateLessonRequest) => void
}

const mockCourses = [
  { id: "1", name: "初級英会話" },
  { id: "2", name: "ビジネス英語" },
  { id: "3", name: "TOEIC対策" },
  { id: "4", name: "子供英語" },
]

const statusOptions = [
  { value: "planned", label: "計画済み" },
  { value: "in_progress", label: "進行中" },
  { value: "completed", label: "完了" },
  { value: "cancelled", label: "キャンセル" },
  { value: "rescheduled", label: "再スケジュール" },
]

export function EditLessonDialog({ lesson, open, onClose, onSave }: EditLessonDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [lessonData, setLessonData] = useState<UpdateLessonRequest>({})
  const [objectives, setObjectives] = useState<LessonObjective[]>([])
  const [activities, setActivities] = useState<LessonActivity[]>([])
  
  // New objective/activity forms
  const [newObjective, setNewObjective] = useState({
    description: "",
    category: "" as ObjectiveCategory | "",
  })
  const [newActivity, setNewActivity] = useState({
    name: "",
    description: "",
    type: "" as ActivityType | "",
    duration: 0,
    instructions: "",
  })

  useEffect(() => {
    if (lesson && open) {
      setLessonData({
        title: lesson.title,
        description: lesson.description,
        scheduledDate: lesson.scheduledDate,
        startTime: lesson.startTime,
        endTime: lesson.endTime,
        status: lesson.status,
      })
      setObjectives([...lesson.objectives])
      setActivities([...lesson.activities])
    }
  }, [lesson, open])

  const handleBasicInfoChange = (field: keyof UpdateLessonRequest, value: any) => {
    setLessonData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addObjective = () => {
    if (newObjective.description && newObjective.category) {
      const objective: LessonObjective = {
        id: Date.now().toString(),
        description: newObjective.description,
        category: newObjective.category as ObjectiveCategory,
        achieved: false,
        order: objectives.length + 1
      }
      setObjectives(prev => [...prev, objective])
      setNewObjective({ description: "", category: "" })
    }
  }

  const removeObjective = (id: string) => {
    setObjectives(prev => prev.filter(obj => obj.id !== id))
  }

  const addActivity = () => {
    if (newActivity.name && newActivity.type) {
      const activity: LessonActivity = {
        id: Date.now().toString(),
        name: newActivity.name,
        description: newActivity.description,
        type: newActivity.type as ActivityType,
        duration: newActivity.duration,
        materials: [],
        instructions: newActivity.instructions,
        order: activities.length + 1,
        completed: false
      }
      setActivities(prev => [...prev, activity])
      setNewActivity({
        name: "",
        description: "",
        type: "",
        duration: 0,
        instructions: "",
      })
    }
  }

  const removeActivity = (id: string) => {
    setActivities(prev => prev.filter(act => act.id !== id))
  }

  const toggleObjectiveAchieved = (id: string) => {
    setObjectives(prev => prev.map(obj => 
      obj.id === id ? { ...obj, achieved: !obj.achieved } : obj
    ))
  }

  const toggleActivityCompleted = (id: string) => {
    setActivities(prev => prev.map(act => 
      act.id === id ? { ...act, completed: !act.completed } : act
    ))
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      
      const updatedLesson: UpdateLessonRequest = {
        ...lessonData,
        objectives,
        activities,
      }

      await onSave(updatedLesson)
      onClose()
      
    } catch (error) {
      console.error("Failed to update lesson:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>レッスンを編集</DialogTitle>
          <DialogDescription>
            レッスンの詳細情報、目標、活動を編集できます。
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)] space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">基本情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">レッスン名 *</Label>
                  <Input
                    id="title"
                    value={lessonData.title || ""}
                    onChange={(e) => handleBasicInfoChange('title', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">ステータス</Label>
                  <Select
                    value={lessonData.status || ""}
                    onValueChange={(value) => handleBasicInfoChange('status', value as LessonStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">説明</Label>
                <Textarea
                  id="description"
                  value={lessonData.description || ""}
                  onChange={(e) => handleBasicInfoChange('description', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>実施日</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !lessonData.scheduledDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {lessonData.scheduledDate ? (
                          format(lessonData.scheduledDate, "yyyy年MM月dd日(E)", { locale: ja })
                        ) : (
                          "日付を選択"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={lessonData.scheduledDate}
                        onSelect={(date) => handleBasicInfoChange('scheduledDate', date)}
                        locale={ja}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startTime">開始時刻</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={lessonData.startTime || ""}
                    onChange={(e) => handleBasicInfoChange('startTime', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">終了時刻</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={lessonData.endTime || ""}
                    onChange={(e) => handleBasicInfoChange('endTime', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Objectives */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                学習目標
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existing objectives */}
              {objectives.length > 0 && (
                <div className="space-y-2">
                  {objectives.map((objective) => (
                    <div key={objective.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={objective.achieved}
                          onChange={() => toggleObjectiveAchieved(objective.id)}
                          className="rounded"
                        />
                        <div className="flex-1">
                          <div className="text-sm">{objective.description}</div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {OBJECTIVE_CATEGORIES.find(c => c.key === objective.category)?.label}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeObjective(objective.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new objective */}
              <div className="grid grid-cols-3 gap-2 p-3 border rounded-lg border-dashed">
                <div className="col-span-2">
                  <Input
                    placeholder="新しい目標を入力"
                    value={newObjective.description}
                    onChange={(e) => setNewObjective(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2">
                  <Select
                    value={newObjective.category}
                    onValueChange={(value) => setNewObjective(prev => ({ ...prev, category: value as ObjectiveCategory }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="カテゴリー" />
                    </SelectTrigger>
                    <SelectContent>
                      {OBJECTIVE_CATEGORIES.map((category) => (
                        <SelectItem key={category.key} value={category.key}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={addObjective}
                    disabled={!newObjective.description || !newObjective.category}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Play className="h-5 w-5" />
                学習活動
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existing activities */}
              {activities.length > 0 && (
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div key={activity.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={activity.completed}
                            onChange={() => toggleActivityCompleted(activity.id)}
                            className="rounded mt-0.5"
                          />
                          <div className="flex-1">
                            <div className="font-medium mb-1">{activity.name}</div>
                            {activity.description && (
                              <div className="text-sm text-muted-foreground mb-2">
                                {activity.description}
                              </div>
                            )}
                            <div className="flex gap-2">
                              <Badge variant="outline" className="text-xs">
                                {ACTIVITY_TYPES.find(t => t.key === activity.type)?.label}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {activity.duration}分
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeActivity(activity.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new activity */}
              <div className="p-3 border rounded-lg border-dashed space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="活動名"
                    value={newActivity.name}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Select
                    value={newActivity.type}
                    onValueChange={(value) => setNewActivity(prev => ({ ...prev, type: value as ActivityType }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="タイプ" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIVITY_TYPES.map((type) => (
                        <SelectItem key={type.key} value={type.key}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <Input
                    placeholder="時間(分)"
                    type="number"
                    value={newActivity.duration || ""}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                  />
                  <div className="col-span-2">
                    <Input
                      placeholder="説明"
                      value={newActivity.description}
                      onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <Button
                    onClick={addActivity}
                    disabled={!newActivity.name || !newActivity.type}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              "保存中..."
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                保存
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}