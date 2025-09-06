"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  BookOpen, 
  Clock, 
  Users, 
  DollarSign, 
  Search,
  Filter,
  MoreHorizontal,
  Copy,
  Edit,
  Trash2,
  Star,
  Calendar,
  Target
} from "lucide-react"
import { CourseLevel, CourseType } from "./courses-table"

interface CourseTemplate {
  id: string
  name: string
  nameJa: string
  description: string
  level: CourseLevel
  type: CourseType
  duration: number // weeks
  lessonsPerWeek: number
  suggestedPrice: number
  capacity: number
  materials: string[]
  objectives: string[]
  topics: string[]
  isPopular: boolean
  usageCount: number
  createdBy: string
  createdAt: string
}

// Mock course templates data
const mockTemplates: CourseTemplate[] = [
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
    isPopular: false,
    usageCount: 8,
    createdBy: "System",
    createdAt: "2024-02-01"
  },
  {
    id: "4",
    name: "Travel English Essentials",
    nameJa: "旅行英語エッセンシャル",
    description: "Practical English for travelers including airport, hotel, and sightseeing situations",
    level: "Beginner",
    type: "Group",
    duration: 8,
    lessonsPerWeek: 1,
    suggestedPrice: 18000,
    capacity: 10,
    materials: ["Travel Phrase Book", "Situation Cards", "Audio Guides"],
    objectives: [
      "Navigate airports and transportation",
      "Handle hotel check-in/out",
      "Order food and drinks",
      "Ask for directions and help"
    ],
    topics: ["Airport English", "Hotel Situations", "Restaurant Dining", "Shopping", "Emergency Phrases"],
    isPopular: false,
    usageCount: 5,
    createdBy: "Sarah Johnson",
    createdAt: "2024-02-10"
  },
  {
    id: "5",
    name: "Advanced Conversation Club",
    nameJa: "上級英会話クラブ",
    description: "Discussion-based class for advanced students focusing on current events and complex topics",
    level: "Advanced",
    type: "Group",
    duration: 16,
    lessonsPerWeek: 1,
    suggestedPrice: 22000,
    capacity: 8,
    materials: ["News Articles", "Discussion Topics", "Debate Guidelines"],
    objectives: [
      "Express complex ideas fluently",
      "Participate in debates and discussions",
      "Understand cultural nuances",
      "Develop critical thinking in English"
    ],
    topics: ["Current Events", "Cultural Topics", "Philosophy", "Technology", "Global Issues"],
    isPopular: false,
    usageCount: 3,
    createdBy: "Mike Chen",
    createdAt: "2024-02-15"
  }
]

export function CourseTemplates() {
  const [templates, setTemplates] = useState<CourseTemplate[]>(mockTemplates)
  const [searchQuery, setSearchQuery] = useState("")
  const [levelFilter, setLevelFilter] = useState<CourseLevel | "All">("All")
  const [typeFilter, setTypeFilter] = useState<CourseType | "All">("All")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount)
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

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.nameJa.includes(searchQuery) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesLevel = levelFilter === "All" || template.level === levelFilter
    const matchesType = typeFilter === "All" || template.type === typeFilter

    return matchesSearch && matchesLevel && matchesType
  })

  const popularTemplates = templates.filter(t => t.isPopular)
  const mostUsedTemplates = templates.sort((a, b) => b.usageCount - a.usageCount).slice(0, 3)

  const useTemplate = (template: CourseTemplate) => {
    // In a real app, this would create a new course based on the template
    alert(`Using template: ${template.name}`)
  }

  const duplicateTemplate = (template: CourseTemplate) => {
    const duplicate: CourseTemplate = {
      ...template,
      id: (templates.length + 1).toString(),
      name: `${template.name} (Copy)`,
      nameJa: template.nameJa ? `${template.nameJa} (コピー)` : "",
      usageCount: 0,
      createdBy: "Current User",
      createdAt: new Date().toISOString().split('T')[0]
    }
    setTemplates([...templates, duplicate])
  }

  const deleteTemplate = (templateId: string) => {
    setTemplates(templates.filter(t => t.id !== templateId))
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Templates</span>
            </div>
            <div className="text-2xl font-bold">{templates.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Popular</span>
            </div>
            <div className="text-2xl font-bold">{popularTemplates.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Copy className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Usage</span>
            </div>
            <div className="text-2xl font-bold">
              {templates.reduce((sum, t) => sum + t.usageCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Templates */}
      {popularTemplates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Popular Templates
            </CardTitle>
            <CardDescription>
              Most commonly used course templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {popularTemplates.map((template) => (
                <div key={template.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{template.name}</h4>
                      {template.nameJa && (
                        <p className="text-sm text-muted-foreground">{template.nameJa}</p>
                      )}
                    </div>
                    <Badge className={getLevelColor(template.level)}>
                      {template.level}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>{template.duration}w</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span>Max {template.capacity}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-muted-foreground" />
                      <span>{formatCurrency(template.suggestedPrice)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Copy className="h-3 w-3 text-muted-foreground" />
                      <span>Used {template.usageCount} times</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    size="sm"
                    onClick={() => useTemplate(template)}
                  >
                    Use This Template
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>All Templates</CardTitle>
          <CardDescription>
            Browse and manage all available course templates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
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

          {/* Templates Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="relative">
                {template.isPopular && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <Badge className="bg-yellow-500 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      {template.nameJa && (
                        <CardDescription>{template.nameJa}</CardDescription>
                      )}
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => useTemplate(template)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Use Template
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => duplicateTemplate(template)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => deleteTemplate(template.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getLevelColor(template.level)}>
                      {template.level}
                    </Badge>
                    <Badge variant="outline">{template.type}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{template.duration} weeks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{template.lessonsPerWeek}x/week</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Max {template.capacity}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>{formatCurrency(template.suggestedPrice)}</span>
                    </div>
                  </div>

                  {template.objectives.length > 0 && (
                    <div>
                      <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Key Objectives
                      </h5>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        {template.objectives.slice(0, 3).map((objective, index) => (
                          <li key={index}>• {objective}</li>
                        ))}
                        {template.objectives.length > 3 && (
                          <li>• and {template.objectives.length - 3} more...</li>
                        )}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Copy className="h-3 w-3" />
                      <span>Used {template.usageCount} times</span>
                    </div>
                    <Button size="sm" onClick={() => useTemplate(template)}>
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No templates found matching your criteria.</p>
              <p className="text-sm">Try adjusting your search or filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}