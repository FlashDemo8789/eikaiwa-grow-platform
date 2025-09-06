// Schedule Types
export interface ClassSession {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  teacherId: string
  teacherName: string
  roomId: string
  roomName: string
  studentIds: string[]
  studentNames: string[]
  level: 'beginner' | 'intermediate' | 'advanced' | 'conversation'
  classType: 'group' | 'private' | 'trial' | 'makeup'
  maxStudents: number
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  color: string
  notes?: string
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    interval: number
    endDate?: Date
  }
  attendance?: Array<{
    studentId: string
    status: 'present' | 'absent' | 'late' | 'excused'
    notes?: string
    arrivalTime?: Date
  }>
}

export interface Teacher {
  id: string
  name: string
  email: string
  phone: string
  specialties: string[]
  availability: {
    [key: string]: { // day of week
      start: string
      end: string
      available: boolean
    }
  }
}

export interface Room {
  id: string
  name: string
  capacity: number
  equipment: string[]
  location: string
  available: boolean
}

export interface Student {
  id: string
  name: string
  level: string
  phone: string
  email: string
  parentName?: string
  parentEmail?: string
  parentPhone?: string
  birthDate?: Date
  enrollmentDate: Date
  isActive: boolean
}

export interface ScheduleConflict {
  type: 'teacher_double_booking' | 'room_double_booking' | 'student_double_booking' | 'capacity_exceeded'
  severity: 'high' | 'medium' | 'low'
  message: string
  affectedClasses: string[]
  suggestions?: string[]
}

export interface AttendanceRecord {
  studentId: string
  studentName: string
  status: 'present' | 'absent' | 'late' | 'excused'
  arrivalTime?: Date
  notes?: string
}

export interface ScheduleFilter {
  searchTerm: string
  level: string
  teacher: string
  room: string
  classType: string
  status: string
  dateRange: {
    start: Date
    end: Date
  }
}

export interface ScheduleView {
  mode: 'week' | 'month' | 'day'
  currentDate: Date
  showWeekends: boolean
  showHolidays: boolean
  timeSlotDuration: number // in minutes
  startHour: number
  endHour: number
}

// Drag and Drop Types
export interface DragItem {
  id: string
  type: 'class'
  classSession: ClassSession
}

export interface DropTarget {
  date: Date
  timeSlot?: {
    start: Date
    end: Date
  }
}

// API Response Types
export interface ScheduleResponse {
  classes: ClassSession[]
  teachers: Teacher[]
  rooms: Room[]
  students: Student[]
  conflicts: ScheduleConflict[]
}

export interface CreateClassRequest {
  title: string
  description?: string
  startTime: Date
  endTime: Date
  teacherId: string
  roomId: string
  studentIds: string[]
  level: ClassSession['level']
  classType: ClassSession['classType']
  maxStudents: number
  notes?: string
  recurring?: ClassSession['recurring']
}

export interface UpdateClassRequest extends Partial<CreateClassRequest> {
  id: string
}

export interface BulkScheduleAction {
  type: 'move' | 'copy' | 'delete' | 'update_status'
  classIds: string[]
  targetDate?: Date
  newStatus?: ClassSession['status']
  modifications?: Partial<ClassSession>
}

// Calendar Event Types for external integrations
export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  allDay: boolean
  description?: string
  location?: string
  attendees?: string[]
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
    interval: number
    endDate?: Date
    daysOfWeek?: number[]
  }
}

// Statistics and Analytics
export interface ScheduleStats {
  totalClasses: number
  scheduledClasses: number
  completedClasses: number
  cancelledClasses: number
  averageAttendanceRate: number
  teacherUtilization: Record<string, number>
  roomUtilization: Record<string, number>
  classTypeDistribution: Record<ClassSession['classType'], number>
  levelDistribution: Record<ClassSession['level'], number>
}