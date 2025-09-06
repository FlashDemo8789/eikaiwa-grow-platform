"use client"

import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
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
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Plus,
  X,
  Calendar,
  Clock,
  Target,
  Play,
  BookOpen,
  Upload,
  FileText,
  Save,
  Copy
} from "lucide-react"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { 
  type CreateLessonRequest, 
  type LessonObjective, 
  type LessonActivity,
  type ObjectiveCategory,
  type ActivityType,
  OBJECTIVE_CATEGORIES,
  ACTIVITY_TYPES,
  LESSON_DURATION_PRESETS
} from "@/types/lesson"

interface CreateLessonDialogProps {
  children: React.ReactNode
  templateId?: string
  onSuccess?: (lesson: any) => void
}

// Mock data
const mockCourses = [
  { id: "1", name: "初級英会話" },
  { id: "2", name: "ビジネス英語" },
  { id: "3", name: "TOEIC対策" },
  { id: "4", name: "子供英語" },
]

export function CreateLessonDialog({ children, templateId, onSuccess }: CreateLessonDialogProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [isLoading, setIsLoading] = useState(false)
  
  // Basic lesson info
  const [lessonData, setLessonData] = useState<Partial<CreateLessonRequest>>({
    title: "",
    description: "",
    courseId: "",
    scheduledDate: new Date(),
    startTime: "",
    endTime: "",
    objectives: [],
    activities: [],
    templateId
  })

  // Objectives state
  const [objectives, setObjectives] = useState<Omit<LessonObjective, 'id' | 'achieved'>[]>([])
  const [newObjective, setNewObjective] = useState({
    description: "",
    category: "" as ObjectiveCategory | "",
  })

  // Activities state
  const [activities, setActivities] = useState<Omit<LessonActivity, 'id' | 'completed'>[]>([])
  const [newActivity, setNewActivity] = useState({
    name: "",
    description: "",
    type: "" as ActivityType | "",
    duration: 0,
    materials: [] as string[],
    instructions: "",
  })

  const handleBasicInfoChange = (field: keyof CreateLessonRequest, value: any) => {
    setLessonData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addObjective = () => {
    if (newObjective.description && newObjective.category) {
      const objective = {
        ...newObjective,
        category: newObjective.category as ObjectiveCategory,
        order: objectives.length + 1
      }
      setObjectives(prev => [...prev, objective])
      setNewObjective({ description: "", category: "" })
    }
  }

  const removeObjective = (index: number) => {
    setObjectives(prev => prev.filter((_, i) => i !== index))
  }

  const addActivity = () => {
    if (newActivity.name && newActivity.type) {
      const activity = {
        ...newActivity,
        type: newActivity.type as ActivityType,
        order: activities.length + 1
      }
      setActivities(prev => [...prev, activity])
      setNewActivity({
        name: "",
        description: "",
        type: "",
        duration: 0,
        materials: [],
        instructions: "",
      })
    }
  }

  const removeActivity = (index: number) => {
    setActivities(prev => prev.filter((_, i) => i !== index))
  }

  const calculateEndTime = (startTime: string, duration: number) => {
    if (!startTime || !duration) return ""
    
    const [hours, minutes] = startTime.split(':').map(Number)
    const startMinutes = hours * 60 + minutes
    const endMinutes = startMinutes + duration
    
    const endHours = Math.floor(endMinutes / 60)
    const remainingMinutes = endMinutes % 60
    
    return `${endHours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}`
  }

  const handleDurationPreset = (duration: number) => {
    if (lessonData.startTime) {
      const endTime = calculateEndTime(lessonData.startTime, duration)
      handleBasicInfoChange('endTime', endTime)
    }
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      
      const lessonToCreate: CreateLessonRequest = {
        ...lessonData,
        objectives,
        activities,
      } as CreateLessonRequest

      // Here you would call your API
      console.log("Creating lesson:", lessonToCreate)
      
      // Mock success
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onSuccess?.(lessonToCreate)
      setOpen(false)
      
      // Reset form
      setLessonData({
        title: "",
        description: "",
        courseId: "",
        scheduledDate: new Date(),
        startTime: "",
        endTime: "",
        objectives: [],
        activities: [],
      })
      setObjectives([])
      setActivities([])
      setActiveTab("basic")
      
    } catch (error) {
      console.error("Failed to create lesson:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = () => {
    return !!(
      lessonData.title &&
      lessonData.courseId &&
      lessonData.scheduledDate &&
      lessonData.startTime &&
      lessonData.endTime
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            新しいレッスンを作成
          </DialogTitle>
          <DialogDescription>
            効果的な授業のための詳細なレッスンプランを作成しましょう。
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              基本情報
            </TabsTrigger>
            <TabsTrigger value="objectives" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              目標設定
            </TabsTrigger>
            <TabsTrigger value="activities" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              活動計画
            </TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            <TabsContent value="basic" className="space-y-6 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">レッスン名 *</Label>
                  <Input
                    id="title"
                    placeholder="例：基本挨拶と自己紹介"
                    value={lessonData.title || ""}
                    onChange={(e) => handleBasicInfoChange('title', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course">コース *</Label>
                  <Select
                    value={lessonData.courseId || ""}
                    onValueChange={(value) => handleBasicInfoChange('courseId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="コースを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCourses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">レッスンの説明</Label>
                <Textarea
                  id="description"
                  placeholder="このレッスンで何を学ぶか詳しく説明してください..."
                  value={lessonData.description || ""}
                  onChange={(e) => handleBasicInfoChange('description', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>実施日 *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !lessonData.scheduledDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {lessonData.scheduledDate ? (
                          format(lessonData.scheduledDate, "yyyy年MM月dd日(E)", { locale: ja })
                        ) : (
                          "日付を選択"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
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
                  <Label htmlFor="startTime">開始時刻 *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={lessonData.startTime || ""}
                    onChange={(e) => handleBasicInfoChange('startTime', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">終了時刻 *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={lessonData.endTime || ""}
                    onChange={(e) => handleBasicInfoChange('endTime', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>時間設定プリセット</Label>
                <div className="flex gap-2 flex-wrap">
                  {LESSON_DURATION_PRESETS.map((preset) => (
                    <Button
                      key={preset.value}
                      variant="outline"
                      size="sm"
                      onClick={() => handleDurationPreset(preset.value)}
                      disabled={!lessonData.startTime}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="objectives" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    学習目標を設定
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label>目標内容</Label>
                      <Input
                        placeholder="例：基本挨拶をマスターする"
                        value={newObjective.description}
                        onChange={(e) => setNewObjective(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>カテゴリー</Label>
                      <Select
                        value={newObjective.category}
                        onValueChange={(value) => setNewObjective(prev => ({ ...prev, category: value as ObjectiveCategory }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {OBJECTIVE_CATEGORIES.map((category) => (
                            <SelectItem key={category.key} value={category.key}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button
                    onClick={addObjective}
                    disabled={!newObjective.description || !newObjective.category}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    目標を追加
                  </Button>
                </CardContent>
              </Card>

              {objectives.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">設定済み目標</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {objectives.map((objective, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary">
                                {OBJECTIVE_CATEGORIES.find(c => c.key === objective.category)?.label}
                              </Badge>
                            </div>
                            <div className="text-sm">{objective.description}</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeObjective(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="activities" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    学習活動を計画
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>活動名</Label>
                      <Input
                        placeholder="例：自己紹介ゲーム"
                        value={newActivity.name}
                        onChange={(e) => setNewActivity(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>活動タイプ</Label>
                      <Select
                        value={newActivity.type}
                        onValueChange={(value) => setNewActivity(prev => ({ ...prev, type: value as ActivityType }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {ACTIVITY_TYPES.map((type) => (
                            <SelectItem key={type.key} value={type.key}>
                              {type.icon} {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>所要時間（分）</Label>
                      <Input
                        type="number"
                        placeholder="15"
                        value={newActivity.duration || ""}
                        onChange={(e) => setNewActivity(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>説明</Label>
                      <Input
                        placeholder="活動の詳細説明"
                        value={newActivity.description}
                        onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>実施手順</Label>
                    <Textarea
                      placeholder="この活動をどのように進めるか手順を記載してください..."
                      value={newActivity.instructions}
                      onChange={(e) => setNewActivity(prev => ({ ...prev, instructions: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={addActivity}
                    disabled={!newActivity.name || !newActivity.type}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    活動を追加
                  </Button>
                </CardContent>
              </Card>

              {activities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">計画済み活動</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {activities.map((activity, index) => (
                        <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary">
                                {ACTIVITY_TYPES.find(t => t.key === activity.type)?.icon}{' '}
                                {ACTIVITY_TYPES.find(t => t.key === activity.type)?.label}
                              </Badge>
                              <Badge variant="outline">
                                {activity.duration}分
                              </Badge>
                            </div>
                            <div className="font-medium mb-1">{activity.name}</div>
                            {activity.description && (
                              <div className="text-sm text-muted-foreground mb-2">
                                {activity.description}
                              </div>
                            )}
                            {activity.instructions && (
                              <div className="text-sm">
                                <strong>手順:</strong> {activity.instructions}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeActivity(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            キャンセル
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? (
              <>保存中...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                レッスンを作成
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}