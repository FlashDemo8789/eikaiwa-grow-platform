"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  Calendar,
  Camera,
  Hash,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  TrendingUp,
  Users,
  Plus,
  Send,
  Edit,
  Trash2,
  Download,
  Upload,
  Star,
  Award,
  PartyPopper,
  CalendarDays,
  Smartphone,
  Instagram,
  Facebook,
  BarChart3,
  Target,
  FileImage,
  Video,
  Palette,
  Sparkles,
  Clock,
  CheckCircle,
  AlertCircle,
  Globe,
  MessageSquare
} from "lucide-react"

// Sample data for demonstration
const socialPosts = [
  {
    id: 1,
    platform: "LINE",
    content: "本日の授業での素晴らしい発音でした！生徒のみなさんの成長を見ることができて嬉しいです。🌟",
    image: "/api/placeholder/400/300",
    scheduledFor: new Date("2025-09-06T10:00:00"),
    status: "scheduled",
    likes: 24,
    shares: 8,
    comments: 12,
    reach: 156
  },
  {
    id: 2,
    platform: "Instagram",
    content: "Today's English conversation class was amazing! 🗣️ Our students showed incredible progress in their pronunciation. #EikaiwaGrow #EnglishLearning #Japan",
    image: "/api/placeholder/400/300",
    scheduledFor: new Date("2025-09-05T15:30:00"),
    status: "published",
    likes: 89,
    shares: 23,
    comments: 31,
    reach: 542
  },
  {
    id: 3,
    platform: "Facebook",
    content: "Celebrating our student Yuki's successful EIKEN Grade 2 pass! 🎉 Congratulations on your hard work and dedication!",
    image: "/api/placeholder/400/300",
    scheduledFor: new Date("2025-09-04T09:00:00"),
    status: "published",
    likes: 67,
    shares: 15,
    comments: 28,
    reach: 392
  }
]

const contentTemplates = [
  {
    id: 1,
    name: "Student Achievement",
    category: "spotlight",
    content: "今日は{student_name}さんの素晴らしい{achievement}を祝いたいと思います！{details} #EikaiwaGrow #StudentSuccess",
    platforms: ["LINE", "Instagram", "Facebook"]
  },
  {
    id: 2,
    name: "Lesson Highlight",
    category: "education",
    content: "本日の{lesson_topic}のレッスンでは、生徒たちが{activity}に挑戦しました。{outcome} #EnglishLearning #EikaiwaGrow",
    platforms: ["LINE", "Instagram"]
  },
  {
    id: 3,
    name: "Event Announcement",
    category: "event",
    content: "{event_name}の開催が決定しました！📅 日時：{date} 場所：{location} {description} お申し込みはお早めに！",
    platforms: ["LINE", "Facebook"]
  }
]

const hashtagSuggestions = [
  "#EikaiwaGrow", "#英会話", "#EnglishLearning", "#EIKEN", "#TOEIC", 
  "#日本", "#Japan", "#EngagementActivities", "#StudentSuccess", "#EnglishConversation",
  "#LanguageLearning", "#Education", "#StudyAbroad", "#BusinessEnglish", "#KidsEnglish"
]

const upcomingEvents = [
  {
    id: 1,
    title: "Halloween Party",
    date: new Date("2025-10-31T18:00:00"),
    description: "Annual Halloween celebration with English games and activities",
    image: "/api/placeholder/300/200"
  },
  {
    id: 2,
    title: "EIKEN Preparation Workshop",
    date: new Date("2025-09-15T14:00:00"),
    description: "Special workshop for Grade 2 and Pre-1 preparation",
    image: "/api/placeholder/300/200"
  },
  {
    id: 3,
    title: "Parent-Teacher Meeting",
    date: new Date("2025-09-20T10:00:00"),
    description: "Monthly progress review and consultation",
    image: "/api/placeholder/300/200"
  }
]

const studentSpotlights = [
  {
    id: 1,
    name: "田中ゆき (Yuki Tanaka)",
    achievement: "EIKEN Grade 2 合格",
    grade: "High School 2年",
    photo: "/api/placeholder/100/100",
    quote: "毎日の練習が実を結びました！",
    progress: "6ヶ月で Grade 3 から Grade 2 へ"
  },
  {
    id: 2,
    name: "佐藤けんた (Kenta Sato)",
    achievement: "英語スピーチコンテスト優勝",
    grade: "Middle School 3年",
    photo: "/api/placeholder/100/100",
    quote: "先生のサポートのおかげです！",
    progress: "発音とプレゼンテーションスキルが大幅向上"
  }
]

export default function SocialMediaHubPage() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["LINE"])
  const [postContent, setPostContent] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [isScheduling, setIsScheduling] = useState(false)
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "LINE":
        return <MessageSquare className="h-4 w-4 text-green-500" />
      case "Instagram":
        return <Instagram className="h-4 w-4 text-pink-500" />
      case "Facebook":
        return <Facebook className="h-4 w-4 text-blue-500" />
      default:
        return <Globe className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Published</Badge>
      case "scheduled":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Scheduled</Badge>
      case "draft":
        return <Badge variant="outline"><Edit className="h-3 w-3 mr-1" />Draft</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Social Media Hub</h1>
          <p className="text-muted-foreground">
            Manage your social media presence across LINE, Instagram, and Facebook
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Social Media Post</DialogTitle>
                <DialogDescription>
                  Create and schedule your social media content across multiple platforms
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Platform Selection */}
                <div className="space-y-2">
                  <Label>Select Platforms</Label>
                  <div className="flex flex-wrap gap-2">
                    {["LINE", "Instagram", "Facebook"].map((platform) => (
                      <Button
                        key={platform}
                        variant={selectedPlatforms.includes(platform) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSelectedPlatforms(prev => 
                            prev.includes(platform)
                              ? prev.filter(p => p !== platform)
                              : [...prev, platform]
                          )
                        }}
                        className="flex items-center gap-2"
                      >
                        {getPlatformIcon(platform)}
                        {platform}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Content Templates */}
                <div className="space-y-2">
                  <Label>Use Template (Optional)</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {contentTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id.toString()}>
                          {template.name} - {template.category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Post Content */}
                <div className="space-y-2">
                  <Label>Post Content</Label>
                  <Textarea
                    placeholder="Write your post content here..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    rows={6}
                  />
                  <div className="text-sm text-muted-foreground">
                    {postContent.length} characters
                  </div>
                </div>

                {/* Hashtag Suggestions */}
                <div className="space-y-2">
                  <Label>Suggested Hashtags</Label>
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                    {hashtagSuggestions.map((hashtag) => (
                      <Button
                        key={hashtag}
                        variant="outline"
                        size="sm"
                        onClick={() => setPostContent(prev => prev + " " + hashtag)}
                        className="text-xs h-6"
                      >
                        {hashtag}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Media Upload */}
                <div className="space-y-2">
                  <Label>Media</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                    <div className="text-center">
                      <Camera className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <div className="mt-4">
                        <Button variant="outline" size="sm">
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Photo/Video
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        PNG, JPG, MP4 up to 10MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Scheduling Options */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="schedule-post"
                      checked={isScheduling}
                      onCheckedChange={setIsScheduling}
                    />
                    <Label htmlFor="schedule-post">Schedule for later</Label>
                  </div>
                  
                  {isScheduling && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Time</Label>
                        <Input
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline">Save as Draft</Button>
                <Button>
                  {isScheduling ? (
                    <>
                      <Clock className="mr-2 h-4 w-4" />
                      Schedule Post
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Publish Now
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="posts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="spotlight">Student Spotlight</TabsTrigger>
          <TabsTrigger value="line-menu">LINE Menu</TabsTrigger>
        </TabsList>

        {/* Posts Tab */}
        <TabsContent value="posts" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">1,090</p>
                    <p className="text-sm text-muted-foreground">Total Reach</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold">180</p>
                    <p className="text-sm text-muted-foreground">Total Likes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Share2 className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">46</p>
                    <p className="text-sm text-muted-foreground">Total Shares</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">71</p>
                    <p className="text-sm text-muted-foreground">Comments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {socialPosts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      {getPlatformIcon(post.platform)}
                      <div>
                        <p className="font-semibold">{post.platform}</p>
                        <p className="text-sm text-muted-foreground">
                          {post.scheduledFor.toLocaleDateString('ja-JP')} {post.scheduledFor.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(post.status)}
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm mb-4">{post.content}</p>
                  
                  {post.image && (
                    <div className="mb-4">
                      <img 
                        src={post.image} 
                        alt="Post image" 
                        className="rounded-lg max-w-xs h-32 object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{post.reach}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Share2 className="h-4 w-4" />
                      <span>{post.shares}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.comments}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Content Calendar</span>
              </CardTitle>
              <CardDescription>
                Plan and schedule your social media content across all platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-4 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center font-semibold p-2 bg-muted rounded">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-4">
                {Array.from({ length: 35 }, (_, i) => {
                  const dayNum = i - 3; // Adjust for calendar start
                  const hasPost = [5, 12, 18, 25].includes(dayNum);
                  
                  return (
                    <div
                      key={i}
                      className={`min-h-20 p-2 border rounded-lg ${
                        dayNum > 0 && dayNum <= 30 ? 'bg-background' : 'bg-muted/50'
                      } ${hasPost ? 'border-primary' : 'border-border'}`}
                    >
                      {dayNum > 0 && dayNum <= 30 && (
                        <>
                          <div className="text-sm font-medium">{dayNum}</div>
                          {hasPost && (
                            <div className="mt-1 space-y-1">
                              <div className="w-full h-2 bg-green-500 rounded text-xs"></div>
                              <div className="w-full h-2 bg-blue-500 rounded text-xs"></div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">Content Templates</h2>
              <p className="text-muted-foreground">Pre-designed templates for different types of posts</p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contentTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {template.name}
                    <Badge variant="outline">{template.category}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{template.content}</p>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold">Compatible Platforms:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.platforms.map((platform) => (
                        <Badge key={platform} variant="secondary" className="text-xs">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button size="sm" className="w-full mt-4">
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Engagement Rate</p>
                    <p className="text-2xl font-bold">8.5%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
                <Progress value={85} className="mt-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Follower Growth</p>
                    <p className="text-2xl font-bold">+24</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
                <p className="text-sm text-green-600 mt-2">+12% from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Best Performing</p>
                    <p className="text-lg font-bold">LINE Posts</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-500" />
                </div>
                <p className="text-sm text-muted-foreground mt-2">Avg. 156 reach</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Peak Hours</p>
                    <p className="text-lg font-bold">3-5 PM</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
                <p className="text-sm text-muted-foreground mt-2">JST weekdays</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Platform Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="h-5 w-5 text-green-500" />
                    <span>LINE</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">Average Reach: 156</p>
                      <p className="text-xs text-muted-foreground">Engagement: 9.2%</p>
                    </div>
                    <Progress value={92} className="w-20" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Instagram className="h-5 w-5 text-pink-500" />
                    <span>Instagram</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">Average Reach: 542</p>
                      <p className="text-xs text-muted-foreground">Engagement: 7.8%</p>
                    </div>
                    <Progress value={78} className="w-20" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Facebook className="h-5 w-5 text-blue-500" />
                    <span>Facebook</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">Average Reach: 392</p>
                      <p className="text-xs text-muted-foreground">Engagement: 6.1%</p>
                    </div>
                    <Progress value={61} className="w-20" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Student Spotlight Tab */}
        <TabsContent value="spotlight" className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">Student Spotlight</h2>
              <p className="text-muted-foreground">Celebrate student achievements and success stories</p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Spotlight
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {studentSpotlights.map((student) => (
              <Card key={student.id}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={student.photo} alt={student.name} />
                      <AvatarFallback>{student.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-bold">{student.name}</h3>
                        <Badge variant="outline">{student.grade}</Badge>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-3">
                        <Award className="h-4 w-4 text-yellow-500" />
                        <span className="font-semibold text-yellow-600">{student.achievement}</span>
                      </div>
                      
                      <blockquote className="text-sm italic mb-3">
                        "{student.quote}"
                      </blockquote>
                      
                      <p className="text-sm text-muted-foreground mb-4">
                        {student.progress}
                      </p>
                      
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Camera className="mr-2 h-4 w-4" />
                          Create Post
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="mr-2 h-4 w-4" />
                          Share Story
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PartyPopper className="h-5 w-5" />
                <span>Upcoming Events to Promote</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {upcomingEvents.map((event) => (
                  <Card key={event.id}>
                    <CardContent className="p-4">
                      <div className="aspect-video bg-muted rounded-lg mb-3 overflow-hidden">
                        <img 
                          src={event.image} 
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <h4 className="font-semibold mb-2">{event.title}</h4>
                      
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <CalendarDays className="h-4 w-4 mr-1" />
                        {event.date.toLocaleDateString('ja-JP')}
                      </div>
                      
                      <p className="text-sm mb-3">{event.description}</p>
                      
                      <Button size="sm" className="w-full">
                        <Send className="mr-2 h-4 w-4" />
                        Promote Event
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LINE Rich Menu Tab */}
        <TabsContent value="line-menu" className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">LINE Rich Menu Management</h2>
              <p className="text-muted-foreground">Configure and manage your LINE Rich Menu interface</p>
            </div>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit Menu
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Rich Menu</CardTitle>
                <CardDescription>Active menu displayed to LINE followers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Mock Rich Menu Layout */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-200">
                    <div className="text-center mb-4">
                      <h3 className="font-bold text-blue-800">EikaiwaGrow 英会話</h3>
                      <p className="text-sm text-blue-600">Your English Learning Partner</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white rounded p-3 text-center border">
                        <Calendar className="h-6 w-6 mx-auto mb-1 text-blue-500" />
                        <p className="text-xs font-medium">レッスン予約</p>
                      </div>
                      <div className="bg-white rounded p-3 text-center border">
                        <Users className="h-6 w-6 mx-auto mb-1 text-green-500" />
                        <p className="text-xs font-medium">生徒情報</p>
                      </div>
                      <div className="bg-white rounded p-3 text-center border">
                        <Award className="h-6 w-6 mx-auto mb-1 text-yellow-500" />
                        <p className="text-xs font-medium">成績確認</p>
                      </div>
                      <div className="bg-white rounded p-3 text-center border">
                        <MessageCircle className="h-6 w-6 mx-auto mb-1 text-purple-500" />
                        <p className="text-xs font-medium">お問い合わせ</p>
                      </div>
                      <div className="bg-white rounded p-3 text-center border">
                        <FileImage className="h-6 w-6 mx-auto mb-1 text-pink-500" />
                        <p className="text-xs font-medium">イベント</p>
                      </div>
                      <div className="bg-white rounded p-3 text-center border">
                        <Sparkles className="h-6 w-6 mx-auto mb-1 text-orange-500" />
                        <p className="text-xs font-medium">キャンペーン</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Status: Active</span>
                    <span>Last Updated: 2025-08-15</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Menu Analytics</CardTitle>
                <CardDescription>Rich Menu interaction statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">レッスン予約</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                        </div>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">お問い合わせ</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: "68%" }}></div>
                        </div>
                        <span className="text-sm font-medium">68%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">成績確認</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "52%" }}></div>
                        </div>
                        <span className="text-sm font-medium">52%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">イベント</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div className="bg-pink-500 h-2 rounded-full" style={{ width: "41%" }}></div>
                        </div>
                        <span className="text-sm font-medium">41%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">生徒情報</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: "38%" }}></div>
                        </div>
                        <span className="text-sm font-medium">38%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">キャンペーン</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div className="bg-orange-500 h-2 rounded-full" style={{ width: "29%" }}></div>
                        </div>
                        <span className="text-sm font-medium">29%</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Interactions</span>
                      <span className="font-medium">2,847</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">This Month</span>
                      <span className="font-medium text-green-600">+18%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Menu Design Templates</CardTitle>
              <CardDescription>Pre-designed templates for different seasons and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="aspect-video bg-gradient-to-br from-orange-100 to-red-100 rounded flex items-center justify-center">
                    <PartyPopper className="h-8 w-8 text-orange-500" />
                  </div>
                  <h4 className="font-semibold">Halloween Special</h4>
                  <p className="text-sm text-muted-foreground">October campaign design</p>
                  <Button size="sm" variant="outline" className="w-full">Apply Template</Button>
                </div>
                
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="aspect-video bg-gradient-to-br from-red-100 to-green-100 rounded flex items-center justify-center">
                    <Star className="h-8 w-8 text-red-500" />
                  </div>
                  <h4 className="font-semibold">Christmas Holiday</h4>
                  <p className="text-sm text-muted-foreground">December celebration theme</p>
                  <Button size="sm" variant="outline" className="w-full">Apply Template</Button>
                </div>
                
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="aspect-video bg-gradient-to-br from-pink-100 to-purple-100 rounded flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-pink-500" />
                  </div>
                  <h4 className="font-semibold">Spring New Term</h4>
                  <p className="text-sm text-muted-foreground">April enrollment campaign</p>
                  <Button size="sm" variant="outline" className="w-full">Apply Template</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}