import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const createStudentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  level: z.enum(["BEGINNER", "ELEMENTARY", "PRE_INTERMEDIATE", "INTERMEDIATE", "UPPER_INTERMEDIATE", "ADVANCED", "PROFICIENCY"]),
  notes: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const level = searchParams.get("level") || ""
    const status = searchParams.get("status") || ""

    // In a real app, this would query the database
    // For now, return mock data
    const mockStudents = [
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
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Add more mock data as needed
    ]

    // Apply filters and pagination
    let filteredStudents = mockStudents

    if (search) {
      filteredStudents = filteredStudents.filter(student =>
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        student.studentId.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (level) {
      filteredStudents = filteredStudents.filter(student => student.level === level)
    }

    if (status) {
      filteredStudents = filteredStudents.filter(student => student.status === status)
    }

    const total = filteredStudents.length
    const students = filteredStudents.slice((page - 1) * limit, page * limit)

    return NextResponse.json({
      students,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createStudentSchema.parse(body)

    // In a real app, this would save to database
    console.log("Creating student:", validatedData)

    // Generate a mock student ID
    const studentId = `ST${Date.now().toString().slice(-6)}`
    
    const newStudent = {
      id: Date.now().toString(),
      studentId,
      ...validatedData,
      status: "ACTIVE",
      joinedAt: new Date(),
      attendanceRate: 0,
      avatar: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return NextResponse.json(newStudent, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating student:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}