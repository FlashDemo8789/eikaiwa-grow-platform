"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  BookOpen,
  Clock,
  Users,
  Star,
  MoreHorizontal,
  Copy,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Play,
  Target,
  Download
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { LessonTemplate, TemplateCategory, AgeGroup, SkillLevel } from "@/types/lesson"

// Mock template data
const mockTemplates: LessonTemplate[] = [
  {
    id: "1",
    name: "基本挨拶とコミュニケーション",
    description: "初心者向けの基本的な挨拶と簡単な自己紹介を学ぶテンプレート",
    category: "conversation",
    ageGroup: "adult",
    skillLevel: "good",
    duration: 50,
    objectives: [
      {
        description: "基本挨拶をマスターする",
        category: "speaking",
        order: 1
      },
      {
        description: "簡単な自己紹介ができる",
        category: "speaking",
        order: 2
      }
    ],
    activities: [
      {
        name: "ウォームアップ挨拶",
        description: "基本挨拶の練習",
        type: "warmup",
        duration: 10,
        materials: [],
        instructions: "生徒同士で挨拶の練習を行う",
        order: 1
      },
      {
        name: "自己紹介ゲーム",
        description: "楽しく自己紹介を学ぶ",
        type: "game",
        duration: 20,
        materials: ["name cards", "markers"],
        instructions: "名前カードを使って自己紹介ゲーム",
        order: 2
      }
    ],
    materials: [],
    vocabulary: [],
    tags: ["初心者", "挨拶", "自己紹介", "基本"],
    isPublic: true,
    createdBy: "田中先生",
    createdAt: new Date("2024-01-01"),
    timesUsed: 45
  },
  {
    id: "2",
    name: "ビジネス英語：会議での表現",
    description: "ビジネス会議で使用する基本的な表現を学習",
    category: "business",
    ageGroup: "adult",
    skillLevel: "good",
    duration: 90,
    objectives: [
      {
        description: "会議での基本表現を習得",
        category: "vocabulary",
        order: 1
      },
      {
        description: "意見を述べることができる",
        category: "speaking",
        order: 2
      }
    ],
    activities: [
      {
        name: "ビジネス用語の学習",
        description: "会議で使う重要表現の確認",
        type: "presentation",
        duration: 30,
        materials: ["PowerPoint presentation"],
        instructions: "会議用語を提示し、意味と使い方を説明",
        order: 1
      }
    ],
    materials: [],
    vocabulary: [],
    tags: ["ビジネス", "会議", "上級", "実践"],
    isPublic: true,
    createdBy: "山田先生",
    createdAt: new Date("2024-01-05"),
    timesUsed: 23
  },
  {
    id: "3",
    name: "子供向け動物の名前",
    description: "楽しく動物の名前を覚える子供向けレッスン",
    category: "vocabulary",
    ageGroup: "elementary",
    skillLevel: "developing",
    duration: 40,
    objectives: [
      {
        description: "10種類の動物名を覚える",
        category: "vocabulary",
        order: 1
      },
      {
        description: "動物の鳴き声表現を学ぶ",
        category: "pronunciation",
        order: 2
      }
    ],
    activities: [
      {
        name: "動物カードゲーム",
        description: "カードを使った動物名学習",
        type: "game",
        duration: 25,
        materials: ["animal cards", "audio files"],
        instructions: "動物カードを見せながら名前と鳴き声を練習",
        order: 1
      }
    ],
    materials: [],
    vocabulary: [],
    tags: ["子供", "動物", "語彙", "楽しい"],
    isPublic: true,
    createdBy: "佐藤先生",
    createdAt: new Date("2024-01-10"),
    timesUsed: 67
  }
]

const categoryLabels = {
  conversation: "会話",
  grammar: "文法",
  vocabulary: "語彙",
  pronunciation: "発音",
  business: "ビジネス",
  exam_prep: "試験対策",
  cultural: "文化",
  holiday_special: "季節・イベント",
  assessment: "評価"
}

const ageGroupLabels = {
  toddler: "幼児",
  preschool: "就学前",
  elementary: "小学生",
  middle_school: "中学生",
  high_school: "高校生",
  adult: "大人",
  senior: "シニア",
  mixed: "混合"
}

const skillLevelLabels = {
  excellent: "優秀",
  good: "良い",
  developing: "発達中",
  needs_practice: "練習が必要",
}

interface LessonTemplatesProps {
  onUseTemplate?: (templateId: string) => void
}

export function LessonTemplates({ onUseTemplate }: LessonTemplatesProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("")
  const [ageGroupFilter, setAgeGroupFilter] = useState<string>("")
  const [skillLevelFilter, setSkillLevelFilter] = useState<string>("")
  const [selectedTemplate, setSelectedTemplate] = useState<LessonTemplate | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const filteredTemplates = mockTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = !categoryFilter || template.category === categoryFilter
    const matchesAgeGroup = !ageGroupFilter || template.ageGroup === ageGroupFilter
    const matchesSkillLevel = !skillLevelFilter || template.skillLevel === skillLevelFilter

    return matchesSearch && matchesCategory && matchesAgeGroup && matchesSkillLevel
  })

  const handleUseTemplate = (template: LessonTemplate) => {
    onUseTemplate?.(template.id)
    console.log("Using template:", template.id)
  }

  const handlePreviewTemplate = (template: LessonTemplate) => {
    setSelectedTemplate(template)
    setPreviewOpen(true)
  }

  return (
    <>
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="テンプレートを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="カテゴリー" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">すべて</SelectItem>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={ageGroupFilter} onValueChange={setAgeGroupFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="年齢層" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">すべて</SelectItem>
                {Object.entries(ageGroupLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={skillLevelFilter} onValueChange={setSkillLevelFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="レベル" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">すべて</SelectItem>
                {Object.entries(skillLevelLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{template.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {template.description}
                    </CardDescription>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>アクション</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handlePreviewTemplate(template)}>
                        <Eye className="mr-2 h-4 w-4" />
                        プレビュー
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUseTemplate(template)}>
                        <Copy className="mr-2 h-4 w-4" />
                        テンプレート使用
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        編集
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        エクスポート
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        削除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="secondary">
                    {categoryLabels[template.category as keyof typeof categoryLabels]}
                  </Badge>
                  <Badge variant="outline">
                    {ageGroupLabels[template.ageGroup as keyof typeof ageGroupLabels]}
                  </Badge>
                  <Badge variant="outline">
                    {skillLevelLabels[template.skillLevel as keyof typeof skillLevelLabels]}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {template.duration}分
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    {template.objectives.length}目標
                  </div>
                  <div className="flex items-center gap-1">
                    <Play className="h-3 w-3" />
                    {template.activities.length}活動
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{template.createdBy}</span>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {template.timesUsed}回使用
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.tags.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    className="flex-1" 
                    size="sm"
                    onClick={() => handleUseTemplate(template)}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    使用
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePreviewTemplate(template)}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">テンプレートが見つかりません</h3>
            <p className="text-muted-foreground">
              検索条件を変更するか、新しいテンプレートを作成してください。
            </p>
          </div>
        )}
      </div>

      {/* Template Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.name}</DialogTitle>
            <DialogDescription>{selectedTemplate?.description}</DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-6 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {categoryLabels[selectedTemplate.category as keyof typeof categoryLabels]}
                </Badge>
                <Badge variant="outline">
                  {ageGroupLabels[selectedTemplate.ageGroup as keyof typeof ageGroupLabels]}
                </Badge>
                <Badge variant="outline">
                  {skillLevelLabels[selectedTemplate.skillLevel as keyof typeof skillLevelLabels]}
                </Badge>
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  {selectedTemplate.duration}分
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      学習目標
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedTemplate.objectives.map((objective, index) => (
                        <div key={index} className="text-sm">
                          {index + 1}. {objective.description}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      学習活動
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedTemplate.activities.map((activity, index) => (
                        <div key={index} className="border rounded p-3">
                          <div className="font-medium text-sm">{activity.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {activity.duration}分 • {activity.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    handleUseTemplate(selectedTemplate)
                    setPreviewOpen(false)
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  このテンプレートを使用
                </Button>
                <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                  閉じる
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}