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

// GET /api/courses/[courseId] - Get a specific course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params
    const course = mockCourses.find(c => c.id === courseId)

    if (!course) {
      return ApiResponseBuilder.error('Course not found', 404)
    }

    return ApiResponseBuilder.success(course)
  } catch (error) {
    console.error('Error fetching course:', error)
    return ApiResponseBuilder.error('Failed to fetch course', 500)
  }
}

// PUT /api/courses/[courseId] - Update a specific course
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params
    const body = await request.json()
    
    const courseIndex = mockCourses.findIndex(c => c.id === courseId)
    
    if (courseIndex === -1) {
      return ApiResponseBuilder.error('Course not found', 404)
    }

    // Validate required fields if they're being updated
    const requiredFields = ['nameEn', 'level', 'type', 'capacity', 'price', 'duration', 'lessonsPerWeek']
    const missingFields = requiredFields.filter(field => 
      body[field] !== undefined && !body[field]
    )
    
    if (missingFields.length > 0) {
      return ApiResponseBuilder.error(`Invalid fields: ${missingFields.join(', ')}`, 400)
    }

    // Update course
    const updatedCourse = {
      ...mockCourses[courseIndex],
      ...body,
      id: courseId, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    }

    // Convert numeric fields
    if (body.capacity) updatedCourse.capacity = parseInt(body.capacity)
    if (body.price) updatedCourse.price = parseInt(body.price)
    if (body.duration) updatedCourse.duration = parseInt(body.duration)
    if (body.lessonsPerWeek) updatedCourse.lessonsPerWeek = parseInt(body.lessonsPerWeek)

    mockCourses[courseIndex] = updatedCourse

    return ApiResponseBuilder.success(updatedCourse)
  } catch (error) {
    console.error('Error updating course:', error)
    return ApiResponseBuilder.error('Failed to update course', 500)
  }
}

// DELETE /api/courses/[courseId] - Delete a specific course
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params
    const courseIndex = mockCourses.findIndex(c => c.id === courseId)
    
    if (courseIndex === -1) {
      return ApiResponseBuilder.error('Course not found', 404)
    }

    const course = mockCourses[courseIndex]

    // Check if course has enrolled students
    if (course.enrolled > 0) {
      return ApiResponseBuilder.error(
        'Cannot delete course with enrolled students. Please transfer students first.',
        400
      )
    }

    // Remove course from array
    mockCourses.splice(courseIndex, 1)

    return ApiResponseBuilder.success({ 
      message: 'Course deleted successfully',
      deletedCourse: course 
    })
  } catch (error) {
    console.error('Error deleting course:', error)
    return ApiResponseBuilder.error('Failed to delete course', 500)
  }
}