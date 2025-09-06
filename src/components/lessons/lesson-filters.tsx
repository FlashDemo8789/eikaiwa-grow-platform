"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { 
  Search, 
  Filter, 
  X, 
  Calendar as CalendarIcon,
  BookOpen,
  User,
  Star
} from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { LessonFilters as LessonFiltersType } from "@/types/lesson"

interface LessonFiltersProps {
  onFiltersChange?: (filters: LessonFiltersType) => void
  className?: string
}

// Mock data - in real app this would come from API
const mockCourses = [
  { id: "1", name: "初級英会話" },
  { id: "2", name: "ビジネス英語" },
  { id: "3", name: "TOEIC対策" },
  { id: "4", name: "子供英語" },
  { id: "5", name: "上級会話" },
]

const mockTeachers = [
  { id: "1", name: "田中先生" },
  { id: "2", name: "山田先生" },
  { id: "3", name: "佐藤先生" },
  { id: "4", name: "Smith先生" },
]

const statusOptions = [
  { value: "planned", label: "計画済み" },
  { value: "in_progress", label: "進行中" },
  { value: "completed", label: "完了" },
  { value: "cancelled", label: "キャンセル" },
  { value: "rescheduled", label: "再スケジュール" },
]

const skillLevels = [
  { value: "excellent", label: "優秀" },
  { value: "good", label: "良い" },
  { value: "developing", label: "発達中" },
  { value: "needs_practice", label: "練習が必要" },
]

const ageGroups = [
  { value: "toddler", label: "幼児" },
  { value: "preschool", label: "就学前" },
  { value: "elementary", label: "小学生" },
  { value: "middle_school", label: "中学生" },
  { value: "high_school", label: "高校生" },
  { value: "adult", label: "大人" },
  { value: "senior", label: "シニア" },
]

export function LessonFilters({ onFiltersChange, className }: LessonFiltersProps) {
  const [filters, setFilters] = useState<LessonFiltersType>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()

  const updateFilters = (newFilters: Partial<LessonFiltersType>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFiltersChange?.(updatedFilters)
  }

  const clearFilters = () => {
    const clearedFilters: LessonFiltersType = {}
    setFilters(clearedFilters)
    setSearchQuery("")
    setDateFrom(undefined)
    setDateTo(undefined)
    onFiltersChange?.(clearedFilters)
  }

  const activeFiltersCount = Object.keys(filters).filter(key => 
    filters[key as keyof LessonFiltersType] !== undefined
  ).length

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="レッスン名、コース名、先生名で検索..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              updateFilters({ search: e.target.value || undefined })
            }}
            className="pl-10"
          />
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Course Filter */}
        <Select 
          value={filters.courseId || "all"} 
          onValueChange={(value) => updateFilters({ courseId: value === "all" ? undefined : value })}
        >
          <SelectTrigger className="w-[180px]">
            <BookOpen className="h-4 w-4 mr-2" />
            <SelectValue placeholder="コースを選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべてのコース</SelectItem>
            {mockCourses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Teacher Filter */}
        <Select 
          value={filters.teacherId || "all"} 
          onValueChange={(value) => updateFilters({ teacherId: value === "all" ? undefined : value })}
        >
          <SelectTrigger className="w-[150px]">
            <User className="h-4 w-4 mr-2" />
            <SelectValue placeholder="先生を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべての先生</SelectItem>
            {mockTeachers.map((teacher) => (
              <SelectItem key={teacher.id} value={teacher.id}>
                {teacher.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select 
          value={filters.status || "all"} 
          onValueChange={(value) => updateFilters({ status: value === "all" ? undefined : value as any })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="ステータス" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべてのステータス</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Range Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFrom ? (
                dateTo ? (
                  <>
                    {format(dateFrom, "yyyy/MM/dd", { locale: ja })} - {format(dateTo, "MM/dd", { locale: ja })}
                  </>
                ) : (
                  format(dateFrom, "yyyy/MM/dd", { locale: ja })
                )
              ) : (
                "日付範囲を選択"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 border-b">
              <div className="text-sm font-medium">日付範囲を選択</div>
            </div>
            <div className="flex">
              <div className="p-3">
                <div className="text-xs text-muted-foreground mb-2">開始日</div>
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={(date) => {
                    setDateFrom(date)
                    updateFilters({ dateFrom: date })
                  }}
                  locale={ja}
                  className="rounded-md border-none p-0"
                />
              </div>
              <div className="p-3 border-l">
                <div className="text-xs text-muted-foreground mb-2">終了日</div>
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={(date) => {
                    setDateTo(date)
                    updateFilters({ dateTo: date })
                  }}
                  locale={ja}
                  className="rounded-md border-none p-0"
                  disabled={(date) => dateFrom ? date < dateFrom : false}
                />
              </div>
            </div>
            <div className="p-3 border-t flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setDateFrom(undefined)
                  setDateTo(undefined)
                  updateFilters({ dateFrom: undefined, dateTo: undefined })
                }}
              >
                クリア
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Skill Level Filter */}
        <Select 
          value={filters.skillLevel || "all"} 
          onValueChange={(value) => updateFilters({ skillLevel: value === "all" ? undefined : value as any })}
        >
          <SelectTrigger className="w-[140px]">
            <Star className="h-4 w-4 mr-2" />
            <SelectValue placeholder="レベル" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべてのレベル</SelectItem>
            {skillLevels.map((level) => (
              <SelectItem key={level.value} value={level.value}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Age Group Filter */}
        <Select 
          value={filters.ageGroup || "all"} 
          onValueChange={(value) => updateFilters({ ageGroup: value === "all" ? undefined : value as any })}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="年齢層" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべての年齢層</SelectItem>
            {ageGroups.map((group) => (
              <SelectItem key={group.value} value={group.value}>
                {group.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="h-10 px-3"
          >
            <X className="h-4 w-4 mr-1" />
            クリア ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.courseId && (
            <Badge variant="secondary" className="gap-1">
              コース: {mockCourses.find(c => c.id === filters.courseId)?.name}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ courseId: undefined })}
              />
            </Badge>
          )}
          {filters.teacherId && (
            <Badge variant="secondary" className="gap-1">
              先生: {mockTeachers.find(t => t.id === filters.teacherId)?.name}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ teacherId: undefined })}
              />
            </Badge>
          )}
          {filters.status && (
            <Badge variant="secondary" className="gap-1">
              ステータス: {statusOptions.find(s => s.value === filters.status)?.label}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ status: undefined })}
              />
            </Badge>
          )}
          {filters.skillLevel && (
            <Badge variant="secondary" className="gap-1">
              レベル: {skillLevels.find(l => l.value === filters.skillLevel)?.label}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ skillLevel: undefined })}
              />
            </Badge>
          )}
          {filters.ageGroup && (
            <Badge variant="secondary" className="gap-1">
              年齢層: {ageGroups.find(g => g.value === filters.ageGroup)?.label}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ ageGroup: undefined })}
              />
            </Badge>
          )}
          {(filters.dateFrom || filters.dateTo) && (
            <Badge variant="secondary" className="gap-1">
              日付: {filters.dateFrom && format(filters.dateFrom, "MM/dd", { locale: ja })}
              {filters.dateFrom && filters.dateTo && " - "}
              {filters.dateTo && format(filters.dateTo, "MM/dd", { locale: ja })}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ dateFrom: undefined, dateTo: undefined })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}