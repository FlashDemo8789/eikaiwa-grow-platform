import { NextRequest, NextResponse } from "next/server"
import { ApiResponseBuilderBuilder, type ApiResponseBuilder } from "@/lib/api-response"

// Mock database - in a real app, this would be replaced with actual database operations
let mockCourses = [
  {
    id: "1",
    nameEn: "Business English Fundamentals",
    nameJa: "ビジネス英語基礎",
    level: "Intermediate",
    type: "Group",
    status: "Active",
    capacity: 12,
    enrolled: 10,
    price: 25000,
    duration: 12,
    lessonsPerWeek: 2,
    materials: ["Business English Textbook", "Audio Materials", "Workbook"],
    description: "Essential business communication skills for professionals",
    instructor: "Sarah Johnson",
    startDate: "2024-04-01",
    endDate: "2024-06-24",
    createdAt: "2024-03-15",
    updatedAt: "2024-03-15"
  },
  {
    id: "2",
    nameEn: "Conversational English for Beginners",
    nameJa: "初心者向け英会話",
    level: "Beginner",
    type: "Group",
    status: "Active",
    capacity: 8,
    enrolled: 8,
    price: 18000,
    duration: 16,
    lessonsPerWeek: 1,
    materials: ["Starter Textbook", "Flash Cards"],
    description: "Basic conversation skills for everyday situations",
    instructor: "Mike Chen",
    startDate: "2024-04-08",
    endDate: "2024-07-29",
    createdAt: "2024-03-20",
    updatedAt: "2024-03-20"
  }
]

// GET /api/courses - List all courses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const level = searchParams.get('level')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    let filteredCourses = [...mockCourses]

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase()
      filteredCourses = filteredCourses.filter(course => 
        course.nameEn.toLowerCase().includes(searchLower) ||
        course.nameJa.includes(search) ||
        course.instructor.toLowerCase().includes(searchLower)
      )
    }

    if (level && level !== 'All') {
      filteredCourses = filteredCourses.filter(course => course.level === level)
    }

    if (status && status !== 'All') {
      filteredCourses = filteredCourses.filter(course => course.status === status)
    }

    if (type && type !== 'All') {
      filteredCourses = filteredCourses.filter(course => course.type === type)
    }

    // Pagination
    const total = filteredCourses.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedCourses = filteredCourses.slice(startIndex, endIndex)

    return ApiResponseBuilder.success({
      courses: paginatedCourses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: endIndex < total,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return ApiResponseBuilder.error('Failed to fetch courses', 500)
  }
}

// POST /api/courses - Create a new course
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['nameEn', 'level', 'type', 'capacity', 'price', 'duration', 'lessonsPerWeek']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      return ApiResponseBuilder.error(`Missing required fields: ${missingFields.join(', ')}`, 400)
    }

    // Create new course
    const newCourse = {
      id: (mockCourses.length + 1).toString(),
      nameEn: body.nameEn,
      nameJa: body.nameJa || body.nameEn,
      level: body.level,
      type: body.type,
      status: body.status || 'Draft',
      capacity: parseInt(body.capacity),
      enrolled: 0,
      price: parseInt(body.price),
      duration: parseInt(body.duration),
      lessonsPerWeek: parseInt(body.lessonsPerWeek),
      materials: body.materials || [],
      description: body.description || '',
      instructor: body.instructor || '',
      startDate: body.startDate || '',
      endDate: body.endDate || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    mockCourses.push(newCourse)

    return ApiResponseBuilder.success(newCourse, 201)
  } catch (error) {
    console.error('Error creating course:', error)
    return ApiResponseBuilder.error('Failed to create course', 500)
  }
}