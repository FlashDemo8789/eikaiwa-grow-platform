"use client"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Download,
  Filter,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  UserCheck,
  AlertTriangle
} from "lucide-react"
import { 
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core'
import { 
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isSameDay, startOfMonth, endOfMonth, addMonths, subMonths, eachWeekOfInterval } from "date-fns"
import { ja } from "date-fns/locale"
import { japaneseUtils } from "@/services/japanese-utils.service"
import { toast } from "@/hooks/use-toast"
import { ClassSession, Teacher, Room, Student } from "@/types/schedule"
import { ConflictDetector, ConflictIndicator, ConflictPanel } from "@/components/schedule/conflict-detector"
import { AttendanceTracker, AttendanceBadge } from "@/components/schedule/attendance-tracker"
import { ScheduleExporter } from "@/components/schedule/schedule-exporter"

// Mock data - in real app this would come from API
const mockTeachers: Teacher[] = [
  {
    id: "1",
    name: "田中 英子",
    email: "tanaka@example.com", 
    phone: "090-1234-5678",
    specialties: ["キッズ英語", "会話クラス"],
    availability: {
      monday: { start: "09:00", end: "17:00", available: true },
      tuesday: { start: "09:00", end: "17:00", available: true },
      wednesday: { start: "09:00", end: "17:00", available: true },
      thursday: { start: "09:00", end: "17:00", available: true },
      friday: { start: "09:00", end: "17:00", available: true },
      saturday: { start: "10:00", end: "16:00", available: true },
      sunday: { start: "10:00", end: "16:00", available: false }
    }
  },
  {
    id: "2", 
    name: "Mike Johnson",
    email: "mike@example.com",
    phone: "080-9876-5432", 
    specialties: ["ビジネス英語", "TOEIC"],
    availability: {
      monday: { start: "10:00", end: "18:00", available: true },
      tuesday: { start: "10:00", end: "18:00", available: true },
      wednesday: { start: "10:00", end: "18:00", available: true },
      thursday: { start: "10:00", end: "18:00", available: true },
      friday: { start: "10:00", end: "18:00", available: true },
      saturday: { start: "09:00", end: "15:00", available: true },
      sunday: { start: "09:00", end: "15:00", available: false }
    }
  }
]

const mockRooms: Room[] = [
  {
    id: "1",
    name: "教室A",
    capacity: 8,
    equipment: ["プロジェクター", "ホワイトボード", "オーディオシステム"],
    location: "1階",
    available: true
  },
  {
    id: "2", 
    name: "教室B",
    capacity: 6,
    equipment: ["TV", "ホワイトボード"], 
    location: "1階",
    available: true
  },
  {
    id: "3",
    name: "個人レッスン室",
    capacity: 2,
    equipment: ["ホワイトボード"],
    location: "2階", 
    available: true
  }
]

const mockStudents: Student[] = [
  { id: "1", name: "佐藤 太郎", level: "初級", phone: "090-1111-2222", email: "sato@example.com" },
  { id: "2", name: "鈴木 花子", level: "中級", phone: "080-3333-4444", email: "suzuki@example.com" },
  { id: "3", name: "田中 次郎", level: "上級", phone: "070-5555-6666", email: "tanaka@example.com" }
]

const levelColors = {
  beginner: "bg-green-500",
  intermediate: "bg-blue-500", 
  advanced: "bg-purple-500",
  conversation: "bg-orange-500"
}

const statusColors = {
  scheduled: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  'no-show': "bg-gray-100 text-gray-800"
}

const typeColors = {
  group: "border-l-blue-500",
  private: "border-l-green-500", 
  trial: "border-l-orange-500",
  makeup: "border-l-purple-500"
}

// Draggable Class Item
function DraggableClassItem({ 
  classSession, 
  conflicts, 
  onEdit, 
  onDelete, 
  onCopy,
  onUpdateAttendance 
}: {
  classSession: ClassSession
  conflicts: any[]
  onEdit: (classSession: ClassSession) => void
  onDelete: (id: string) => void
  onCopy: (classSession: ClassSession) => void
  onUpdateAttendance: (classId: string, attendance: any[]) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: classSession.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const classConflicts = ConflictDetector.getConflictsForClass(classSession.id, conflicts)
  const hasConflicts = classConflicts.length > 0

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-3 bg-white rounded-lg shadow-sm border-l-4 ${typeColors[classSession.classType]} cursor-move hover:shadow-md transition-shadow ${hasConflicts ? 'ring-2 ring-red-400' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
          <Badge className={levelColors[classSession.level]} variant="secondary">
            {classSession.level === 'beginner' ? '初級' : 
             classSession.level === 'intermediate' ? '中級' : 
             classSession.level === 'advanced' ? '上級' : '会話'}
          </Badge>
          <Badge className={statusColors[classSession.status]} variant="outline">
            {classSession.status === 'scheduled' ? '予定' :
             classSession.status === 'completed' ? '完了' :
             classSession.status === 'cancelled' ? 'キャンセル' : '欠席'}
          </Badge>
          <AttendanceBadge 
            attendance={classSession.attendance}
            totalStudents={classSession.studentIds.length}
          />
          {hasConflicts && <ConflictIndicator conflicts={classConflicts} />}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(classSession)}>
              <Edit className="h-4 w-4 mr-2" />
              編集
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCopy(classSession)}>
              <Copy className="h-4 w-4 mr-2" />
              コピー
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(classSession.id)} className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              削除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h3 className="font-medium text-sm mb-1">{classSession.title}</h3>
      <div className="text-xs text-gray-600 space-y-1">
        <div className="flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          {japaneseUtils.formatJapaneseTime(classSession.startTime)} - {japaneseUtils.formatJapaneseTime(classSession.endTime)}
        </div>
        <div className="flex items-center">
          <Users className="h-3 w-3 mr-1" />
          {classSession.teacherName}
        </div>
        <div className="flex items-center">
          <MapPin className="h-3 w-3 mr-1" />
          {classSession.roomName}
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center">
            <UserCheck className="h-3 w-3 mr-1" />
            生徒 {classSession.studentIds.length}/{classSession.maxStudents}名
          </span>
          {classSession.status === 'scheduled' && (
            <AttendanceTracker 
              classSession={classSession}
              onUpdateAttendance={onUpdateAttendance}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// Quick Add Class Dialog
function QuickAddClassDialog({ date, onAdd }: { 
  date?: Date
  onAdd: (classData: Partial<ClassSession>) => void 
}) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    startTime: "10:00",
    endTime: "11:00",
    teacherId: "",
    roomId: "",
    level: "beginner" as ClassSession['level'],
    classType: "group" as ClassSession['classType'],
    maxStudents: 6,
    studentIds: [] as string[],
    notes: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const startDateTime = new Date(date || new Date())
    const [startHour, startMinute] = formData.startTime.split(':')
    startDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0)
    
    const endDateTime = new Date(date || new Date())
    const [endHour, endMinute] = formData.endTime.split(':')
    endDateTime.setHours(parseInt(endHour), parseInt(endMinute), 0)

    const teacher = mockTeachers.find(t => t.id === formData.teacherId)
    const room = mockRooms.find(r => r.id === formData.roomId)
    const students = mockStudents.filter(s => formData.studentIds.includes(s.id))

    onAdd({
      id: Math.random().toString(36),
      title: formData.title,
      startTime: startDateTime,
      endTime: endDateTime,
      teacherId: formData.teacherId,
      teacherName: teacher?.name || "",
      roomId: formData.roomId,
      roomName: room?.name || "",
      studentIds: formData.studentIds,
      studentNames: students.map(s => s.name),
      level: formData.level,
      classType: formData.classType,
      maxStudents: formData.maxStudents,
      status: "scheduled" as const,
      color: levelColors[formData.level],
      notes: formData.notes
    })

    setOpen(false)
    toast({
      title: "クラスが追加されました",
      description: `${formData.title}が正常にスケジュールに追加されました。`
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          クイック追加
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新しいクラスを追加</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">クラス名</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="例: 初級会話クラス"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="classType">クラスタイプ</Label>
              <Select value={formData.classType} onValueChange={(value: ClassSession['classType']) => setFormData({...formData, classType: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="group">グループレッスン</SelectItem>
                  <SelectItem value="private">個人レッスン</SelectItem>
                  <SelectItem value="trial">体験レッスン</SelectItem>
                  <SelectItem value="makeup">振替レッスン</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">開始時間</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">終了時間</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">レベル</Label>
              <Select value={formData.level} onValueChange={(value: ClassSession['level']) => setFormData({...formData, level: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">初級</SelectItem>
                  <SelectItem value="intermediate">中級</SelectItem>
                  <SelectItem value="advanced">上級</SelectItem>
                  <SelectItem value="conversation">会話</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="teacherId">講師</Label>
              <Select value={formData.teacherId} onValueChange={(value) => setFormData({...formData, teacherId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="講師を選択" />
                </SelectTrigger>
                <SelectContent>
                  {mockTeachers.map(teacher => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="roomId">教室</Label>
              <Select value={formData.roomId} onValueChange={(value) => setFormData({...formData, roomId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="教室を選択" />
                </SelectTrigger>
                <SelectContent>
                  {mockRooms.map(room => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name} (定員{room.capacity}名)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxStudents">最大生徒数</Label>
            <Input
              id="maxStudents"
              type="number"
              min="1"
              max="20"
              value={formData.maxStudents}
              onChange={(e) => setFormData({...formData, maxStudents: parseInt(e.target.value)})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">備考</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="追加の情報や特記事項"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
            <Button type="submit">
              クラスを追加
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


// Main Schedule Component
export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')
  const [classes, setClasses] = useState<ClassSession[]>([
    // Mock data
    {
      id: "1",
      title: "初級会話クラス",
      startTime: new Date(2025, 8, 8, 10, 0),
      endTime: new Date(2025, 8, 8, 11, 0),
      teacherId: "1",
      teacherName: "田中 英子",
      roomId: "1",
      roomName: "教室A",
      studentIds: ["1", "2"],
      studentNames: ["佐藤 太郎", "鈴木 花子"],
      level: "beginner",
      classType: "group",
      maxStudents: 6,
      status: "scheduled",
      color: levelColors.beginner
    },
    {
      id: "2", 
      title: "ビジネス英語",
      startTime: new Date(2025, 8, 9, 14, 0),
      endTime: new Date(2025, 8, 9, 15, 30),
      teacherId: "2",
      teacherName: "Mike Johnson", 
      roomId: "2",
      roomName: "教室B",
      studentIds: ["3"],
      studentNames: ["田中 次郎"],
      level: "advanced",
      classType: "private",
      maxStudents: 1,
      status: "scheduled",
      color: levelColors.advanced
    }
  ])
  const [draggedItem, setDraggedItem] = useState<ClassSession | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterLevel, setFilterLevel] = useState<string>("all")
  const [filterTeacher, setFilterTeacher] = useState<string>("all")
  const [showConflictPanel, setShowConflictPanel] = useState(false)
  
  // Calculate conflicts
  const conflicts = useMemo(() => {
    return ConflictDetector.detectConflicts(classes)
  }, [classes])
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Generate calendar dates based on view mode
  const calendarDates = useMemo(() => {
    if (viewMode === 'week') {
      const weekStart = startOfWeek(currentDate, { locale: ja })
      const weekEnd = endOfWeek(currentDate, { locale: ja })
      return eachDayOfInterval({ start: weekStart, end: weekEnd })
    } else {
      const monthStart = startOfMonth(currentDate)
      const monthEnd = endOfMonth(currentDate) 
      const calendarStart = startOfWeek(monthStart, { locale: ja })
      const calendarEnd = endOfWeek(monthEnd, { locale: ja })
      return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
    }
  }, [currentDate, viewMode])

  // Filter classes based on search and filters
  const filteredClasses = useMemo(() => {
    return classes.filter(classSession => {
      const matchesSearch = classSession.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           classSession.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           classSession.studentNames.some(name => name.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesLevel = filterLevel === "all" || classSession.level === filterLevel
      const matchesTeacher = filterTeacher === "all" || classSession.teacherId === filterTeacher
      
      return matchesSearch && matchesLevel && matchesTeacher
    })
  }, [classes, searchTerm, filterLevel, filterTeacher])

  // Get classes for a specific date
  const getClassesForDate = useCallback((date: Date) => {
    return filteredClasses.filter(classSession => 
      isSameDay(classSession.startTime, date)
    )
  }, [filteredClasses])

  // Navigation functions
  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1))
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1))
  }

  const navigate = (direction: 'prev' | 'next') => {
    if (viewMode === 'week') {
      navigateWeek(direction)
    } else {
      navigateMonth(direction)
    }
  }

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const draggedClass = classes.find(c => c.id === active.id)
    setDraggedItem(draggedClass || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      // TODO: Implement actual drag and drop logic for rescheduling
      toast({
        title: "クラスが移動されました",
        description: "ドラッグ&ドロップ機能は実装中です。"
      })
    }
    
    setDraggedItem(null)
  }

  // Class management functions
  const handleAddClass = (classData: Partial<ClassSession>) => {
    const newClass: ClassSession = {
      id: Math.random().toString(36),
      title: "",
      startTime: new Date(),
      endTime: new Date(), 
      teacherId: "",
      teacherName: "",
      roomId: "",
      roomName: "",
      studentIds: [],
      studentNames: [],
      level: "beginner",
      classType: "group",
      maxStudents: 6,
      status: "scheduled",
      color: levelColors.beginner,
      ...classData
    }
    setClasses(prev => [...prev, newClass])
  }

  const handleEditClass = (classSession: ClassSession) => {
    // TODO: Open edit dialog
    toast({
      title: "編集機能",
      description: "編集機能は実装中です。"
    })
  }

  const handleDeleteClass = (id: string) => {
    setClasses(prev => prev.filter(c => c.id !== id))
    toast({
      title: "クラスが削除されました",
      description: "選択したクラスが正常に削除されました。"
    })
  }

  const handleCopyClass = (classSession: ClassSession) => {
    const copiedClass = {
      ...classSession,
      id: Math.random().toString(36),
      title: `${classSession.title} (コピー)`,
      startTime: addDays(classSession.startTime, 7),
      endTime: addDays(classSession.endTime, 7),
      attendance: undefined // Reset attendance for copied class
    }
    setClasses(prev => [...prev, copiedClass])
    toast({
      title: "クラスがコピーされました",
      description: "1週間後の同じ時刻にコピーされました。"
    })
  }

  const handleUpdateAttendance = (classId: string, attendance: any[]) => {
    setClasses(prev => prev.map(classSession => 
      classSession.id === classId 
        ? { ...classSession, attendance }
        : classSession
    ))
    toast({
      title: "出席情報が更新されました",
      description: "出席情報が正常に保存されました。"
    })
  }

  const handleResolveConflict = (conflictIndex: number, resolution: string) => {
    // TODO: Implement conflict resolution logic based on resolution type
    toast({
      title: "競合の解決",
      description: `"${resolution}" の適用は実装中です。`
    })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">クラススケジュール</h1>
          <p className="text-muted-foreground">
            クラスの予定を管理・確認できます
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {conflicts.length > 0 && (
            <Button 
              variant="outline" 
              onClick={() => setShowConflictPanel(!showConflictPanel)}
              className="text-red-600 border-red-300"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              競合 {conflicts.length}件
            </Button>
          )}
          <ScheduleExporter 
            classes={filteredClasses} 
            currentDate={currentDate}
            viewMode={viewMode}
          />
          <QuickAddClassDialog onAdd={handleAddClass} />
        </div>
      </div>

      {/* Conflict Panel */}
      {showConflictPanel && (
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <ConflictPanel 
              conflicts={conflicts}
              onResolve={handleResolveConflict}
            />
          </CardContent>
        </Card>
      )}

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => navigate('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold min-w-[200px] text-center">
                {viewMode === 'week' 
                  ? `${japaneseUtils.formatJapaneseDate(startOfWeek(currentDate, { locale: ja }), false)} - ${japaneseUtils.formatJapaneseDate(endOfWeek(currentDate, { locale: ja }), false)}`
                  : japaneseUtils.formatJapaneseDate(currentDate, false).split('日')[0] + '年' + (currentDate.getMonth() + 1) + '月'
                }
              </h2>
              <Button
                variant="outline"
                onClick={() => navigate('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <Tabs value={viewMode} onValueChange={(value: 'week' | 'month') => setViewMode(value)}>
              <TabsList>
                <TabsTrigger value="week">週表示</TabsTrigger>
                <TabsTrigger value="month">月表示</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <Input
                  placeholder="クラス、講師、生徒で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="レベル" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全レベル</SelectItem>
                  <SelectItem value="beginner">初級</SelectItem>
                  <SelectItem value="intermediate">中級</SelectItem>
                  <SelectItem value="advanced">上級</SelectItem>
                  <SelectItem value="conversation">会話</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterTeacher} onValueChange={setFilterTeacher}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="講師" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全講師</SelectItem>
                  {mockTeachers.map(teacher => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className={`grid gap-4 ${viewMode === 'week' ? 'grid-cols-7' : 'grid-cols-7'}`}>
          {/* Day Headers */}
          {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
            <div key={day} className="p-3 text-center font-medium border-b">
              {day}曜日
            </div>
          ))}
          
          {/* Calendar Cells */}
          {calendarDates.map((date, index) => {
            const dayClasses = getClassesForDate(date)
            const isToday = isSameDay(date, new Date())
            const isCurrentMonth = date.getMonth() === currentDate.getMonth()
            
            return (
              <Card 
                key={index}
                className={`min-h-32 ${isToday ? 'ring-2 ring-blue-500' : ''} ${!isCurrentMonth && viewMode === 'month' ? 'opacity-50' : ''}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isToday ? 'font-bold text-blue-600' : ''}`}>
                      {date.getDate()}
                    </span>
                    {japaneseUtils.isJapaneseHoliday(date) && (
                      <Badge variant="secondary" className="text-xs">
                        祝日
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <SortableContext 
                    items={dayClasses.map(c => c.id)} 
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {dayClasses.map(classSession => (
                        <DraggableClassItem
                          key={classSession.id}
                          classSession={classSession}
                          conflicts={conflicts}
                          onEdit={handleEditClass}
                          onDelete={handleDeleteClass}
                          onCopy={handleCopyClass}
                          onUpdateAttendance={handleUpdateAttendance}
                        />
                      ))}
                    </div>
                  </SortableContext>
                  
                  {dayClasses.length === 0 && (
                    <div 
                      className="h-16 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-300 transition-colors"
                      onClick={() => {/* TODO: Quick add for specific date */}}
                    >
                      <Plus className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
        
        <DragOverlay>
          {draggedItem ? (
            <div className="p-3 bg-white rounded-lg shadow-lg border-l-4 border-l-blue-500 opacity-75">
              <Badge className={levelColors[draggedItem.level]} variant="secondary">
                {draggedItem.level === 'beginner' ? '初級' : 
                 draggedItem.level === 'intermediate' ? '中級' : 
                 draggedItem.level === 'advanced' ? '上級' : '会話'}
              </Badge>
              <h3 className="font-medium text-sm mt-1">{draggedItem.title}</h3>
              <p className="text-xs text-gray-600">
                {japaneseUtils.formatJapaneseTime(draggedItem.startTime)} - {japaneseUtils.formatJapaneseTime(draggedItem.endTime)}
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}