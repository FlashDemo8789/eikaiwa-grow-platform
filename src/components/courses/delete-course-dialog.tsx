"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  AlertTriangle, 
  Users, 
  DollarSign,
  Calendar,
  BookOpen
} from "lucide-react"
import { Course } from "./courses-table"

interface DeleteCourseDialogProps {
  children: React.ReactNode
  course: Course
  onDelete: (courseId: string) => void
}

export function DeleteCourseDialog({ children, course, onDelete }: DeleteCourseDialogProps) {
  const [open, setOpen] = useState(false)
  const [confirmationText, setConfirmationText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  const expectedText = course.nameEn
  const canDelete = confirmationText === expectedText

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount)
  }

  const handleDelete = async () => {
    if (!canDelete) return

    setIsDeleting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onDelete(course.id)
      setOpen(false)
      setConfirmationText("")
    } catch (error) {
      console.error("Error deleting course:", error)
      alert("Failed to delete course. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setConfirmationText("")
    }
    setOpen(newOpen)
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

  const hasEnrolledStudents = course.enrolled > 0
  const potentialRevenueLoss = course.price * course.enrolled

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-left">Delete Course</DialogTitle>
              <DialogDescription className="text-left">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Course Info */}
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold">{course.nameEn}</h4>
                {course.nameJa && (
                  <p className="text-sm text-muted-foreground">{course.nameJa}</p>
                )}
              </div>
              <Badge variant={getStatusColor(course.status)}>
                {course.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{course.enrolled}/{course.capacity} students</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>{formatCurrency(course.price)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{course.duration} weeks</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span>{course.level}</span>
              </div>
            </div>
          </div>

          {/* Impact Warning */}
          {hasEnrolledStudents && (
            <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
              <h5 className="font-medium text-destructive mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Impact Assessment
              </h5>
              <ul className="text-sm space-y-1 text-destructive/80">
                <li>• {course.enrolled} enrolled students will be affected</li>
                <li>• Potential revenue loss: {formatCurrency(potentialRevenueLoss)}</li>
                <li>• Students may need to be transferred to other courses</li>
                <li>• Course materials and curriculum will be permanently removed</li>
              </ul>
            </div>
          )}

          {/* Recommendations */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h5 className="font-medium text-amber-800 mb-2">Recommendations</h5>
            <ul className="text-sm space-y-1 text-amber-700">
              {hasEnrolledStudents ? (
                <>
                  <li>• Consider archiving instead of deleting</li>
                  <li>• Transfer students to similar courses first</li>
                  <li>• Process any pending refunds</li>
                </>
              ) : (
                <>
                  <li>• Consider archiving to keep records</li>
                  <li>• Export curriculum if needed for future reference</li>
                </>
              )}
            </ul>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-2">
            <Label htmlFor="confirmation">
              To confirm deletion, type the course name: <strong>{expectedText}</strong>
            </Label>
            <Input
              id="confirmation"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Type the course name here"
              className={confirmationText && !canDelete ? "border-destructive" : ""}
            />
            {confirmationText && !canDelete && (
              <p className="text-sm text-destructive">Course name doesn't match</p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={!canDelete || isDeleting}
          >
            {isDeleting ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Deleting...
              </span>
            ) : (
              "Delete Course"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}