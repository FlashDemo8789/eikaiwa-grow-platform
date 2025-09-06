"use client"

import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, Edit, Trash, Eye } from "lucide-react"
import { formatDate, getInitials } from "@/lib/utils"

// Mock data - in real app this would come from API
type Student = {
  id: string
  studentId: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  level: string
  status: "ACTIVE" | "INACTIVE" | "GRADUATED" | "DROPPED_OUT"
  joinedAt: Date
  attendanceRate: number
  avatar?: string
}

const mockStudents: Student[] = [
  {
    id: "1",
    studentId: "ST001",
    firstName: "田中",
    lastName: "太郎",
    email: "tanaka@example.com",
    phone: "090-1234-5678",
    level: "INTERMEDIATE",
    status: "ACTIVE",
    joinedAt: new Date("2024-01-15"),
    attendanceRate: 95,
  },
  {
    id: "2",
    studentId: "ST002",
    firstName: "山田",
    lastName: "花子",
    email: "yamada@example.com",
    phone: "080-9876-5432",
    level: "BEGINNER",
    status: "ACTIVE",
    joinedAt: new Date("2024-02-20"),
    attendanceRate: 88,
  },
  {
    id: "3",
    studentId: "ST003",
    firstName: "佐藤",
    lastName: "次郎",
    email: "sato@example.com",
    phone: "090-5555-1234",
    level: "ADVANCED",
    status: "ACTIVE",
    joinedAt: new Date("2023-11-10"),
    attendanceRate: 92,
  },
  {
    id: "4",
    studentId: "ST004",
    firstName: "鈴木",
    lastName: "美咲",
    email: "suzuki@example.com",
    phone: "080-7777-9999",
    level: "UPPER_INTERMEDIATE",
    status: "GRADUATED",
    joinedAt: new Date("2023-09-05"),
    attendanceRate: 96,
  },
  {
    id: "5",
    studentId: "ST005",
    firstName: "高橋",
    lastName: "健一",
    email: "takahashi@example.com",
    phone: "090-3333-7777",
    level: "ELEMENTARY",
    status: "INACTIVE",
    joinedAt: new Date("2024-03-01"),
    attendanceRate: 65,
  },
]

function getLevelDisplay(level: string) {
  const levelMap = {
    BEGINNER: "Beginner",
    ELEMENTARY: "Elementary",
    PRE_INTERMEDIATE: "Pre-Intermediate",
    INTERMEDIATE: "Intermediate", 
    UPPER_INTERMEDIATE: "Upper-Intermediate",
    ADVANCED: "Advanced",
    PROFICIENCY: "Proficiency"
  }
  return levelMap[level as keyof typeof levelMap] || level
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "ACTIVE":
      return "success"
    case "GRADUATED":
      return "secondary"
    case "INACTIVE":
      return "outline"
    case "DROPPED_OUT":
      return "destructive"
    default:
      return "outline"
  }
}

function getAttendanceColor(rate: number) {
  if (rate >= 90) return "text-green-600"
  if (rate >= 80) return "text-yellow-600"
  return "text-red-600"
}

const columns: ColumnDef<Student>[] = [
  {
    accessorKey: "avatar",
    header: "",
    cell: ({ row }) => {
      const student = row.original
      return (
        <Avatar className="h-8 w-8">
          <AvatarImage src={student.avatar} alt={`${student.firstName} ${student.lastName}`} />
          <AvatarFallback>
            {getInitials(`${student.firstName} ${student.lastName}`)}
          </AvatarFallback>
        </Avatar>
      )
    },
  },
  {
    accessorKey: "studentId",
    header: "Student ID",
    cell: ({ row }) => {
      const studentId = row.getValue("studentId") as string
      return <div className="font-mono text-sm">{studentId}</div>
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const student = row.original
      return (
        <div>
          <div className="font-medium">
            {student.lastName} {student.firstName}
          </div>
          {student.email && (
            <div className="text-xs text-muted-foreground">{student.email}</div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "level",
    header: "Level",
    cell: ({ row }) => {
      const level = row.getValue("level") as string
      return <Badge variant="outline">{getLevelDisplay(level)}</Badge>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant={getStatusBadgeVariant(status) as any}>
          {status.toLowerCase().replace("_", " ")}
        </Badge>
      )
    },
  },
  {
    accessorKey: "attendanceRate",
    header: "Attendance",
    cell: ({ row }) => {
      const rate = row.getValue("attendanceRate") as number
      return (
        <div className={getAttendanceColor(rate)}>
          {rate}%
        </div>
      )
    },
  },
  {
    accessorKey: "joinedAt",
    header: "Joined",
    cell: ({ row }) => {
      const date = row.getValue("joinedAt") as Date
      return <div className="text-sm">{formatDate(date)}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const student = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit Student
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash className="mr-2 h-4 w-4" />
              Delete Student
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function StudentsTable() {
  const [students] = useState<Student[]>(mockStudents)

  return (
    <DataTable
      columns={columns}
      data={students}
      searchKey="name"
      searchPlaceholder="Search students..."
    />
  )
}