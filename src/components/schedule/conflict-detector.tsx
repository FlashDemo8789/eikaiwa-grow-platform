"use client"

import { ClassSession } from "@/types/schedule"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, Users, MapPin } from "lucide-react"
import { japaneseUtils } from "@/services/japanese-utils.service"

export interface ScheduleConflict {
  type: 'teacher_double_booking' | 'room_double_booking' | 'student_double_booking' | 'capacity_exceeded'
  severity: 'high' | 'medium' | 'low'
  message: string
  affectedClasses: string[]
  suggestions?: string[]
}

export class ConflictDetector {
  static detectConflicts(classes: ClassSession[]): ScheduleConflict[] {
    const conflicts: ScheduleConflict[] = []
    
    // Check for teacher double booking
    conflicts.push(...this.detectTeacherConflicts(classes))
    
    // Check for room double booking  
    conflicts.push(...this.detectRoomConflicts(classes))
    
    // Check for student double booking
    conflicts.push(...this.detectStudentConflicts(classes))
    
    // Check for capacity issues
    conflicts.push(...this.detectCapacityConflicts(classes))
    
    return conflicts
  }

  private static detectTeacherConflicts(classes: ClassSession[]): ScheduleConflict[] {
    const conflicts: ScheduleConflict[] = []
    const teacherSchedules = new Map<string, ClassSession[]>()
    
    // Group classes by teacher
    classes.forEach(classSession => {
      if (!teacherSchedules.has(classSession.teacherId)) {
        teacherSchedules.set(classSession.teacherId, [])
      }
      teacherSchedules.get(classSession.teacherId)!.push(classSession)
    })
    
    // Check each teacher's schedule for overlaps
    teacherSchedules.forEach((teacherClasses, teacherId) => {
      for (let i = 0; i < teacherClasses.length; i++) {
        for (let j = i + 1; j < teacherClasses.length; j++) {
          const class1 = teacherClasses[i]
          const class2 = teacherClasses[j]
          
          if (this.hasTimeOverlap(class1, class2)) {
            conflicts.push({
              type: 'teacher_double_booking',
              severity: 'high',
              message: `講師 ${class1.teacherName} が同時刻に複数のクラスを担当しています`,
              affectedClasses: [class1.id, class2.id],
              suggestions: [
                '別の講師を割り当てる',
                'クラス時間を調整する',
                'クラスをキャンセルまたは延期する'
              ]
            })
          }
        }
      }
    })
    
    return conflicts
  }

  private static detectRoomConflicts(classes: ClassSession[]): ScheduleConflict[] {
    const conflicts: ScheduleConflict[] = []
    const roomSchedules = new Map<string, ClassSession[]>()
    
    // Group classes by room
    classes.forEach(classSession => {
      if (!roomSchedules.has(classSession.roomId)) {
        roomSchedules.set(classSession.roomId, [])
      }
      roomSchedules.get(classSession.roomId)!.push(classSession)
    })
    
    // Check each room's schedule for overlaps
    roomSchedules.forEach((roomClasses, roomId) => {
      for (let i = 0; i < roomClasses.length; i++) {
        for (let j = i + 1; j < roomClasses.length; j++) {
          const class1 = roomClasses[i]
          const class2 = roomClasses[j]
          
          if (this.hasTimeOverlap(class1, class2)) {
            conflicts.push({
              type: 'room_double_booking',
              severity: 'high',
              message: `教室 ${class1.roomName} が同時刻に複数のクラスで使用されています`,
              affectedClasses: [class1.id, class2.id],
              suggestions: [
                '別の教室を割り当てる',
                'クラス時間を調整する',
                'オンラインクラスに変更する'
              ]
            })
          }
        }
      }
    })
    
    return conflicts
  }

  private static detectStudentConflicts(classes: ClassSession[]): ScheduleConflict[] {
    const conflicts: ScheduleConflict[] = []
    const studentSchedules = new Map<string, ClassSession[]>()
    
    // Group classes by student
    classes.forEach(classSession => {
      classSession.studentIds.forEach(studentId => {
        if (!studentSchedules.has(studentId)) {
          studentSchedules.set(studentId, [])
        }
        studentSchedules.get(studentId)!.push(classSession)
      })
    })
    
    // Check each student's schedule for overlaps
    studentSchedules.forEach((studentClasses, studentId) => {
      for (let i = 0; i < studentClasses.length; i++) {
        for (let j = i + 1; j < studentClasses.length; j++) {
          const class1 = studentClasses[i]
          const class2 = studentClasses[j]
          
          if (this.hasTimeOverlap(class1, class2)) {
            const studentName = class1.studentNames.find((_, index) => 
              class1.studentIds[index] === studentId
            ) || 'Unknown'
            
            conflicts.push({
              type: 'student_double_booking',
              severity: 'medium',
              message: `生徒 ${studentName} が同時刻に複数のクラスに登録されています`,
              affectedClasses: [class1.id, class2.id],
              suggestions: [
                '生徒を別のクラスに移動する',
                'クラス時間を調整する',
                '優先度の低いクラスをキャンセルする'
              ]
            })
          }
        }
      }
    })
    
    return conflicts
  }

  private static detectCapacityConflicts(classes: ClassSession[]): ScheduleConflict[] {
    const conflicts: ScheduleConflict[] = []
    
    classes.forEach(classSession => {
      if (classSession.studentIds.length > classSession.maxStudents) {
        conflicts.push({
          type: 'capacity_exceeded',
          severity: 'medium',
          message: `クラス "${classSession.title}" の定員を超過しています (${classSession.studentIds.length}/${classSession.maxStudents})`,
          affectedClasses: [classSession.id],
          suggestions: [
            '生徒を別のクラスに移動する',
            '定員を増やす',
            '追加クラスを作成する'
          ]
        })
      }
    })
    
    return conflicts
  }

  private static hasTimeOverlap(class1: ClassSession, class2: ClassSession): boolean {
    return class1.startTime < class2.endTime && class1.endTime > class2.startTime
  }

  static getConflictsForClass(classId: string, conflicts: ScheduleConflict[]): ScheduleConflict[] {
    return conflicts.filter(conflict => conflict.affectedClasses.includes(classId))
  }

  static hasConflicts(classId: string, conflicts: ScheduleConflict[]): boolean {
    return this.getConflictsForClass(classId, conflicts).length > 0
  }
}

// Conflict Display Component
export function ConflictIndicator({ 
  conflicts, 
  className = "" 
}: { 
  conflicts: ScheduleConflict[]
  className?: string 
}) {
  if (conflicts.length === 0) return null

  const highSeverityConflicts = conflicts.filter(c => c.severity === 'high')
  const hasHighSeverity = highSeverityConflicts.length > 0

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <AlertTriangle className={`h-4 w-4 ${hasHighSeverity ? 'text-red-500' : 'text-yellow-500'}`} />
      <Badge variant={hasHighSeverity ? 'destructive' : 'secondary'} className="text-xs">
        競合 {conflicts.length}
      </Badge>
    </div>
  )
}

// Detailed Conflict Panel
export function ConflictPanel({ 
  conflicts,
  onResolve
}: { 
  conflicts: ScheduleConflict[]
  onResolve: (conflictIndex: number, resolution: string) => void
}) {
  if (conflicts.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-green-500" />
        <p>競合はありません</p>
      </div>
    )
  }

  const getSeverityColor = (severity: ScheduleConflict['severity']) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getTypeIcon = (type: ScheduleConflict['type']) => {
    switch (type) {
      case 'teacher_double_booking': return <Users className="h-4 w-4" />
      case 'room_double_booking': return <MapPin className="h-4 w-4" />
      case 'student_double_booking': return <Users className="h-4 w-4" />
      case 'capacity_exceeded': return <Clock className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">スケジュール競合</h3>
        <Badge variant="destructive">
          {conflicts.length} 件の競合
        </Badge>
      </div>
      
      {conflicts.map((conflict, index) => (
        <div 
          key={index}
          className={`p-4 rounded-lg border ${getSeverityColor(conflict.severity)}`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              {getTypeIcon(conflict.type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Badge className={`text-xs ${getSeverityColor(conflict.severity)}`}>
                  {conflict.severity === 'high' ? '高' :
                   conflict.severity === 'medium' ? '中' : '低'}
                </Badge>
                <span className="text-sm font-medium">{conflict.message}</span>
              </div>
              
              {conflict.suggestions && (
                <div className="mt-3">
                  <p className="text-sm font-medium mb-2">解決案:</p>
                  <ul className="text-sm space-y-1">
                    {conflict.suggestions.map((suggestion, suggestionIndex) => (
                      <li key={suggestionIndex} className="flex items-center space-x-2">
                        <span className="w-1 h-1 bg-current rounded-full flex-shrink-0"></span>
                        <span>{suggestion}</span>
                        <button 
                          onClick={() => onResolve(index, suggestion)}
                          className="ml-auto text-xs underline hover:no-underline"
                        >
                          適用
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}