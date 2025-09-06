import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { StudentsTable } from "@/components/students/students-table"
import { AddStudentDialog } from "@/components/students/add-student-dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function StudentsPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">
            Manage your student records, enrollment, and progress tracking.
          </p>
        </div>
        
        <AddStudentDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </AddStudentDialog>
      </div>

      {/* Students Table */}
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      }>
        <StudentsTable />
      </Suspense>
    </div>
  )
}