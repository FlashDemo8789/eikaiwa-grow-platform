"use client"

import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Edit, Check, X, Clock, AlertTriangle } from "lucide-react"
import { formatDate, formatCurrency, getInitials } from "@/lib/utils"

// Mock data - in real app this would come from API
type AttendanceRecord = {
  id: string
  studentId: string
  studentName: string
  courseName: string
  lessonDate: Date
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"
  notes?: string
  teacher: string
  duration: number
}

const mockAttendance: AttendanceRecord[] = [
  {
    id: "1",
    studentId: "ST001",
    studentName: "田中太郎",
    courseName: "Intermediate Conversation",
    lessonDate: new Date("2024-01-15T10:00:00"),
    status: "PRESENT",
    teacher: "Smith Sensei",
    duration: 60,
  },
  {
    id: "2",
    studentId: "ST002",
    studentName: "山田花子",
    courseName: "Beginner English A",
    lessonDate: new Date("2024-01-15T14:00:00"),
    status: "ABSENT",
    notes: "Called in sick",
    teacher: "Johnson Sensei",
    duration: 60,
  },
  {
    id: "3",
    studentId: "ST003",
    studentName: "佐藤次郎",
    courseName: "Advanced Business English",
    lessonDate: new Date("2024-01-16T09:00:00"),
    status: "LATE",
    notes: "15 minutes late",
    teacher: "Brown Sensei",
    duration: 90,
  },
  {
    id: "4",
    studentId: "ST004",
    studentName: "鈴木美咲",
    courseName: "Kids English Fun",
    lessonDate: new Date("2024-01-16T16:00:00"),
    status: "EXCUSED",
    notes: "Family emergency",
    teacher: "Davis Sensei",
    duration: 45,
  },
  {
    id: "5",
    studentId: "ST005",
    studentName: "高橋健一",
    courseName: "Intermediate Conversation",
    lessonDate: new Date("2024-01-17T10:00:00"),
    status: "PRESENT",
    teacher: "Smith Sensei",
    duration: 60,
  },
]

function getStatusIcon(status: string) {
  switch (status) {
    case "PRESENT":
      return <Check className="h-4 w-4 text-green-600" />
    case "ABSENT":
      return <X className="h-4 w-4 text-red-600" />
    case "LATE":
      return <Clock className="h-4 w-4 text-yellow-600" />
    case "EXCUSED":
      return <AlertTriangle className="h-4 w-4 text-blue-600" />
    default:
      return null
  }
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "PRESENT":
      return "success"
    case "ABSENT":
      return "destructive"
    case "LATE":
      return "warning"
    case "EXCUSED":
      return "secondary"
    default:
      return "outline"
  }
}

const columns: ColumnDef<AttendanceRecord>[] = [
  {
    accessorKey: "studentName",
    header: "Student",
    cell: ({ row }) => {
      const record = row.original
      return (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {getInitials(record.studentName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{record.studentName}</div>
            <div className="text-xs text-muted-foreground font-mono">
              {record.studentId}
            </div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "courseName",
    header: "Course",
    cell: ({ row }) => {
      const courseName = row.getValue("courseName") as string
      return <div className="font-medium">{courseName}</div>
    },
  },
  {
    accessorKey: "lessonDate",
    header: "Date & Time",
    cell: ({ row }) => {
      const date = row.getValue("lessonDate") as Date
      return (
        <div>
          <div className="font-medium">{formatDate(date)}</div>
          <div className="text-xs text-muted-foreground">
            {formatDate(date, "time")}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <div className="flex items-center space-x-2">
          {getStatusIcon(status)}
          <Badge variant={getStatusBadgeVariant(status) as any}>
            {status.toLowerCase()}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "teacher",
    header: "Teacher",
    cell: ({ row }) => {
      const teacher = row.getValue("teacher") as string
      return <div className="text-sm">{teacher}</div>
    },
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => {
      const duration = row.getValue("duration") as number
      return <div className="text-sm">{duration} min</div>
    },
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => {
      const notes = row.original.notes
      return (
        <div className="text-sm text-muted-foreground max-w-32 truncate">
          {notes || "-"}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      )
    },
  },
]

export function AttendanceTable() {
  const [attendance] = useState<AttendanceRecord[]>(mockAttendance)

  return (
    <DataTable
      columns={columns}
      data={attendance}
      searchKey="studentName"
      searchPlaceholder="Search students..."
    />
  )
}