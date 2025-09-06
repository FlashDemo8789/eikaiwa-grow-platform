'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, CalendarDays } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Search, 
  Filter, 
  Plus, 
  Phone, 
  Mail, 
  MessageCircle, 
  Calendar as CalendarIcon, 
  User, 
  Target, 
  TrendingUp, 
  DollarSign,
  Download,
  Upload,
  Bell,
  Star,
  FileText,
  MoreHorizontal,
  Users,
  Zap,
  BarChart3,
  PieChart
} from 'lucide-react'
import { format } from "date-fns"
import { ja } from "date-fns/locale"

// Types and interfaces
export interface Lead {
  id: string
  name: string
  nameKana: string
  email: string
  phone: string
  age?: number
  source: LeadSource
  stage: LeadStage
  score: number
  assignedTo: string
  createdAt: Date
  updatedAt: Date
  lastContact?: Date
  nextFollowUp?: Date
  trialDate?: Date
  notes: ContactNote[]
  tags: string[]
  estimatedValue: number
  probability: number
  lineId?: string
  preferredContactMethod: 'email' | 'phone' | 'line'
  englishLevel: 'beginner' | 'elementary' | 'intermediate' | 'advanced'
  interests: string[]
  budget?: number
  timezone: string
}

export interface ContactNote {
  id: string
  content: string
  type: 'call' | 'email' | 'line' | 'meeting' | 'trial' | 'note'
  createdAt: Date
  createdBy: string
  attachments?: string[]
}

export type LeadSource = 
  | 'website' 
  | 'referral' 
  | 'walk-in' 
  | 'event' 
  | 'social-media' 
  | 'google-ads' 
  | 'facebook-ads' 
  | 'instagram-ads' 
  | 'line-ads'
  | 'flyer'
  | 'partner'

export type LeadStage = 
  | 'inquiry' 
  | 'trial' 
  | 'negotiation' 
  | 'enrolled' 
  | 'lost'

// Mock data
const mockLeads: Lead[] = [
  {
    id: '1',
    name: '田中太郎',
    nameKana: 'タナカタロウ',
    email: 'tanaka@example.com',
    phone: '090-1234-5678',
    age: 28,
    source: 'website',
    stage: 'trial',
    score: 85,
    assignedTo: '佐藤先生',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    lastContact: new Date('2024-01-18'),
    nextFollowUp: new Date('2024-01-25'),
    trialDate: new Date('2024-01-22'),
    notes: [
      {
        id: '1',
        content: 'ビジネス英語に興味があります。TOEIC600点を目指している。',
        type: 'call',
        createdAt: new Date('2024-01-18'),
        createdBy: '佐藤先生'
      }
    ],
    tags: ['ビジネス英語', 'TOEIC'],
    estimatedValue: 80000,
    probability: 75,
    preferredContactMethod: 'line',
    englishLevel: 'intermediate',
    interests: ['business', 'toeic'],
    budget: 100000,
    timezone: 'Asia/Tokyo'
  },
  {
    id: '2',
    name: '佐藤花子',
    nameKana: 'サトウハナコ',
    email: 'sato@example.com',
    phone: '080-9876-5432',
    age: 34,
    source: 'referral',
    stage: 'negotiation',
    score: 92,
    assignedTo: '田中先生',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-19'),
    lastContact: new Date('2024-01-19'),
    nextFollowUp: new Date('2024-01-23'),
    notes: [
      {
        id: '2',
        content: '友人の紹介で来校。子供の英語教育に関心。',
        type: 'meeting',
        createdAt: new Date('2024-01-19'),
        createdBy: '田中先生'
      }
    ],
    tags: ['紹介', '子供英語'],
    estimatedValue: 120000,
    probability: 85,
    preferredContactMethod: 'email',
    englishLevel: 'beginner',
    interests: ['kids', 'family'],
    budget: 150000,
    timezone: 'Asia/Tokyo'
  }
]

const sourceLabels: Record<LeadSource, string> = {
  website: 'ウェブサイト',
  referral: '紹介',
  'walk-in': '飛び込み',
  event: 'イベント',
  'social-media': 'SNS',
  'google-ads': 'Google広告',
  'facebook-ads': 'Facebook広告',
  'instagram-ads': 'Instagram広告',
  'line-ads': 'LINE広告',
  flyer: 'チラシ',
  partner: 'パートナー'
}

const stageLabels: Record<LeadStage, string> = {
  inquiry: '問い合わせ',
  trial: 'トライアル',
  negotiation: '商談中',
  enrolled: '入学',
  lost: '失注'
}

const stageColors: Record<LeadStage, string> = {
  inquiry: 'bg-blue-100 text-blue-800',
  trial: 'bg-yellow-100 text-yellow-800',
  negotiation: 'bg-orange-100 text-orange-800',
  enrolled: 'bg-green-100 text-green-800',
  lost: 'bg-red-100 text-red-800'
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isNewLeadDialogOpen, setIsNewLeadDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSource, setFilterSource] = useState<LeadSource | 'all'>('all')
  const [filterStage, setFilterStage] = useState<LeadStage | 'all'>('all')
  const [activeTab, setActiveTab] = useState('pipeline')

  // Filter leads based on search and filters
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lead.phone.includes(searchQuery)
    
    const matchesSource = filterSource === 'all' || lead.source === filterSource
    const matchesStage = filterStage === 'all' || lead.stage === filterStage
    
    return matchesSearch && matchesSource && matchesStage
  })

  // Calculate analytics
  const analytics = {
    totalLeads: leads.length,
    conversionRate: Math.round((leads.filter(l => l.stage === 'enrolled').length / leads.length) * 100),
    avgScore: Math.round(leads.reduce((sum, lead) => sum + lead.score, 0) / leads.length),
    totalValue: leads.filter(l => l.stage === 'enrolled').reduce((sum, lead) => sum + lead.estimatedValue, 0)
  }

  const stageStats = Object.entries(stageLabels).map(([stage, label]) => ({
    stage: stage as LeadStage,
    label,
    count: leads.filter(l => l.stage === stage).length,
    value: leads.filter(l => l.stage === stage).reduce((sum, l) => sum + l.estimatedValue, 0)
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">リード管理</h1>
          <p className="text-muted-foreground">
            見込み客の管理と育成を効率的に行いましょう
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            インポート
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            エクスポート
          </Button>
          <Dialog open={isNewLeadDialogOpen} onOpenChange={setIsNewLeadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                新規リード追加
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>新規リード追加</DialogTitle>
                <DialogDescription>
                  新しい見込み客の情報を入力してください
                </DialogDescription>
              </DialogHeader>
              <NewLeadForm onSave={(newLead) => {
                setLeads([...leads, { ...newLead, id: String(Date.now()) }])
                setIsNewLeadDialogOpen(false)
              }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総リード数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              +12% 前月比
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">成約率</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              +2.3% 前月比
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均スコア</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgScore}</div>
            <p className="text-xs text-muted-foreground">
              +5.2 前月比
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総売上</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{analytics.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +18.2% 前月比
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="pipeline">パイプライン</TabsTrigger>
          <TabsTrigger value="list">リスト表示</TabsTrigger>
          <TabsTrigger value="analytics">分析</TabsTrigger>
          <TabsTrigger value="automation">自動化</TabsTrigger>
        </TabsList>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="リード検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={filterSource} onValueChange={(value: LeadSource | 'all') => setFilterSource(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="ソース選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全てのソース</SelectItem>
              {Object.entries(sourceLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStage} onValueChange={(value: LeadStage | 'all') => setFilterStage(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="ステージ選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全てのステージ</SelectItem>
              {Object.entries(stageLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="pipeline">
          <PipelineView leads={filteredLeads} onLeadClick={(lead) => {
            setSelectedLead(lead)
            setIsDetailDialogOpen(true)
          }} />
        </TabsContent>

        <TabsContent value="list">
          <ListView leads={filteredLeads} onLeadClick={(lead) => {
            setSelectedLead(lead)
            setIsDetailDialogOpen(true)
          }} />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsView leads={leads} stageStats={stageStats} />
        </TabsContent>

        <TabsContent value="automation">
          <AutomationView />
        </TabsContent>
      </Tabs>

      {/* Lead Detail Dialog */}
      {selectedLead && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <LeadDetailView lead={selectedLead} onUpdate={(updatedLead) => {
              setLeads(leads.map(l => l.id === updatedLead.id ? updatedLead : l))
              setSelectedLead(updatedLead)
            }} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Pipeline View Component
function PipelineView({ leads, onLeadClick }: { leads: Lead[], onLeadClick: (lead: Lead) => void }) {
  return (
    <div className="grid grid-cols-5 gap-4 min-h-[600px]">
      {Object.entries(stageLabels).map(([stage, label]) => {
        const stageLeads = leads.filter(l => l.stage === stage)
        const stageValue = stageLeads.reduce((sum, l) => sum + l.estimatedValue, 0)
        
        return (
          <Card key={stage} className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{label}</CardTitle>
                <Badge variant="secondary">{stageLeads.length}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                ¥{stageValue.toLocaleString()}
              </p>
            </CardHeader>
            <CardContent className="flex-1 space-y-2 pt-0">
              {stageLeads.map((lead) => (
                <Card 
                  key={lead.id} 
                  className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onLeadClick(lead)}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{lead.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {lead.score}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {sourceLabels[lead.source]}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span>¥{lead.estimatedValue.toLocaleString()}</span>
                      <span className="text-muted-foreground">
                        {lead.assignedTo}
                      </span>
                    </div>
                    {lead.nextFollowUp && (
                      <div className="flex items-center gap-1 text-xs text-orange-600">
                        <CalendarIcon className="h-3 w-3" />
                        {format(lead.nextFollowUp, 'M/d', { locale: ja })}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// List View Component
function ListView({ leads, onLeadClick }: { leads: Lead[], onLeadClick: (lead: Lead) => void }) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-left">
                <th className="p-4 font-medium">名前</th>
                <th className="p-4 font-medium">連絡先</th>
                <th className="p-4 font-medium">ソース</th>
                <th className="p-4 font-medium">ステージ</th>
                <th className="p-4 font-medium">スコア</th>
                <th className="p-4 font-medium">見込額</th>
                <th className="p-4 font-medium">担当者</th>
                <th className="p-4 font-medium">次回フォロー</th>
                <th className="p-4 font-medium">アクション</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr 
                  key={lead.id} 
                  className="border-b hover:bg-muted/50 cursor-pointer"
                  onClick={() => onLeadClick(lead)}
                >
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-sm text-muted-foreground">{lead.nameKana}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3" />
                        {lead.email}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        {lead.phone}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline">
                      {sourceLabels[lead.source]}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge className={stageColors[lead.stage]}>
                      {stageLabels[lead.stage]}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Progress value={lead.score} className="w-16 h-2" />
                      <span className="text-sm font-medium">{lead.score}</span>
                    </div>
                  </td>
                  <td className="p-4 font-medium">
                    ¥{lead.estimatedValue.toLocaleString()}
                  </td>
                  <td className="p-4 text-sm">{lead.assignedTo}</td>
                  <td className="p-4">
                    {lead.nextFollowUp ? (
                      <div className="flex items-center gap-1 text-sm">
                        <CalendarIcon className="h-3 w-3" />
                        {format(lead.nextFollowUp, 'yyyy/M/d', { locale: ja })}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">未設定</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={(e) => e.stopPropagation()}>
                        <Phone className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={(e) => e.stopPropagation()}>
                        <Mail className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={(e) => e.stopPropagation()}>
                        <MessageCircle className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

// Analytics View Component
function AnalyticsView({ leads, stageStats }: { leads: Lead[], stageStats: any[] }) {
  const sourceStats = Object.entries(sourceLabels).map(([source, label]) => ({
    source,
    label,
    count: leads.filter(l => l.source === source).length,
    conversionRate: Math.round((leads.filter(l => l.source === source && l.stage === 'enrolled').length / leads.filter(l => l.source === source).length) * 100) || 0
  }))

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              ステージ別分析
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stageStats.map(({ stage, label, count, value }) => (
                <div key={stage} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${stageColors[stage].split(' ')[0]}`} />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{count}件</div>
                    <div className="text-xs text-muted-foreground">
                      ¥{value.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              ソース別分析
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sourceStats.filter(s => s.count > 0).map(({ source, label, count, conversionRate }) => (
                <div key={source} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{label}</span>
                    <div className="text-right">
                      <div className="text-sm">{count}件</div>
                      <div className="text-xs text-muted-foreground">{conversionRate}% 成約率</div>
                    </div>
                  </div>
                  <Progress value={conversionRate} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            ROI分析
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {sourceStats.filter(s => s.count > 0).map(({ source, label, count }) => {
              const revenue = leads.filter(l => l.source === source && l.stage === 'enrolled').reduce((sum, l) => sum + l.estimatedValue, 0)
              const cost = Math.floor(Math.random() * 50000) + 10000 // Mock cost data
              const roi = Math.round(((revenue - cost) / cost) * 100)
              
              return (
                <Card key={source}>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">{label}</p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>売上</span>
                          <span>¥{revenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>コスト</span>
                          <span>¥{cost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm font-medium">
                          <span>ROI</span>
                          <span className={roi > 0 ? 'text-green-600' : 'text-red-600'}>
                            {roi}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Automation View Component
function AutomationView() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            自動化設定
          </CardTitle>
          <CardDescription>
            リードの自動フォローアップとコミュニケーションを設定
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">メール自動送信</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-welcome">ウェルカムメール</Label>
                  <Switch id="email-welcome" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-followup">フォローアップメール</Label>
                  <Switch id="email-followup" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-reminder">リマインダーメール</Label>
                  <Switch id="email-reminder" defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">LINE自動返信</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="line-welcome">ウェルカムメッセージ</Label>
                  <Switch id="line-welcome" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="line-booking">予約確認メッセージ</Label>
                  <Switch id="line-booking" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="line-reminder">レッスンリマインダー</Label>
                  <Switch id="line-reminder" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">スコアリングルール</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium">ウェブサイト閲覧</Label>
                    <Input type="number" defaultValue="10" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">資料ダウンロード</Label>
                    <Input type="number" defaultValue="20" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">問い合わせフォーム</Label>
                    <Input type="number" defaultValue="30" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">体験レッスン参加</Label>
                    <Input type="number" defaultValue="50" className="mt-1" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">タスク自動生成</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="task-followup">フォローアップタスク（3日後）</Label>
                  <Switch id="task-followup" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="task-trial">体験レッスンリマインダー（前日）</Label>
                  <Switch id="task-trial" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="task-proposal">提案書送付リマインダー（7日後）</Label>
                  <Switch id="task-proposal" />
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}

// Lead Detail View Component
function LeadDetailView({ lead, onUpdate }: { lead: Lead, onUpdate: (lead: Lead) => void }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [newNote, setNewNote] = useState('')
  
  return (
    <div className="space-y-6">
      <DialogHeader>
        <div className="flex items-center justify-between">
          <div>
            <DialogTitle className="text-xl">{lead.name}</DialogTitle>
            <DialogDescription>{lead.nameKana}</DialogDescription>
          </div>
          <Badge className={stageColors[lead.stage]}>
            {stageLabels[lead.stage]}
          </Badge>
        </div>
      </DialogHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="history">履歴</TabsTrigger>
          <TabsTrigger value="tasks">タスク</TabsTrigger>
          <TabsTrigger value="documents">書類</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">基本情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{lead.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{lead.phone}</span>
                </div>
                {lead.age && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{lead.age}歳</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{sourceLabels[lead.source]}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">スコア・見込み</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">リードスコア</span>
                    <Badge variant="outline">{lead.score}</Badge>
                  </div>
                  <Progress value={lead.score} className="h-2" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">見込み額</span>
                  <span className="font-medium">¥{lead.estimatedValue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">成約確率</span>
                  <span className="font-medium">{lead.probability}%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">学習情報</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium">英語レベル</Label>
                  <p className="mt-1 text-sm capitalize">{lead.englishLevel}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">興味分野</Label>
                  <div className="mt-1 flex gap-1 flex-wrap">
                    {lead.interests.map((interest) => (
                      <Badge key={interest} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
                {lead.budget && (
                  <div>
                    <Label className="text-sm font-medium">予算</Label>
                    <p className="mt-1 text-sm">¥{lead.budget.toLocaleString()}/月</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">コンタクト履歴</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lead.notes.map((note) => (
                  <div key={note.id} className="flex gap-3 p-3 rounded-lg border">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      {note.type === 'call' && <Phone className="h-4 w-4" />}
                      {note.type === 'email' && <Mail className="h-4 w-4" />}
                      {note.type === 'line' && <MessageCircle className="h-4 w-4" />}
                      {note.type === 'meeting' && <User className="h-4 w-4" />}
                      {note.type === 'note' && <FileText className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{note.createdBy}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(note.createdAt, 'yyyy/M/d HH:mm', { locale: ja })}
                        </span>
                      </div>
                      <p className="text-sm">{note.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 space-y-3">
                <Label htmlFor="new-note">新しいメモ</Label>
                <Textarea
                  id="new-note"
                  placeholder="メモを入力..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <Button 
                  onClick={() => {
                    if (newNote.trim()) {
                      const updatedLead = {
                        ...lead,
                        notes: [...lead.notes, {
                          id: String(Date.now()),
                          content: newNote,
                          type: 'note' as const,
                          createdAt: new Date(),
                          createdBy: '現在のユーザー'
                        }]
                      }
                      onUpdate(updatedLead)
                      setNewNote('')
                    }
                  }}
                  disabled={!newNote.trim()}
                >
                  メモを追加
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <TaskManagement leadId={lead.id} />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <DocumentManagement leadId={lead.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Task Management Component
function TaskManagement({ leadId }: { leadId: string }) {
  const [tasks] = useState([
    {
      id: '1',
      title: 'フォローアップコール',
      description: '体験レッスンの感想を聞く',
      dueDate: new Date('2024-01-25'),
      status: 'pending' as const,
      priority: 'high' as const
    },
    {
      id: '2',
      title: '提案書準備',
      description: 'カスタマイズされた学習プランを作成',
      dueDate: new Date('2024-01-28'),
      status: 'in-progress' as const,
      priority: 'medium' as const
    }
  ])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">タスク管理</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border">
              <input type="checkbox" className="rounded" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium">{task.title}</h4>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}
                    >
                      {task.priority}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(task.dueDate, 'M/d', { locale: ja })}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{task.description}</p>
              </div>
            </div>
          ))}
          
          <Button variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            新しいタスクを追加
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Document Management Component
function DocumentManagement({ leadId }: { leadId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">書類管理</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              ファイルをドラッグ&ドロップまたはクリックして選択
            </p>
            <Button variant="outline" size="sm">
              ファイルを選択
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 rounded border">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">申込書.pdf</p>
                <p className="text-xs text-muted-foreground">2024/1/20 アップロード</p>
              </div>
              <Button size="sm" variant="ghost">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// New Lead Form Component
function NewLeadForm({ onSave }: { onSave: (lead: Omit<Lead, 'id'>) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    nameKana: '',
    email: '',
    phone: '',
    age: '',
    source: 'website' as LeadSource,
    stage: 'inquiry' as LeadStage,
    assignedTo: '',
    estimatedValue: '',
    englishLevel: 'beginner' as Lead['englishLevel'],
    preferredContactMethod: 'email' as Lead['preferredContactMethod']
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newLead: Omit<Lead, 'id'> = {
      ...formData,
      age: formData.age ? parseInt(formData.age) : undefined,
      estimatedValue: parseInt(formData.estimatedValue) || 50000,
      score: 50,
      createdAt: new Date(),
      updatedAt: new Date(),
      notes: [],
      tags: [],
      probability: 50,
      interests: [],
      timezone: 'Asia/Tokyo'
    }
    
    onSave(newLead)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="name">お名前 *</Label>
          <Input
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="nameKana">フリガナ *</Label>
          <Input
            id="nameKana"
            required
            value={formData.nameKana}
            onChange={(e) => setFormData({...formData, nameKana: e.target.value})}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="email">メールアドレス *</Label>
          <Input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="phone">電話番号 *</Label>
          <Input
            id="phone"
            required
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="age">年齢</Label>
          <Input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({...formData, age: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="source">リードソース</Label>
          <Select value={formData.source} onValueChange={(value: LeadSource) => setFormData({...formData, source: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(sourceLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="englishLevel">英語レベル</Label>
          <Select value={formData.englishLevel} onValueChange={(value: Lead['englishLevel']) => setFormData({...formData, englishLevel: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">初心者</SelectItem>
              <SelectItem value="elementary">初級</SelectItem>
              <SelectItem value="intermediate">中級</SelectItem>
              <SelectItem value="advanced">上級</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="assignedTo">担当者</Label>
          <Input
            id="assignedTo"
            value={formData.assignedTo}
            onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="estimatedValue">見込み額（円）</Label>
          <Input
            id="estimatedValue"
            type="number"
            value={formData.estimatedValue}
            onChange={(e) => setFormData({...formData, estimatedValue: e.target.value})}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="contactMethod">希望連絡方法</Label>
        <Select value={formData.preferredContactMethod} onValueChange={(value: Lead['preferredContactMethod']) => setFormData({...formData, preferredContactMethod: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="email">メール</SelectItem>
            <SelectItem value="phone">電話</SelectItem>
            <SelectItem value="line">LINE</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DialogFooter>
        <Button type="submit">
          リードを追加
        </Button>
      </DialogFooter>
    </form>
  )
}