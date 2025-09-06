import { NextRequest, NextResponse } from "next/server"
import { ApiResponse } from "@/lib/api-response"

// Mock course templates database
const mockTemplates = [
  {
    id: "1",
    name: "Business English Fundamentals",
    nameJa: "ビジネス英語基礎",
    description: "Essential business communication skills for professionals working in international environments",
    level: "Intermediate",
    type: "Group",
    duration: 12,
    lessonsPerWeek: 2,
    suggestedPrice: 25000,
    capacity: 12,
    materials: ["Business English Textbook", "Audio Materials", "Case Study Worksheets"],
    objectives: [
      "Master professional email communication",
      "Conduct effective business meetings",
      "Present ideas clearly and confidently",
      "Negotiate and close deals"
    ],
    topics: ["Email Writing", "Presentations", "Meetings", "Negotiations", "Phone Calls"],
    curriculum: [
      {
        week: 1,
        title: "Professional Introductions",
        objectives: ["Learn formal greetings", "Practice self-introductions"],
        activities: ["Role-play exercises", "Business card exchange"]
      },
      {
        week: 2,
        title: "Email Communication",
        objectives: ["Write professional emails", "Understand email etiquette"],
        activities: ["Email writing practice", "Template creation"]
      }
    ],
    isPopular: true,
    usageCount: 15,
    createdBy: "System",
    createdAt: "2024-01-15"
  },
  {
    id: "2",
    name: "TOEIC Test Preparation",
    nameJa: "TOEIC試験対策",
    description: "Intensive TOEIC preparation course focusing on test strategies and score improvement",
    level: "Advanced",
    type: "Group",
    duration: 10,
    lessonsPerWeek: 3,
    suggestedPrice: 35000,
    capacity: 15,
    materials: ["TOEIC Practice Tests", "Grammar Reference", "Listening Materials", "Vocabulary Builder"],
    objectives: [
      "Achieve target TOEIC score",
      "Master test-taking strategies",
      "Improve listening comprehension",
      "Enhance reading speed and accuracy"
    ],
    topics: ["Listening Strategies", "Reading Comprehension", "Grammar Focus", "Vocabulary Building", "Mock Tests"],
    curriculum: [
      {
        week: 1,
        title: "TOEIC Overview & Listening Part 1",
        objectives: ["Understand TOEIC format", "Master photo description strategies"],
        activities: ["Practice tests", "Strategy workshops"]
      }
    ],
    isPopular: true,
    usageCount: 12,
    createdBy: "System",
    createdAt: "2024-01-20"
  },
  {
    id: "3",
    name: "Kids English Adventure",
    nameJa: "子ども英語冒険",
    description: "Fun and engaging English learning program designed for children ages 6-12",
    level: "Beginner",
    type: "Group",
    duration: 20,
    lessonsPerWeek: 1,
    suggestedPrice: 15000,
    capacity: 8,
    materials: ["Picture Books", "Activity Worksheets", "Songs & Rhymes CD", "Craft Supplies"],
    objectives: [
      "Develop basic vocabulary",
      "Learn simple phrases and expressions",
      "Build confidence in speaking",
      "Enjoy learning through play"
    ],
    topics: ["Colors & Numbers", "Family & Friends", "Animals", "Food", "Daily Activities"],
    curriculum: [
      {
        week: 1,
        title: "Colors and Numbers",
        objectives: ["Learn basic colors", "Count 1-10"],
        activities: ["Color games", "Number songs", "Art activities"]
      }
    ],
    isPopular: false,
    usageCount: 8,
    createdBy: "System",
    createdAt: "2024-02-01"
  }
]

// GET /api/courses/templates - Get all course templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const level = searchParams.get('level')
    const type = searchParams.get('type')
    const popular = searchParams.get('popular')

    let filteredTemplates = [...mockTemplates]

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase()
      filteredTemplates = filteredTemplates.filter(template => 
        template.name.toLowerCase().includes(searchLower) ||
        template.nameJa.includes(search) ||
        template.description.toLowerCase().includes(searchLower)
      )
    }

    if (level && level !== 'All') {
      filteredTemplates = filteredTemplates.filter(template => template.level === level)
    }

    if (type && type !== 'All') {
      filteredTemplates = filteredTemplates.filter(template => template.type === type)
    }

    if (popular === 'true') {
      filteredTemplates = filteredTemplates.filter(template => template.isPopular)
    }

    return ApiResponse.success({
      templates: filteredTemplates,
      total: filteredTemplates.length
    })
  } catch (error) {
    console.error('Error fetching course templates:', error)
    return ApiResponse.error('Failed to fetch course templates', 500)
  }
}

// POST /api/courses/templates - Create a course from template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { templateId, customizations } = body

    if (!templateId) {
      return ApiResponse.error('Template ID is required', 400)
    }

    const template = mockTemplates.find(t => t.id === templateId)
    
    if (!template) {
      return ApiResponse.error('Template not found', 404)
    }

    // Create course from template with any customizations
    const newCourse = {
      id: Date.now().toString(), // Simple ID generation
      nameEn: customizations?.nameEn || template.name,
      nameJa: customizations?.nameJa || template.nameJa,
      level: customizations?.level || template.level,
      type: customizations?.type || template.type,
      status: customizations?.status || 'Draft',
      capacity: customizations?.capacity || template.capacity,
      enrolled: 0,
      price: customizations?.price || template.suggestedPrice,
      duration: customizations?.duration || template.duration,
      lessonsPerWeek: customizations?.lessonsPerWeek || template.lessonsPerWeek,
      materials: customizations?.materials || template.materials,
      description: customizations?.description || template.description,
      instructor: customizations?.instructor || '',
      startDate: customizations?.startDate || '',
      endDate: customizations?.endDate || '',
      templateId: template.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // In a real app, you would save this to the courses database
    // For now, we'll just return the created course

    // Update template usage count
    const templateIndex = mockTemplates.findIndex(t => t.id === templateId)
    if (templateIndex !== -1) {
      mockTemplates[templateIndex].usageCount += 1
    }

    return ApiResponse.success({
      message: 'Course created from template successfully',
      course: newCourse,
      template: template
    }, 201)
  } catch (error) {
    console.error('Error creating course from template:', error)
    return ApiResponse.error('Failed to create course from template', 500)
  }
}