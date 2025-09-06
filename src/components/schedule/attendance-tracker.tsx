"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  UserCheck, 
  UserX, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  MessageCircle
} from "lucide-react"
import { ClassSession } from "@/types/schedule"

export interface AttendanceRecord {
  studentId: string
  studentName: string
  status: 'present' | 'absent' | 'late' | 'excused'
  arrivalTime?: Date
  notes?: string
}

interface AttendanceTrackerProps {
  classSession: ClassSession
  onUpdateAttendance: (classId: string, attendance: AttendanceRecord[]) => void
}

const attendanceStatusMap = {
  present: {
    label: '出席',
    icon: CheckCircle,
    color: 'text-green-600 bg-green-50 border-green-200',
    badgeColor: 'bg-green-500'
  },
  absent: {
    label: '欠席', 
    icon: XCircle,
    color: 'text-red-600 bg-red-50 border-red-200',
    badgeColor: 'bg-red-500'
  },
  late: {
    label: '遅刻',
    icon: Clock,
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    badgeColor: 'bg-yellow-500'
  },
  excused: {
    label: '事前欠席',
    icon: AlertCircle,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    badgeColor: 'bg-blue-500'
  }
}

export function AttendanceTracker({ classSession, onUpdateAttendance }: AttendanceTrackerProps) {
  const [open, setOpen] = useState(false)
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    // Initialize with existing attendance or create new records
    return classSession.studentIds.map((studentId, index) => {
      const existing = classSession.attendance?.find(a => a.studentId === studentId)
      return {
        studentId,
        studentName: classSession.studentNames[index],
        status: existing?.status || 'present',
        notes: ''
      }
    })
  })

  const updateStudentAttendance = (studentId: string, status: AttendanceRecord['status'], notes?: string) => {
    setAttendance(prev => 
      prev.map(record => 
        record.studentId === studentId 
          ? { 
              ...record, 
              status, 
              notes: notes || record.notes,
              arrivalTime: status === 'late' ? new Date() : undefined
            }
          : record
      )
    )
  }

  const saveAttendance = () => {
    onUpdateAttendance(classSession.id, attendance)
    setOpen(false)
  }

  const getAttendanceStats = () => {
    const stats = attendance.reduce((acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return stats
  }

  const stats = getAttendanceStats()
  const attendanceRate = Math.round(((stats.present || 0) / attendance.length) * 100)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserCheck className="h-4 w-4 mr-2" />
          出席確認
          {stats.present && (
            <Badge className="ml-2 bg-green-500" variant="secondary">
              {stats.present}/{attendance.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserCheck className="h-5 w-5" />
            <span>出席確認 - {classSession.title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Class Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">クラス情報</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">講師:</span> {classSession.teacherName}
                </div>
                <div>
                  <span className="text-gray-500">教室:</span> {classSession.roomName}
                </div>
                <div>
                  <span className="text-gray-500">時間:</span> 
                  {classSession.startTime.toLocaleTimeString('ja-JP', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })} - {classSession.endTime.toLocaleTimeString('ja-JP', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
                <div>
                  <span className="text-gray-500">出席率:</span> 
                  <Badge className={attendanceRate >= 80 ? 'bg-green-500' : attendanceRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'}>
                    {attendanceRate}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Summary */}
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(attendanceStatusMap).map(([status, config]) => {
              const count = stats[status as keyof typeof stats] || 0
              return (
                <Card key={status} className={`border ${config.color.includes('green') ? 'border-green-200' : 
                                                          config.color.includes('red') ? 'border-red-200' :
                                                          config.color.includes('yellow') ? 'border-yellow-200' : 
                                                          'border-blue-200'}`}>
                  <CardContent className="p-3 text-center">
                    <config.icon className="h-6 w-6 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-xs text-gray-600">{config.label}</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Student Attendance List */}
          <div className="space-y-3">
            <h3 className="font-medium">生徒別出席状況</h3>
            {attendance.map((record) => {
              const statusConfig = attendanceStatusMap[record.status]
              return (
                <Card key={record.studentId} className={`border-l-4 ${statusConfig.color}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <statusConfig.icon className="h-5 w-5" />
                        <span className="font-medium">{record.studentName}</span>
                        <Badge className={statusConfig.badgeColor} variant="secondary">
                          {statusConfig.label}
                        </Badge>
                      </div>
                      {record.status === 'late' && record.arrivalTime && (
                        <span className="text-sm text-gray-500">
                          到着: {record.arrivalTime.toLocaleTimeString('ja-JP', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      )}
                    </div>

                    <div className="flex space-x-2 mb-3">
                      {Object.entries(attendanceStatusMap).map(([status, config]) => (
                        <Button
                          key={status}
                          variant={record.status === status ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateStudentAttendance(record.studentId, status as AttendanceRecord['status'])}
                          className={record.status === status ? statusConfig.badgeColor : ''}
                        >
                          <config.icon className="h-4 w-4 mr-1" />
                          {config.label}
                        </Button>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`notes-${record.studentId}`} className="text-sm">
                        備考
                      </Label>
                      <Textarea
                        id={`notes-${record.studentId}`}
                        value={record.notes}
                        onChange={(e) => updateStudentAttendance(record.studentId, record.status, e.target.value)}
                        placeholder="追加の情報や理由を記入..."
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Quick Actions */}
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setAttendance(prev => prev.map(record => ({ ...record, status: 'present' as const })))
              }}
            >
              全員出席にする
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setAttendance(prev => prev.map(record => ({ ...record, status: 'absent' as const })))
              }}
            >
              全員欠席にする
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setAttendance(prev => prev.map(record => ({ 
                  ...record, 
                  status: 'present' as const, 
                  notes: '' 
                })))
              }}
            >
              リセット
            </Button>
          </div>

          {/* Save Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={saveAttendance}>
              <UserCheck className="h-4 w-4 mr-2" />
              保存
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Mini attendance display for class cards
export function AttendanceBadge({ 
  attendance,
  totalStudents 
}: { 
  attendance?: Array<{studentId: string, status: string}>
  totalStudents: number 
}) {
  if (!attendance || attendance.length === 0) {
    return (
      <Badge variant="outline" className="text-xs">
        未確認
      </Badge>
    )
  }

  const presentCount = attendance.filter(a => a.status === 'present').length
  const attendanceRate = Math.round((presentCount / totalStudents) * 100)

  return (
    <Badge 
      className={`text-xs ${
        attendanceRate >= 80 ? 'bg-green-500' : 
        attendanceRate >= 60 ? 'bg-yellow-500' : 
        'bg-red-500'
      }`}
      variant="secondary"
    >
      {presentCount}/{totalStudents} ({attendanceRate}%)
    </Badge>
  )
}