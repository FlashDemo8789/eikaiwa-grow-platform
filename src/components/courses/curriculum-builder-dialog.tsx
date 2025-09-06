"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { 
  Plus, 
  BookOpen, 
  Clock, 
  Target, 
  FileText, 
  Users,
  Trash2,
  Edit,
  GripVertical,
  PlayCircle,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { Course } from "./courses-table"

interface Lesson {
  id: string
  title: string
  description: string
  duration: number // minutes
  objectives: string[]
  activities: Activity[]
  materials: string[]
  homework: string
  assessment: string
}

interface Activity {
  id: string
  name: string
  type: "Warm-up" | "Presentation" | "Practice" | "Production" | "Wrap-up"
  duration: number // minutes
  description: string
}

interface CurriculumBuilderDialogProps {
  children: React.ReactNode
  course: Course
}

export function CurriculumBuilderDialog({ children, course }: CurriculumBuilderDialogProps) {
  const [open, setOpen] = useState(false)
  const [currentTab, setCurrentTab] = useState("overview")
  
  // Mock curriculum data
  const [lessons, setLessons] = useState<Lesson[]>([
    {
      id: "1",
      title: "Introduction to Business Communication",
      description: "Basic business English greetings and introductions",
      duration: 90,
      objectives: [
        "Greet colleagues and clients professionally",
        "Make appropriate self-introductions",
        "Exchange business cards properly"
      ],
      activities: [
        {
          id: "1-1",
          name: "Ice Breaker",
          type: "Warm-up",
          duration: 10,
          description: "Students introduce themselves using business English"
        },
        {
          id: "1-2", 
          name: "Business Greetings Presentation",
          type: "Presentation",
          duration: 20,
          description: "Formal vs informal greetings in business contexts"
        }
      ],
      materials: ["Business Cards", "Greeting Phrases Handout"],
      homework: "Practice introducing yourself to 3 different people",
      assessment: "Role-play business meeting introductions"
    },
    {
      id: "2",
      title: "Email Communication Basics",
      description: "Writing professional emails and understanding email etiquette",
      duration: 90,
      objectives: [
        "Write clear and concise business emails",
        "Use appropriate salutations and closings",
        "Understand email etiquette"
      ],
      activities: [
        {
          id: "2-1",
          name: "Email Structure Review",
          type: "Presentation",
          duration: 15,
          description: "Parts of a professional email"
        }
      ],
      materials: ["Email Templates", "Sample Emails"],
      homework: "Write 2 professional emails using provided scenarios",
      assessment: "Email writing assignment"
    }
  ])

  const [newLesson, setNewLesson] = useState<Partial<Lesson>>({
    title: "",
    description: "",
    duration: 90,
    objectives: [],
    activities: [],
    materials: [],
    homework: "",
    assessment: ""
  })

  const [editingLesson, setEditingLesson] = useState<string | null>(null)
  const [newObjective, setNewObjective] = useState("")
  const [newMaterial, setNewMaterial] = useState("")

  const totalLessons = course.duration * course.lessonsPerWeek
  const currentLessonsCount = lessons.length
  const completionRate = (currentLessonsCount / totalLessons) * 100

  const addObjective = () => {
    if (newObjective.trim()) {
      setNewLesson(prev => ({
        ...prev,
        objectives: [...(prev.objectives || []), newObjective.trim()]
      }))
      setNewObjective("")
    }
  }

  const removeObjective = (index: number) => {
    setNewLesson(prev => ({
      ...prev,
      objectives: (prev.objectives || []).filter((_, i) => i !== index)
    }))
  }

  const addMaterial = () => {
    if (newMaterial.trim()) {
      setNewLesson(prev => ({
        ...prev,
        materials: [...(prev.materials || []), newMaterial.trim()]
      }))
      setNewMaterial("")
    }
  }

  const removeMaterial = (index: number) => {
    setNewLesson(prev => ({
      ...prev,
      materials: (prev.materials || []).filter((_, i) => i !== index)
    }))
  }

  const addLesson = () => {
    if (!newLesson.title?.trim()) {
      alert("Please provide a lesson title")
      return
    }

    const lesson: Lesson = {
      id: (lessons.length + 1).toString(),
      title: newLesson.title,
      description: newLesson.description || "",
      duration: newLesson.duration || 90,
      objectives: newLesson.objectives || [],
      activities: newLesson.activities || [],
      materials: newLesson.materials || [],
      homework: newLesson.homework || "",
      assessment: newLesson.assessment || ""
    }

    setLessons([...lessons, lesson])
    
    // Reset form
    setNewLesson({
      title: "",
      description: "",
      duration: 90,
      objectives: [],
      activities: [],
      materials: [],
      homework: "",
      assessment: ""
    })
  }

  const deleteLesson = (lessonId: string) => {
    setLessons(lessons.filter(l => l.id !== lessonId))
  }

  const getActivityTypeColor = (type: Activity["type"]) => {
    const colors = {
      "Warm-up": "bg-green-100 text-green-800",
      "Presentation": "bg-blue-100 text-blue-800", 
      "Practice": "bg-yellow-100 text-yellow-800",
      "Production": "bg-purple-100 text-purple-800",
      "Wrap-up": "bg-gray-100 text-gray-800"
    }
    return colors[type]
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Curriculum Builder - {course.nameEn}
          </DialogTitle>
          <DialogDescription>
            Create and manage lesson plans, activities, and assessments for your course.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="add-lesson">Add Lesson</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Curriculum Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Lessons</span>
                  </div>
                  <div className="text-2xl font-bold">{currentLessonsCount}/{totalLessons}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Completion</span>
                  </div>
                  <div className="text-2xl font-bold">{Math.round(completionRate)}%</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Total Hours</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {Math.round(lessons.reduce((total, lesson) => total + lesson.duration, 0) / 60)}h
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Objectives</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {lessons.reduce((total, lesson) => total + lesson.objectives.length, 0)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Curriculum Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Curriculum Progress</CardTitle>
                <CardDescription>
                  Track your course development progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Lessons Created</span>
                      <span>{currentLessonsCount} of {totalLessons}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all" 
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>
                  
                  {completionRate < 100 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="h-4 w-4" />
                      <span>{totalLessons - currentLessonsCount} more lessons needed to complete the curriculum</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lessons" className="space-y-6">
            {lessons.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No lessons created yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start building your curriculum by adding your first lesson.
                  </p>
                  <Button onClick={() => setCurrentTab("add-lesson")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Lesson
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Accordion type="single" collapsible className="space-y-4">
                {lessons.map((lesson, index) => (
                  <AccordionItem key={lesson.id} value={lesson.id} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Lesson {index + 1}: {lesson.title}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{lesson.duration}min</span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                      <div className="space-y-4">
                        <p className="text-muted-foreground">{lesson.description}</p>
                        
                        {/* Learning Objectives */}
                        {lesson.objectives.length > 0 && (
                          <div>
                            <h5 className="font-medium mb-2 flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              Learning Objectives
                            </h5>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              {lesson.objectives.map((objective, i) => (
                                <li key={i}>{objective}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Activities */}
                        {lesson.activities.length > 0 && (
                          <div>
                            <h5 className="font-medium mb-2 flex items-center gap-2">
                              <PlayCircle className="h-4 w-4" />
                              Activities
                            </h5>
                            <div className="space-y-2">
                              {lesson.activities.map((activity) => (
                                <div key={activity.id} className="flex items-center justify-between p-2 border rounded">
                                  <div className="flex items-center gap-3">
                                    <Badge className={getActivityTypeColor(activity.type)}>
                                      {activity.type}
                                    </Badge>
                                    <div>
                                      <div className="font-medium text-sm">{activity.name}</div>
                                      <div className="text-xs text-muted-foreground">{activity.description}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>{activity.duration}min</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Materials */}
                        {lesson.materials.length > 0 && (
                          <div>
                            <h5 className="font-medium mb-2 flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Materials
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {lesson.materials.map((material, i) => (
                                <Badge key={i} variant="outline">{material}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-between pt-4 border-t">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </div>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => deleteLesson(lesson.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </TabsContent>

          <TabsContent value="add-lesson" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Lesson</CardTitle>
                <CardDescription>
                  Add a new lesson to your course curriculum
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lesson-title">Lesson Title *</Label>
                    <Input
                      id="lesson-title"
                      placeholder="e.g., Introduction to Business Communication"
                      value={newLesson.title || ""}
                      onChange={(e) => setNewLesson(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lesson-duration">Duration (minutes)</Label>
                    <Input
                      id="lesson-duration"
                      type="number"
                      placeholder="90"
                      value={newLesson.duration || ""}
                      onChange={(e) => setNewLesson(prev => ({ ...prev, duration: parseInt(e.target.value) || 90 }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lesson-description">Description</Label>
                  <Textarea
                    id="lesson-description"
                    placeholder="Describe what students will learn in this lesson..."
                    value={newLesson.description || ""}
                    onChange={(e) => setNewLesson(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                {/* Learning Objectives */}
                <div className="space-y-2">
                  <Label>Learning Objectives</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add learning objective..."
                      value={newObjective}
                      onChange={(e) => setNewObjective(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addObjective()}
                    />
                    <Button onClick={addObjective} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {(newLesson.objectives || []).length > 0 && (
                    <div className="space-y-2">
                      {(newLesson.objectives || []).map((objective, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{objective}</span>
                          <Button
                            onClick={() => removeObjective(index)}
                            size="sm"
                            variant="ghost"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Materials */}
                <div className="space-y-2">
                  <Label>Required Materials</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add material or resource..."
                      value={newMaterial}
                      onChange={(e) => setNewMaterial(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addMaterial()}
                    />
                    <Button onClick={addMaterial} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {(newLesson.materials || []).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {(newLesson.materials || []).map((material, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {material}
                          <Button
                            onClick={() => removeMaterial(index)}
                            size="sm"
                            variant="ghost"
                            className="h-auto p-0 ml-1"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="homework">Homework Assignment</Label>
                    <Textarea
                      id="homework"
                      placeholder="Describe homework or follow-up activities..."
                      value={newLesson.homework || ""}
                      onChange={(e) => setNewLesson(prev => ({ ...prev, homework: e.target.value }))}
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="assessment">Assessment Method</Label>
                    <Textarea
                      id="assessment"
                      placeholder="How will you assess student understanding?"
                      value={newLesson.assessment || ""}
                      onChange={(e) => setNewLesson(prev => ({ ...prev, assessment: e.target.value }))}
                      rows={2}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button onClick={addLesson}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Lesson
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}