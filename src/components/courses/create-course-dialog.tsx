"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Course, CourseLevel, CourseStatus, CourseType } from "./courses-table"
import { CalendarDays, DollarSign, Users, BookOpen, Plus, X } from "lucide-react"

interface CreateCourseDialogProps {
  children: React.ReactNode
  onSave?: (course: Course) => void
}

export function CreateCourseDialog({ children, onSave }: CreateCourseDialogProps) {
  const [open, setOpen] = useState(false)
  const [currentTab, setCurrentTab] = useState("basic")
  const [materials, setMaterials] = useState<string[]>([])
  const [newMaterial, setNewMaterial] = useState("")
  
  const [formData, setFormData] = useState({
    nameEn: "",
    nameJa: "",
    level: "" as CourseLevel,
    type: "" as CourseType,
    status: "Draft" as CourseStatus,
    capacity: "",
    price: "",
    duration: "",
    lessonsPerWeek: "",
    description: "",
    instructor: "",
    startDate: "",
    endDate: ""
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addMaterial = () => {
    if (newMaterial.trim() && !materials.includes(newMaterial.trim())) {
      setMaterials([...materials, newMaterial.trim()])
      setNewMaterial("")
    }
  }

  const removeMaterial = (material: string) => {
    setMaterials(materials.filter(m => m !== material))
  }

  const handleSubmit = () => {
    // Validate required fields
    const requiredFields = ['nameEn', 'level', 'type', 'capacity', 'price', 'duration', 'lessonsPerWeek']
    const missingFields = requiredFields.filter(field => !formData[field])
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`)
      return
    }

    const newCourse: Course = {
      id: Math.random().toString(36).substr(2, 9),
      nameEn: formData.nameEn,
      nameJa: formData.nameJa || formData.nameEn,
      level: formData.level,
      type: formData.type,
      status: formData.status,
      capacity: parseInt(formData.capacity),
      enrolled: 0,
      price: parseInt(formData.price),
      duration: parseInt(formData.duration),
      lessonsPerWeek: parseInt(formData.lessonsPerWeek),
      materials: materials,
      description: formData.description,
      instructor: formData.instructor,
      startDate: formData.startDate,
      endDate: formData.endDate,
      createdAt: new Date().toISOString().split('T')[0]
    }

    onSave?.(newCourse)
    
    // Reset form
    setFormData({
      nameEn: "",
      nameJa: "",
      level: "" as CourseLevel,
      type: "" as CourseType,
      status: "Draft" as CourseStatus,
      capacity: "",
      price: "",
      duration: "",
      lessonsPerWeek: "",
      description: "",
      instructor: "",
      startDate: "",
      endDate: ""
    })
    setMaterials([])
    setCurrentTab("basic")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>
            Set up a new course with curriculum, pricing, and enrollment settings.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="scheduling">Schedule</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nameEn">Course Name (English) *</Label>
                <Input
                  id="nameEn"
                  placeholder="e.g., Business English Fundamentals"
                  value={formData.nameEn}
                  onChange={(e) => handleInputChange("nameEn", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nameJa">Course Name (Japanese)</Label>
                <Input
                  id="nameJa"
                  placeholder="e.g., ビジネス英語基礎"
                  value={formData.nameJa}
                  onChange={(e) => handleInputChange("nameJa", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Level *</Label>
                <Select value={formData.level} onValueChange={(value) => handleInputChange("level", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Course Type *</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Group">Group Class</SelectItem>
                    <SelectItem value="Private">Private Lesson</SelectItem>
                    <SelectItem value="Online">Online Class</SelectItem>
                    <SelectItem value="Hybrid">Hybrid (Online + In-person)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructor">Instructor</Label>
                <Input
                  id="instructor"
                  placeholder="e.g., Sarah Johnson"
                  value={formData.instructor}
                  onChange={(e) => handleInputChange("instructor", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Class Capacity *</Label>
                <Input
                  id="capacity"
                  type="number"
                  placeholder="e.g., 12"
                  value={formData.capacity}
                  onChange={(e) => handleInputChange("capacity", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Course Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the course content, objectives, and target students..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="scheduling" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (weeks) *</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="e.g., 12"
                  value={formData.duration}
                  onChange={(e) => handleInputChange("duration", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lessonsPerWeek">Lessons per Week *</Label>
                <Input
                  id="lessonsPerWeek"
                  type="number"
                  placeholder="e.g., 2"
                  value={formData.lessonsPerWeek}
                  onChange={(e) => handleInputChange("lessonsPerWeek", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                />
              </div>
            </div>

            {formData.duration && formData.lessonsPerWeek && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Schedule Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <span>Total Lessons: {parseInt(formData.duration || "0") * parseInt(formData.lessonsPerWeek || "0")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>Duration: {formData.duration} weeks</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Course Price (JPY) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="e.g., 25000"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Course Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.price && formData.duration && formData.lessonsPerWeek && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Pricing Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>Total: ¥{parseInt(formData.price || "0").toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <span>Per Week: ¥{Math.round(parseInt(formData.price || "0") / parseInt(formData.duration || "1")).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>Per Lesson: ¥{Math.round(parseInt(formData.price || "0") / (parseInt(formData.duration || "1") * parseInt(formData.lessonsPerWeek || "1"))).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="materials" className="space-y-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add course material (e.g., Textbook, Audio Files)"
                  value={newMaterial}
                  onChange={(e) => setNewMaterial(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addMaterial()}
                />
                <Button onClick={addMaterial} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {materials.length > 0 && (
                <div>
                  <Label>Course Materials</Label>
                  <div className="mt-2 space-y-2">
                    {materials.map((material, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <span>{material}</span>
                        <Button
                          onClick={() => removeMaterial(material)}
                          size="sm"
                          variant="ghost"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Create Course
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}