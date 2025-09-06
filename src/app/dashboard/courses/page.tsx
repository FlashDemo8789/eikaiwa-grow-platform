"use client"

import { useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Plus, BookOpen, Users, TrendingUp, DollarSign } from "lucide-react"

import { CoursesTable } from "@/components/courses/courses-table"
import { CreateCourseDialog } from "@/components/courses/create-course-dialog"
import { CourseTemplates } from "@/components/courses/course-templates"
import { CoursesOverview } from "@/components/courses/courses-overview"

export default function CoursesPage() {
  const [activeTab, setActiveTab] = useState("all-courses")

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Course Management</h1>
          <p className="text-muted-foreground">
            Manage courses, curriculum, pricing, and student enrollment for your Eikaiwa school.
          </p>
        </div>
        
        <CreateCourseDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Button>
        </CreateCourseDialog>
      </div>

      {/* Overview Cards */}
      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-center h-16">
                  <LoadingSpinner />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      }>
        <CoursesOverview />
      </Suspense>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all-courses" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            All Courses
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all-courses" className="space-y-6">
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          }>
            <CoursesTable />
          </Suspense>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          }>
            <CourseTemplates />
          </Suspense>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Performance</CardTitle>
                <CardDescription>
                  Track enrollment trends and completion rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                  Analytics charts will be displayed here
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analysis</CardTitle>
                <CardDescription>
                  Course revenue and pricing optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                  Revenue analytics will be displayed here
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}