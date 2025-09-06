import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { DashboardMetrics } from "@/components/dashboard/dashboard-metrics"
import { AttendanceChart } from "@/components/dashboard/attendance-chart"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { RecentActivities } from "@/components/dashboard/recent-activities"
import { UpcomingLessons } from "@/components/dashboard/upcoming-lessons"
import { StudentPerformance } from "@/components/dashboard/student-performance"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening at your school today.
        </p>
      </div>

      {/* Key Metrics */}
      <Suspense fallback={<LoadingSpinner size="lg" />}>
        <DashboardMetrics />
      </Suspense>

      {/* Charts and Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={
          <Card>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64">
              <LoadingSpinner size="md" />
            </CardContent>
          </Card>
        }>
          <AttendanceChart />
        </Suspense>

        <Suspense fallback={
          <Card>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64">
              <LoadingSpinner size="md" />
            </CardContent>
          </Card>
        }>
          <RevenueChart />
        </Suspense>
      </div>

      {/* Activity Feed and Upcoming */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Suspense fallback={
            <Card>
              <CardHeader>
                <CardTitle>Loading Activities...</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-64">
                <LoadingSpinner size="md" />
              </CardContent>
            </Card>
          }>
            <RecentActivities />
          </Suspense>
        </div>

        <div className="space-y-6">
          <Suspense fallback={
            <Card>
              <CardHeader>
                <CardTitle>Loading...</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-32">
                <LoadingSpinner size="sm" />
              </CardContent>
            </Card>
          }>
            <UpcomingLessons />
          </Suspense>

          <Suspense fallback={
            <Card>
              <CardHeader>
                <CardTitle>Loading...</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-32">
                <LoadingSpinner size="sm" />
              </CardContent>
            </Card>
          }>
            <StudentPerformance />
          </Suspense>
        </div>
      </div>
    </div>
  )
}