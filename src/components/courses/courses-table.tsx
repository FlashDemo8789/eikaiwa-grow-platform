"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Eye, 
  Trash2, 
  Users, 
  Calendar,
  DollarSign,
  BookOpen
} from "lucide-react"

import { EditCourseDialog } from "./edit-course-dialog"
import { ViewCourseDialog } from "./view-course-dialog"
import { DeleteCourseDialog } from "./delete-course-dialog"
import { CurriculumBuilderDialog } from "./curriculum-builder-dialog"

// Course type definitions
export type CourseLevel = "Beginner" | "Intermediate" | "Advanced"
export type CourseStatus = "Active" | "Draft" | "Archived"
export type CourseType = "Group" | "Private" | "Online" | "Hybrid"

export interface Course {
  id: string
  nameEn: string
  nameJa: string
  level: CourseLevel
  type: CourseType
  status: CourseStatus
  capacity: number
  enrolled: number
  price: number
  duration: number // weeks
  lessonsPerWeek: number
  materials: string[]
  description: string
  instructor: string
  startDate: string
  endDate: string
  createdAt: string
}

// Mock course data - in real app, this would come from an API
const mockCourses: Course[] = [
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
    createdAt: "2024-03-15"
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
    createdAt: "2024-03-20"
  },
  {
    id: "3",
    nameEn: "TOEIC Preparation Course",
    nameJa: "TOEIC対策コース",
    level: "Advanced",
    type: "Group",
    status: "Active",
    capacity: 15,
    enrolled: 12,
    price: 35000,
    duration: 10,
    lessonsPerWeek: 3,
    materials: ["TOEIC Practice Tests", "Grammar Guide", "Listening Materials"],
    description: "Intensive TOEIC test preparation and score improvement",
    instructor: "Emma Thompson",
    startDate: "2024-03-25",
    endDate: "2024-06-03",
    createdAt: "2024-03-01"
  },
  {
    id: "4",
    nameEn: "Kids English Adventure",
    nameJa: "子ども英語冒険",
    level: "Beginner",
    type: "Group",
    status: "Draft",
    capacity: 10,
    enrolled: 0,
    price: 15000,
    duration: 20,
    lessonsPerWeek: 1,
    materials: ["Picture Books", "Activity Sheets", "Songs & Games"],
    description: "Fun and engaging English learning for children ages 6-10",
    instructor: "Lisa Park",
    startDate: "2024-05-01",
    endDate: "2024-09-16",
    createdAt: "2024-04-10"
  }
]

export function CoursesTable() {
  const [courses, setCourses] = useState<Course[]>(mockCourses)
  const [searchQuery, setSearchQuery] = useState("")
  const [levelFilter, setLevelFilter] = useState<CourseLevel | "All">("All")
  const [statusFilter, setStatusFilter] = useState<CourseStatus | "All">("All")
  const [typeFilter, setTypeFilter] = useState<CourseType | "All">("All")

  // Filtered courses based on search and filters
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = 
        course.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.nameJa.includes(searchQuery) ||
        course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesLevel = levelFilter === "All" || course.level === levelFilter
      const matchesStatus = statusFilter === "All" || course.status === statusFilter
      const matchesType = typeFilter === "All" || course.type === typeFilter

      return matchesSearch && matchesLevel && matchesStatus && matchesType
    })
  }, [courses, searchQuery, levelFilter, statusFilter, typeFilter])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount)
  }

  const getStatusColor = (status: CourseStatus) => {
    switch (status) {
      case "Active":
        return "default"
      case "Draft":
        return "secondary"
      case "Archived":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getLevelColor = (level: CourseLevel) => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-800"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "Advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleDeleteCourse = (courseId: string) => {
    setCourses(courses.filter(course => course.id !== courseId))
  }

  const handleUpdateCourse = (updatedCourse: Course) => {
    setCourses(courses.map(course => 
      course.id === updatedCourse.id ? updatedCourse : course
    ))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            All Courses ({filteredCourses.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses, instructors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={levelFilter} onValueChange={(value) => setLevelFilter(value as CourseLevel | "All")}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Levels</SelectItem>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as CourseStatus | "All")}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as CourseType | "All")}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="Group">Group</SelectItem>
                <SelectItem value="Private">Private</SelectItem>
                <SelectItem value="Online">Online</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Courses Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Name</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Enrollment</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No courses found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{course.nameEn}</div>
                        <div className="text-sm text-muted-foreground">{course.nameJa}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getLevelColor(course.level)}>
                        {course.level}
                      </Badge>
                    </TableCell>
                    <TableCell>{course.type}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(course.status)}>
                        {course.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{course.enrolled}/{course.capacity}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(course.price)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{course.duration}w ({course.lessonsPerWeek}x/w)</span>
                      </div>
                    </TableCell>
                    <TableCell>{course.instructor}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          
                          <ViewCourseDialog course={course}>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                          </ViewCourseDialog>
                          
                          <EditCourseDialog 
                            course={course} 
                            onSave={handleUpdateCourse}
                          >
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Course
                            </DropdownMenuItem>
                          </EditCourseDialog>

                          <CurriculumBuilderDialog course={course}>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <BookOpen className="mr-2 h-4 w-4" />
                              Edit Curriculum
                            </DropdownMenuItem>
                          </CurriculumBuilderDialog>

                          <DropdownMenuSeparator />
                          
                          <DeleteCourseDialog 
                            course={course} 
                            onDelete={handleDeleteCourse}
                          >
                            <DropdownMenuItem 
                              onSelect={(e) => e.preventDefault()}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Course
                            </DropdownMenuItem>
                          </DeleteCourseDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}