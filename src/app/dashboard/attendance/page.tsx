import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, Download, Filter } from "lucide-react"
import { AttendanceOverview } from "@/components/attendance/attendance-overview"
import { AttendanceTable } from "@/components/attendance/attendance-table"
import { AttendanceFilters } from "@/components/attendance/attendance-filters"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function AttendancePage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground">
            Track student attendance across all classes and courses.
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            Mark Attendance
          </Button>
        </div>
      </div>

      {/* Filters */}
      <AttendanceFilters />

      {/* Overview Stats */}
      <Suspense fallback={
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner size="md" />
        </div>
      }>
        <AttendanceOverview />
      </Suspense>

      {/* Attendance Table */}
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      }>
        <AttendanceTable />
      </Suspense>
    </div>
  )
}