import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const markAttendanceSchema = z.object({
  lessonId: z.string().min(1, "Lesson ID is required"),
  studentId: z.string().min(1, "Student ID is required"),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
  notes: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")
    const course = searchParams.get("course")
    const teacher = searchParams.get("teacher")
    const status = searchParams.get("status")

    // Mock attendance data
    const mockAttendance = [
      {
        id: "1",
        studentId: "ST001",
        studentName: "田中太郎",
        courseName: "Intermediate Conversation",
        lessonDate: new Date("2024-01-15T10:00:00"),
        status: "PRESENT",
        teacher: "Smith Sensei",
        duration: 60,
        notes: null,
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
      // More mock data...
    ]

    // Apply filters
    let filteredAttendance = mockAttendance

    if (dateFrom) {
      const fromDate = new Date(dateFrom)
      filteredAttendance = filteredAttendance.filter(record => 
        record.lessonDate >= fromDate
      )
    }

    if (dateTo) {
      const toDate = new Date(dateTo)
      filteredAttendance = filteredAttendance.filter(record => 
        record.lessonDate <= toDate
      )
    }

    if (course) {
      filteredAttendance = filteredAttendance.filter(record =>
        record.courseName.toLowerCase().includes(course.toLowerCase())
      )
    }

    if (teacher) {
      filteredAttendance = filteredAttendance.filter(record =>
        record.teacher.toLowerCase().includes(teacher.toLowerCase())
      )
    }

    if (status) {
      filteredAttendance = filteredAttendance.filter(record =>
        record.status === status.toUpperCase()
      )
    }

    const total = filteredAttendance.length
    const attendance = filteredAttendance.slice((page - 1) * limit, page * limit)

    return NextResponse.json({
      attendance,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching attendance:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = markAttendanceSchema.parse(body)

    // In a real app, this would save to database
    console.log("Marking attendance:", validatedData)

    const attendanceRecord = {
      id: Date.now().toString(),
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return NextResponse.json(attendanceRecord, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: (error as any).errors },
        { status: 400 }
      )
    }

    console.error("Error marking attendance:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}