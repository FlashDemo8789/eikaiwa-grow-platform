'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ParentCommunicationComposer, PARENT_COMMUNICATION_TEMPLATES } from "@/components/ui/japanese/parent-communication"
import {
  MessageSquare,
  Mail,
  Phone,
  Search,
  Filter,
  Plus,
  Star,
  StarOff,
  Archive,
  Trash2,
  Send,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Languages,
  Calendar as CalendarIcon,
  MoreVertical,
  Reply,
  Forward,
  Flag,
  User,
  Globe,
  FileText,
  Eye,
  EyeOff,
  Paperclip,
  Download,
  RefreshCw,
  Settings,
  Volume2
} from 'lucide-react'
import { cn } from "@/lib/utils"

// Types
interface MessageContact {
  id: string
  name: string
  nameJp?: string
  avatar?: string
  type: 'parent' | 'student' | 'teacher' | 'admin'
  email?: string
  phone?: string
  lineId?: string
  preferredLanguage: 'en' | 'ja' | 'both'
  lastActive: Date
}

interface MessageThread {
  id: string
  subject: string
  participants: MessageContact[]
  messages: Message[]
  status: 'active' | 'archived' | 'deleted'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  tags: string[]
  unreadCount: number
  lastMessageAt: Date
  isImportant: boolean
  scheduledFor?: Date
}

interface Message {
  id: string
  threadId: string
  senderId: string
  recipientIds: string[]
  subject?: string
  content: string
  contentJp?: string
  channel: 'email' | 'line' | 'sms'
  status: 'draft' | 'scheduled' | 'sent' | 'delivered' | 'read' | 'failed'
  isRead: boolean
  isImportant: boolean
  hasAttachments: boolean
  attachments?: MessageAttachment[]
  sentAt?: Date
  readAt?: Date
  scheduledFor?: Date
  templateId?: string
  metadata?: Record<string, any>
}

interface MessageAttachment {
  id: string
  name: string
  size: number
  type: string
  url: string
}

interface QuickReply {
  id: string
  title: string
  titleJp: string
  content: string
  contentJp: string
  category: 'greeting' | 'information' | 'confirmation' | 'apology' | 'reminder'
  channel: 'all' | 'email' | 'line' | 'sms'
}

interface MessageFilter {
  search: string
  channel: string[]
  status: string[]
  priority: string[]
  dateRange: { from?: Date; to?: Date }
  isUnread: boolean
  isImportant: boolean
  tags: string[]
}

// Mock Data
const mockContacts: MessageContact[] = [
  {
    id: '1',
    name: 'Tanaka Hanako',
    nameJp: '田中花子',
    avatar: '/avatars/tanaka.svg',
    type: 'parent',
    email: 'tanaka@example.com',
    phone: '090-1234-5678',
    lineId: 'tanaka_line',
    preferredLanguage: 'ja',
    lastActive: new Date('2024-01-15T10:30:00')
  },
  {
    id: '2',
    name: 'Sato Taro',
    nameJp: '佐藤太郎',
    avatar: '/avatars/sato.svg',
    type: 'parent',
    email: 'sato@example.com',
    phone: '080-9876-5432',
    lineId: 'sato_line',
    preferredLanguage: 'both',
    lastActive: new Date('2024-01-14T15:45:00')
  },
  {
    id: '3',
    name: 'Smith John',
    avatar: '/avatars/smith.svg',
    type: 'parent',
    email: 'john.smith@example.com',
    phone: '070-1111-2222',
    preferredLanguage: 'en',
    lastActive: new Date('2024-01-13T09:20:00')
  }
]

const mockThreads: MessageThread[] = [
  {
    id: '1',
    subject: '月次進捗レポート - 田中太郎くん',
    participants: [mockContacts[0]],
    messages: [
      {
        id: '1',
        threadId: '1',
        senderId: 'teacher1',
        recipientIds: ['1'],
        subject: '月次進捗レポート - 田中太郎くん',
        content: '田中様、いつもお世話になっております。太郎くんの1月の学習進捗をお知らせいたします...',
        channel: 'email',
        status: 'read',
        isRead: true,
        isImportant: false,
        hasAttachments: true,
        sentAt: new Date('2024-01-15T09:00:00'),
        readAt: new Date('2024-01-15T09:30:00')
      }
    ],
    status: 'active',
    priority: 'normal',
    tags: ['progress', 'monthly-report'],
    unreadCount: 0,
    lastMessageAt: new Date('2024-01-15T09:00:00'),
    isImportant: false
  },
  {
    id: '2',
    subject: 'ハロウィンパーティーのご案内',
    participants: [mockContacts[1]],
    messages: [
      {
        id: '2',
        threadId: '2',
        senderId: 'admin1',
        recipientIds: ['2'],
        subject: 'ハロウィンパーティーのご案内',
        content: '佐藤様、秋の深まりを感じる頃となりました。来月のハロウィンパーティーのご案内をいたします...',
        channel: 'line',
        status: 'delivered',
        isRead: false,
        isImportant: true,
        hasAttachments: false,
        sentAt: new Date('2024-01-14T14:00:00')
      }
    ],
    status: 'active',
    priority: 'high',
    tags: ['event', 'halloween'],
    unreadCount: 1,
    lastMessageAt: new Date('2024-01-14T14:00:00'),
    isImportant: true
  },
  {
    id: '3',
    subject: 'Payment Reminder - January 2024',
    participants: [mockContacts[2]],
    messages: [
      {
        id: '3',
        threadId: '3',
        senderId: 'admin1',
        recipientIds: ['3'],
        subject: 'Payment Reminder - January 2024',
        content: 'Dear Mr. Smith, This is a friendly reminder that your payment for January 2024 is due...',
        channel: 'email',
        status: 'sent',
        isRead: false,
        isImportant: false,
        hasAttachments: false,
        sentAt: new Date('2024-01-13T16:00:00')
      }
    ],
    status: 'active',
    priority: 'normal',
    tags: ['payment', 'reminder'],
    unreadCount: 1,
    lastMessageAt: new Date('2024-01-13T16:00:00'),
    isImportant: false
  }
]

const quickReplies: QuickReply[] = [
  {
    id: '1',
    title: 'Thank You',
    titleJp: 'お礼',
    content: 'Thank you for your message. I will get back to you soon.',
    contentJp: 'メッセージをありがとうございます。すぐにお返事いたします。',
    category: 'greeting',
    channel: 'all'
  },
  {
    id: '2',
    title: 'Meeting Confirmation',
    titleJp: '面談確認',
    content: 'I confirm our meeting scheduled for [DATE] at [TIME].',
    contentJp: '[日付]の[時間]にご予定いただいた面談の件、確認いたしました。',
    category: 'confirmation',
    channel: 'all'
  },
  {
    id: '3',
    title: 'Class Information',
    titleJp: '授業情報',
    content: 'Here is the information about the upcoming class...',
    contentJp: '次回授業についてお知らせいたします...',
    category: 'information',
    channel: 'all'
  }
]

export default function MessageCenterPage() {
  // State Management
  const [threads, setThreads] = useState<MessageThread[]>(mockThreads)
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null)
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [isComposing, setIsComposing] = useState(false)
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null)
  const [showTranslation, setShowTranslation] = useState<Record<string, boolean>>({})
  const [filter, setFilter] = useState<MessageFilter>({
    search: '',
    channel: [],
    status: [],
    priority: [],
    dateRange: {},
    isUnread: false,
    isImportant: false,
    tags: []
  })
  const [activeTab, setActiveTab] = useState('inbox')
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Filter and search logic
  const filteredThreads = threads.filter(thread => {
    if (filter.search && !thread.subject.toLowerCase().includes(filter.search.toLowerCase())) {
      return false
    }
    if (filter.isUnread && thread.unreadCount === 0) return false
    if (filter.isImportant && !thread.isImportant) return false
    if (filter.channel.length > 0) {
      const hasChannel = thread.messages.some(msg => filter.channel.includes(msg.channel))
      if (!hasChannel) return false
    }
    if (filter.priority.length > 0 && !filter.priority.includes(thread.priority)) return false
    if (filter.tags.length > 0) {
      const hasTag = filter.tags.some(tag => thread.tags.includes(tag))
      if (!hasTag) return false
    }
    return true
  })

  // Handlers
  const handleThreadSelect = (thread: MessageThread) => {
    setSelectedThread(thread)
    // Mark messages as read
    if (thread.unreadCount > 0) {
      setThreads(prev => prev.map(t => 
        t.id === thread.id 
          ? { ...t, unreadCount: 0, messages: t.messages.map(m => ({ ...m, isRead: true })) }
          : t
      ))
    }
  }

  const handleMarkImportant = (threadId: string) => {
    setThreads(prev => prev.map(t => 
      t.id === threadId ? { ...t, isImportant: !t.isImportant } : t
    ))
  }

  const handleArchiveThread = (threadId: string) => {
    setThreads(prev => prev.map(t => 
      t.id === threadId ? { ...t, status: 'archived' } : t
    ))
    if (selectedThread?.id === threadId) {
      setSelectedThread(null)
    }
  }

  const handleDeleteThread = (threadId: string) => {
    setThreads(prev => prev.filter(t => t.id !== threadId))
    if (selectedThread?.id === threadId) {
      setSelectedThread(null)
    }
  }

  const handleSendMessage = (content: string, channel: 'email' | 'line' | 'sms') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      threadId: selectedThread?.id || '',
      senderId: 'current_user',
      recipientIds: selectedThread?.participants.map(p => p.id) || [],
      content,
      channel,
      status: 'sent',
      isRead: false,
      isImportant: false,
      hasAttachments: false,
      sentAt: new Date()
    }

    if (selectedThread) {
      setThreads(prev => prev.map(t => 
        t.id === selectedThread.id 
          ? { 
              ...t, 
              messages: [...t.messages, newMessage],
              lastMessageAt: new Date()
            }
          : t
      ))
      setSelectedThread(prev => prev ? {
        ...prev,
        messages: [...prev.messages, newMessage],
        lastMessageAt: new Date()
      } : null)
    }
    setReplyingToMessage(null)
  }

  const handleBulkAction = (action: 'read' | 'unread' | 'archive' | 'delete' | 'important') => {
    switch (action) {
      case 'archive':
        setThreads(prev => prev.map(t => 
          selectedContacts.includes(t.id) 
            ? { ...t, status: 'archived' }
            : t
        ))
        break
      case 'delete':
        setThreads(prev => prev.filter(t => !selectedContacts.includes(t.id)))
        break
      case 'important':
        setThreads(prev => prev.map(t => 
          selectedContacts.includes(t.id) 
            ? { ...t, isImportant: true }
            : t
        ))
        break
      case 'read':
        setThreads(prev => prev.map(t => 
          selectedContacts.includes(t.id) 
            ? { ...t, unreadCount: 0, messages: t.messages.map(m => ({ ...m, isRead: true })) }
            : t
        ))
        break
      case 'unread':
        setThreads(prev => prev.map(t => 
          selectedContacts.includes(t.id) 
            ? { ...t, unreadCount: t.messages.length }
            : t
        ))
        break
    }
    setSelectedContacts([])
  }

  const toggleTranslation = (messageId: string) => {
    setShowTranslation(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }))
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-background">
      {/* Sidebar - Message List */}
      <div className="w-1/3 border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              Message Center
            </h1>
            <Dialog open={isComposing} onOpenChange={setIsComposing}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Message
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Compose New Message</DialogTitle>
                </DialogHeader>
                <ParentCommunicationComposer 
                  onSend={(message) => {
                    console.log('Sending message:', message)
                    setIsComposing(false)
                  }}
                  onSave={(draft) => {
                    console.log('Saving draft:', draft)
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={filter.search}
                onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                className="pl-9"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              
              <Badge 
                variant={filter.isUnread ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setFilter(prev => ({ ...prev, isUnread: !prev.isUnread }))}
              >
                Unread
              </Badge>
              
              <Badge 
                variant={filter.isImportant ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setFilter(prev => ({ ...prev, isImportant: !prev.isImportant }))}
              >
                Important
              </Badge>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Channel</Label>
                      <div className="space-y-2">
                        {['email', 'line', 'sms'].map(channel => (
                          <div key={channel} className="flex items-center space-x-2">
                            <Checkbox
                              id={`channel-${channel}`}
                              checked={filter.channel.includes(channel)}
                              onCheckedChange={(checked) => {
                                setFilter(prev => ({
                                  ...prev,
                                  channel: checked 
                                    ? [...prev.channel, channel]
                                    : prev.channel.filter(c => c !== channel)
                                }))
                              }}
                            />
                            <Label htmlFor={`channel-${channel}`} className="capitalize">
                              {channel}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">Priority</Label>
                      <div className="space-y-2">
                        {['urgent', 'high', 'normal', 'low'].map(priority => (
                          <div key={priority} className="flex items-center space-x-2">
                            <Checkbox
                              id={`priority-${priority}`}
                              checked={filter.priority.includes(priority)}
                              onCheckedChange={(checked) => {
                                setFilter(prev => ({
                                  ...prev,
                                  priority: checked 
                                    ? [...prev.priority, priority]
                                    : prev.priority.filter(p => p !== priority)
                                }))
                              }}
                            />
                            <Label htmlFor={`priority-${priority}`} className="capitalize">
                              {priority}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Bulk Actions */}
          {selectedContacts.length > 0 && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">
                {selectedContacts.length} selected
              </span>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('read')}>
                  <CheckCircle className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('important')}>
                  <Star className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('archive')}>
                  <Archive className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('delete')}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1">
          <div className="px-4 py-2 border-b">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="inbox">Inbox</TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="inbox" className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto">
              {filteredThreads.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No messages found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters or compose a new message
                  </p>
                </div>
              ) : (
                filteredThreads.map((thread) => (
                  <div
                    key={thread.id}
                    className={cn(
                      "p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors",
                      selectedThread?.id === thread.id && "bg-muted",
                      thread.unreadCount > 0 && "border-l-4 border-l-primary"
                    )}
                    onClick={() => handleThreadSelect(thread)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedContacts.includes(thread.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedContacts(prev => [...prev, thread.id])
                          } else {
                            setSelectedContacts(prev => prev.filter(id => id !== thread.id))
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      
                      <div className="flex items-center gap-2">
                        {thread.participants.map(participant => (
                          <Avatar key={participant.id} className="h-8 w-8">
                            <AvatarImage src={participant.avatar} />
                            <AvatarFallback>
                              {participant.nameJp ? participant.nameJp[0] : participant.name[0]}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">
                              {thread.participants.map(p => p.nameJp || p.name).join(', ')}
                            </p>
                            {thread.isImportant && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {thread.messages[thread.messages.length - 1]?.channel === 'email' && (
                              <Mail className="h-3 w-3 text-muted-foreground" />
                            )}
                            {thread.messages[thread.messages.length - 1]?.channel === 'line' && (
                              <MessageSquare className="h-3 w-3 text-green-500" />
                            )}
                            {thread.messages[thread.messages.length - 1]?.channel === 'sms' && (
                              <Phone className="h-3 w-3 text-muted-foreground" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {thread.lastMessageAt.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <p className={cn(
                          "text-sm truncate mb-1",
                          thread.unreadCount > 0 ? "font-medium text-foreground" : "text-muted-foreground"
                        )}>
                          {thread.subject}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {thread.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          
                          {thread.unreadCount > 0 && (
                            <Badge variant="default" className="text-xs">
                              {thread.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48" align="end">
                          <div className="space-y-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => handleMarkImportant(thread.id)}
                            >
                              {thread.isImportant ? <StarOff className="mr-2 h-4 w-4" /> : <Star className="mr-2 h-4 w-4" />}
                              {thread.isImportant ? 'Remove Star' : 'Add Star'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => handleArchiveThread(thread.id)}
                            >
                              <Archive className="mr-2 h-4 w-4" />
                              Archive
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-destructive"
                              onClick={() => handleDeleteThread(thread.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="sent" className="flex-1 p-4">
            <div className="text-center text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4" />
              <p>Sent messages will appear here</p>
            </div>
          </TabsContent>

          <TabsContent value="scheduled" className="flex-1 p-4">
            <div className="text-center text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4" />
              <p>Scheduled messages will appear here</p>
            </div>
          </TabsContent>

          <TabsContent value="archived" className="flex-1 p-4">
            <div className="text-center text-muted-foreground">
              <Archive className="h-12 w-12 mx-auto mb-4" />
              <p>Archived messages will appear here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Main Content - Message Thread */}
      <div className="flex-1 flex flex-col">
        {selectedThread ? (
          <>
            {/* Thread Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {selectedThread.participants.map(participant => (
                      <Avatar key={participant.id} className="h-10 w-10">
                        <AvatarImage src={participant.avatar} />
                        <AvatarFallback>
                          {participant.nameJp ? participant.nameJp[0] : participant.name[0]}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{selectedThread.subject}</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>
                        {selectedThread.participants.map(p => p.nameJp || p.name).join(', ')}
                      </span>
                      <Separator orientation="vertical" className="h-4" />
                      <span>{selectedThread.messages.length} messages</span>
                      {selectedThread.isImportant && (
                        <>
                          <Separator orientation="vertical" className="h-4" />
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span>Important</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Star className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Archive className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedThread.tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
                <Badge variant={
                  selectedThread.priority === 'urgent' ? 'destructive' :
                  selectedThread.priority === 'high' ? 'default' :
                  'secondary'
                }>
                  {selectedThread.priority}
                </Badge>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedThread.messages.map((message) => (
                <Card key={message.id} className={cn(
                  message.senderId === 'current_user' ? 'ml-12' : 'mr-12'
                )}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {message.senderId === 'current_user' ? 'Me' : 
                             selectedThread.participants.find(p => p.id === message.senderId)?.nameJp?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {message.senderId === 'current_user' ? 'You' : 
                             selectedThread.participants.find(p => p.id === message.senderId)?.nameJp || 'Unknown'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{message.sentAt?.toLocaleString()}</span>
                            <Separator orientation="vertical" className="h-3" />
                            <div className="flex items-center gap-1">
                              {message.channel === 'email' && <Mail className="h-3 w-3" />}
                              {message.channel === 'line' && <MessageSquare className="h-3 w-3 text-green-500" />}
                              {message.channel === 'sms' && <Phone className="h-3 w-3" />}
                              <span className="capitalize">{message.channel}</span>
                            </div>
                            <Separator orientation="vertical" className="h-3" />
                            <Badge variant="secondary" className="text-xs">
                              {message.status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => toggleTranslation(message.id)}
                        >
                          <Languages className="h-4 w-4" />
                        </Button>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-48" align="end">
                            <div className="space-y-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start"
                                onClick={() => setReplyingToMessage(message)}
                              >
                                <Reply className="mr-2 h-4 w-4" />
                                Reply
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start"
                              >
                                <Forward className="mr-2 h-4 w-4" />
                                Forward
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start"
                              >
                                <Flag className="mr-2 h-4 w-4" />
                                Flag
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-2">
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap japanese-text" style={{
                        fontFamily: '"Noto Sans JP", "Yu Gothic", "Meiryo", sans-serif'
                      }}>
                        {message.content}
                      </p>
                      
                      {showTranslation[message.id] && message.contentJp && (
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Languages className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground">Translation</span>
                          </div>
                          <p className="text-sm japanese-text">
                            {message.contentJp}
                          </p>
                        </div>
                      )}
                    </div>

                    {message.hasAttachments && message.attachments && (
                      <div className="mt-3 space-y-2">
                        <p className="text-sm font-medium">Attachments:</p>
                        {message.attachments.map((attachment) => (
                          <div key={attachment.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm flex-1">{attachment.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {(attachment.size / 1024).toFixed(1)} KB
                            </span>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Reply Section */}
            <div className="border-t p-4">
              {replyingToMessage && (
                <div className="mb-4 p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Replying to:</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyingToMessage(null)}
                    >
                      ×
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {replyingToMessage.content}
                  </p>
                </div>
              )}

              <MessageComposer
                onSend={handleSendMessage}
                quickReplies={quickReplies}
                selectedThread={selectedThread}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">
                Choose a message from the sidebar to start reading and replying
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Message Composer Component
interface MessageComposerProps {
  onSend: (content: string, channel: 'email' | 'line' | 'sms') => void
  quickReplies: QuickReply[]
  selectedThread?: MessageThread | null
}

function MessageComposer({ onSend, quickReplies, selectedThread }: MessageComposerProps) {
  const [message, setMessage] = useState('')
  const [channel, setChannel] = useState<'email' | 'line' | 'sms'>('email')
  const [showQuickReplies, setShowQuickReplies] = useState(false)
  const [useJapanese, setUseJapanese] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)
  const [scheduledDate, setScheduledDate] = useState<Date>()

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim(), channel)
      setMessage('')
    }
  }

  const insertQuickReply = (reply: QuickReply) => {
    const content = useJapanese ? reply.contentJp : reply.content
    setMessage(prev => prev + (prev ? '\n\n' : '') + content)
    setShowQuickReplies(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label>Channel:</Label>
          <Select value={channel} onValueChange={(value: any) => setChannel(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="line">LINE</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="japanese-mode"
            checked={useJapanese}
            onCheckedChange={setUseJapanese}
          />
          <Label htmlFor="japanese-mode" className="text-sm">
            Japanese 日本語
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="schedule-mode"
            checked={showSchedule}
            onCheckedChange={setShowSchedule}
          />
          <Label htmlFor="schedule-mode" className="text-sm">
            Schedule
          </Label>
        </div>
      </div>

      {showSchedule && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Label>Send at:</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-60 justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledDate ? scheduledDate.toLocaleString() : "Pick a date and time"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={setScheduledDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Message</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowQuickReplies(!showQuickReplies)}
          >
            Quick Replies
          </Button>
        </div>

        {showQuickReplies && (
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-2">
                {quickReplies.map((reply) => (
                  <Button
                    key={reply.id}
                    variant="outline"
                    size="sm"
                    className="justify-start text-left h-auto p-2"
                    onClick={() => insertQuickReply(reply)}
                  >
                    <div>
                      <div className="font-medium">
                        {useJapanese ? reply.titleJp : reply.title}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {useJapanese ? reply.contentJp : reply.content}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Textarea
          placeholder={useJapanese ? "メッセージを入力してください..." : "Type your message..."}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className={useJapanese ? "japanese-text" : ""}
          style={useJapanese ? {
            fontFamily: '"Noto Sans JP", "Yu Gothic", "Meiryo", sans-serif'
          } : {}}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Paperclip className="h-4 w-4 mr-2" />
            Attach
          </Button>
          <Button variant="outline" size="sm">
            <Languages className="h-4 w-4 mr-2" />
            Translate
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {showSchedule && scheduledDate && (
            <Button variant="outline" onClick={() => console.log('Scheduling message')}>
              <Clock className="h-4 w-4 mr-2" />
              Schedule
            </Button>
          )}
          <Button onClick={handleSend} disabled={!message.trim()}>
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}