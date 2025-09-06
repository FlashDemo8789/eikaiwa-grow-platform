"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Course } from "./courses-table"
import { 
  CalendarDays, 
  DollarSign, 
  Users, 
  BookOpen, 
  User, 
  Clock,
  Calendar,
  MapPin,
  FileText,
  TrendingUp
} from "lucide-react"

interface ViewCourseDialogProps {
  children: React.ReactNode
  course: Course
}

export function ViewCourseDialog({ children, course }: ViewCourseDialogProps) {
  const [open, setOpen] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set"
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  const getStatusColor = (status: string) => {
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

  const getLevelColor = (level: string) => {
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

  const enrollmentPercentage = (course.enrolled / course.capacity) * 100

  // Mock student progress data
  const mockStudentProgress = [
    { name: "田中太郎", progress: 85, attendance: 92 },
    { name: "佐藤花子", progress: 78, attendance: 88 },
    { name: "山田次郎", progress: 91, attendance: 95 },
    { name: "鈴木美穂", progress: 73, attendance: 83 },
    { name: "高橋健太", progress: 89, attendance: 90 }
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-2xl">{course.nameEn}</DialogTitle>
              {course.nameJa && (
                <DialogDescription className="text-lg text-muted-foreground">
                  {course.nameJa}
                </DialogDescription>
              )}
            </div>
            <div className="flex gap-2">
              <Badge variant={getStatusColor(course.status)}>
                {course.status}
              </Badge>
              <Badge className={getLevelColor(course.level)}>
                {course.level}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Course Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Type: {course.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Duration: {course.duration} weeks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{course.lessonsPerWeek}x lessons/week</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Instructor: {course.instructor}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Enrollment */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Enrollment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Students Enrolled</span>
                      <span>{course.enrolled}/{course.capacity}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${enrollmentPercentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {Math.round(enrollmentPercentage)}% capacity
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Available spots:</span>
                      <span className="ml-2 font-medium">{course.capacity - course.enrolled}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-2xl font-bold">{formatCurrency(course.price)}</div>
                    <div className="text-sm text-muted-foreground">Total course fee</div>
                  </div>
                  <div className="space-y-1 pt-2 border-t text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Per week:</span>
                      <span>{formatCurrency(Math.round(course.price / course.duration))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Per lesson:</span>
                      <span>{formatCurrency(Math.round(course.price / (course.duration * course.lessonsPerWeek)))}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Schedule & Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Date:</span>
                    <span>{formatDate(course.startDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">End Date:</span>
                    <span>{formatDate(course.endDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Lessons:</span>
                    <span>{course.duration * course.lessonsPerWeek}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">
                    {course.description || "No description available."}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Materials */}
            {course.materials.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Course Materials</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {course.materials.map((material, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{material}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="curriculum" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Curriculum</CardTitle>
                <CardDescription>
                  Detailed course structure and lesson plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Curriculum builder will be displayed here</p>
                  <p className="text-sm">Create and manage lesson plans, assignments, and assessments</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enrolled Students ({course.enrolled})</CardTitle>
                <CardDescription>
                  Student progress and performance overview
                </CardDescription>
              </CardHeader>
              <CardContent>
                {course.enrolled > 0 ? (
                  <div className="space-y-4">
                    {mockStudentProgress.slice(0, course.enrolled).map((student, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-sm text-muted-foreground">Student</div>
                          </div>
                        </div>
                        <div className="flex gap-6 text-sm">
                          <div className="text-center">
                            <div className="text-muted-foreground">Progress</div>
                            <div className="font-medium">{student.progress}%</div>
                          </div>
                          <div className="text-center">
                            <div className="text-muted-foreground">Attendance</div>
                            <div className="font-medium">{student.attendance}%</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No students enrolled yet</p>
                    <p className="text-sm">Students will appear here once they enroll in the course</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Course Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Enrollment Rate:</span>
                      <span>{Math.round(enrollmentPercentage)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg. Progress:</span>
                      <span>{course.enrolled > 0 ? "82%" : "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg. Attendance:</span>
                      <span>{course.enrolled > 0 ? "89%" : "N/A"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Revenue:</span>
                      <span>{formatCurrency(course.price * course.enrolled)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Potential Revenue:</span>
                      <span>{formatCurrency(course.price * course.capacity)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Revenue per Student:</span>
                      <span>{formatCurrency(course.price)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}