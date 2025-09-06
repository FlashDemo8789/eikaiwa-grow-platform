'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Users, 
  Gift, 
  Code, 
  TrendingUp, 
  MessageCircle, 
  Trophy, 
  Calendar,
  Heart,
  BarChart3,
  QrCode,
  Copy,
  Share2,
  Star,
  DollarSign,
  Bell,
  Target,
  Award,
  Download,
  Mail,
  Phone,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Plus
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { QRCodeCanvas } from 'qrcode.react'

// Mock data for referrals system
const mockReferrals = [
  {
    id: "R001",
    referrer: {
      name: "田中 花子",
      nameEn: "Hanako Tanaka",
      email: "h.tanaka@email.com",
      phone: "090-1234-5678",
      avatar: "/avatars/default.svg",
      type: "parent"
    },
    referee: {
      name: "佐藤 太郎",
      nameEn: "Taro Sato", 
      email: "t.sato@email.com",
      enrolled: true,
      enrolledAt: "2024-08-15"
    },
    code: "HANAKO2024",
    status: "completed",
    reward: { type: "discount", value: 10000, description: "2ヶ月分の授業料割引" },
    createdAt: "2024-07-01",
    completedAt: "2024-08-15"
  },
  {
    id: "R002", 
    referrer: {
      name: "山田 次郎",
      nameEn: "Jiro Yamada",
      email: "j.yamada@email.com",
      phone: "090-2345-6789",
      avatar: "/avatars/default.svg",
      type: "student"
    },
    referee: {
      name: "鈴木 美咲",
      nameEn: "Misaki Suzuki",
      email: "m.suzuki@email.com",
      enrolled: false
    },
    code: "JIRO2024",
    status: "pending",
    reward: { type: "gift", value: 5000, description: "図書カード5,000円分" },
    createdAt: "2024-08-20"
  }
]

const mockCampaigns = [
  {
    id: "C001",
    name: "夏休み特別紹介キャンペーン",
    nameEn: "Summer Special Referral Campaign",
    description: "夏休み期間中の紹介で特別ボーナス",
    startDate: "2024-07-01",
    endDate: "2024-08-31",
    status: "active",
    bonusReward: { type: "discount", value: 15000, description: "通常の1.5倍の割引" },
    referrals: 12,
    target: 20
  },
  {
    id: "C002",
    name: "兄弟姉妹紹介プログラム", 
    nameEn: "Sibling Referral Program",
    description: "兄弟姉妹の紹介で家族割引適用",
    startDate: "2024-09-01",
    endDate: "2024-12-31",
    status: "upcoming",
    bonusReward: { type: "family_discount", value: 20000, description: "家族割引月額20%オフ" },
    referrals: 0,
    target: 15
  }
]

const leaderboardData = [
  { rank: 1, name: "田中 花子", referrals: 8, rewards: 45000, avatar: "/avatars/default.svg" },
  { rank: 2, name: "山田 次郎", referrals: 6, rewards: 30000, avatar: "/avatars/default.svg" },
  { rank: 3, name: "佐藤 美咲", referrals: 5, rewards: 25000, avatar: "/avatars/default.svg" },
  { rank: 4, name: "鈴木 健太", referrals: 4, rewards: 20000, avatar: "/avatars/default.svg" },
  { rank: 5, name: "高橋 愛", referrals: 3, rewards: 15000, avatar: "/avatars/default.svg" }
]

export default function ReferralsPage() {
  const [selectedTab, setSelectedTab] = useState("overview")
  const [showCreateCampaign, setShowCreateCampaign] = useState(false)
  const [showReferralCode, setShowReferralCode] = useState(false)
  const [selectedReferrer, setSelectedReferrer] = useState("")
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    nameEn: "",
    description: "",
    startDate: "",
    endDate: "",
    rewardType: "",
    rewardValue: "",
    target: ""
  })
  const { toast } = useToast()

  // Generate referral code
  const generateReferralCode = (name: string) => {
    const cleanName = name.replace(/[^a-zA-Z]/g, '').toUpperCase()
    const year = new Date().getFullYear()
    return `${cleanName}${year}`
  }

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "コピーしました！",
      description: "紹介コードがクリップボードにコピーされました"
    })
  }

  // Send referral link
  const sendReferralLink = (method: 'email' | 'sms', referralCode: string) => {
    const baseUrl = "https://eikaiwa-grow.com/referral"
    const referralUrl = `${baseUrl}?code=${referralCode}`
    
    if (method === 'email') {
      const subject = "EikaiwaGrowをご紹介します"
      const body = `こんにちは！\n\n私が通っているEikaiwaGrowという英会話スクールをご紹介させていただきます。\n\n紹介コード: ${referralCode}\n登録URL: ${referralUrl}\n\nこのコードを使ってご登録いただくと、お得な特典がございます。\n\nよろしくお願いいたします。`
      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    } else {
      const message = `EikaiwaGrowのご紹介です。コード: ${referralCode} URL: ${referralUrl}`
      window.location.href = `sms:?body=${encodeURIComponent(message)}`
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">紹介システム</h1>
          <p className="text-muted-foreground">
            口コミマーケティングを活用した紹介プログラムの管理
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" />
            詳細分析
          </Button>
          <Dialog open={showCreateCampaign} onOpenChange={setShowCreateCampaign}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                新規キャンペーン
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>新規紹介キャンペーン作成</DialogTitle>
                <DialogDescription>
                  特別な紹介期間のキャンペーンを設定します
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="campaignName" className="text-right">
                    キャンペーン名
                  </Label>
                  <Input
                    id="campaignName"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="campaignNameEn" className="text-right">
                    英語名
                  </Label>
                  <Input
                    id="campaignNameEn"
                    value={newCampaign.nameEn}
                    onChange={(e) => setNewCampaign({...newCampaign, nameEn: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="startDate" className="text-right">
                    開始日
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newCampaign.startDate}
                    onChange={(e) => setNewCampaign({...newCampaign, startDate: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="endDate" className="text-right">
                    終了日
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newCampaign.endDate}
                    onChange={(e) => setNewCampaign({...newCampaign, endDate: e.target.value})}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateCampaign(false)}>
                  キャンセル
                </Button>
                <Button onClick={() => {
                  toast({
                    title: "成功",
                    description: "キャンペーンを作成しました"
                  })
                  setShowCreateCampaign(false)
                }}>
                  作成
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総紹介数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              <ArrowUpRight className="inline h-3 w-3 text-green-600" />
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
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground">
              <ArrowUpRight className="inline h-3 w-3 text-green-600" />
              +5% 前月比
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総報酬額</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥180,000</div>
            <p className="text-xs text-muted-foreground">
              <ArrowUpRight className="inline h-3 w-3 text-green-600" />
              +25% 前月比
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">アクティブ紹介者</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              <ArrowUpRight className="inline h-3 w-3 text-green-600" />
              +3 今月
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="tracking">追跡</TabsTrigger>
          <TabsTrigger value="rewards">報酬</TabsTrigger>
          <TabsTrigger value="codes">コード</TabsTrigger>
          <TabsTrigger value="campaigns">キャンペーン</TabsTrigger>
          <TabsTrigger value="leaderboard">ランキング</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Referral Success Rate */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  紹介成功率
                </CardTitle>
                <CardDescription>月別の成約パフォーマンス</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>8月</span>
                    <span>75% (12/16)</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span>7月</span>
                    <span>62% (8/13)</span>
                  </div>
                  <Progress value={62} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span>6月</span>
                    <span>68% (15/22)</span>
                  </div>
                  <Progress value={68} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Top Referrers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  トップ紹介者
                </CardTitle>
                <CardDescription>今月の優秀紹介者</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboardData.slice(0, 3).map((person, index) => (
                    <div key={person.rank} className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        {person.rank}
                      </div>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={person.avatar} />
                        <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{person.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {person.referrals}件 / ¥{person.rewards.toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="secondary">{person.referrals}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Referrals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                最近の紹介
              </CardTitle>
              <CardDescription>直近の紹介活動</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockReferrals.map((referral) => (
                  <div key={referral.id} className="flex items-center gap-4 p-4 rounded-lg border">
                    <Avatar>
                      <AvatarImage src={referral.referrer.avatar} />
                      <AvatarFallback>{referral.referrer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{referral.referrer.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {referral.referrer.type === 'parent' ? '保護者' : '生徒'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {referral.referee.name}さんを紹介
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={referral.status === 'completed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {referral.status === 'completed' ? '成約済み' : '待機中'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {referral.completedAt ? 
                            `成約: ${new Date(referral.completedAt).toLocaleDateString('ja-JP')}` :
                            `紹介: ${new Date(referral.createdAt).toLocaleDateString('ja-JP')}`
                          }
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">
                        {referral.reward.type === 'discount' ? '割引' : 'ギフト'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ¥{referral.reward.value.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tracking Tab */}
        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                紹介追跡システム
              </CardTitle>
              <CardDescription>生徒・保護者別の紹介状況管理</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>紹介者</TableHead>
                    <TableHead>種別</TableHead>
                    <TableHead>紹介コード</TableHead>
                    <TableHead>被紹介者</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead>作成日</TableHead>
                    <TableHead>報酬</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockReferrals.map((referral) => (
                    <TableRow key={referral.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={referral.referrer.avatar} />
                            <AvatarFallback>{referral.referrer.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{referral.referrer.name}</p>
                            <p className="text-xs text-muted-foreground">{referral.referrer.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {referral.referrer.type === 'parent' ? '保護者' : '生徒'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {referral.code}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(referral.code)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{referral.referee.name}</p>
                          <p className="text-xs text-muted-foreground">{referral.referee.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {referral.status === 'completed' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-600" />
                          )}
                          <Badge 
                            variant={referral.status === 'completed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {referral.status === 'completed' ? '成約済み' : '待機中'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(referral.createdAt).toLocaleDateString('ja-JP')}
                      </TableCell>
                      <TableCell>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">
                            ¥{referral.reward.value.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {referral.reward.type === 'discount' ? '割引' : 'ギフト'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost">
                            <Mail className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Bell className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Discount Rewards */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  割引報酬設定
                </CardTitle>
                <CardDescription>授業料割引による報酬システム</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">標準紹介割引</h4>
                  <p className="text-2xl font-bold text-green-600">¥10,000</p>
                  <p className="text-sm text-muted-foreground">2ヶ月分の授業料から割引</p>
                  <Badge variant="secondary" className="mt-2">アクティブ</Badge>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">家族割引</h4>
                  <p className="text-2xl font-bold text-blue-600">20%</p>
                  <p className="text-sm text-muted-foreground">兄弟姉妹の月額料金から永続割引</p>
                  <Badge variant="secondary" className="mt-2">アクティブ</Badge>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">友人紹介割引</h4>
                  <p className="text-2xl font-bold text-purple-600">¥15,000</p>
                  <p className="text-sm text-muted-foreground">同学年の友人紹介時の特別割引</p>
                  <Badge variant="secondary" className="mt-2">アクティブ</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Gift Rewards */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  ギフト報酬設定
                </CardTitle>
                <CardDescription>日本文化を考慮したギフト選択</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">図書カード</h4>
                  <p className="text-2xl font-bold text-green-600">¥5,000</p>
                  <p className="text-sm text-muted-foreground">教育に使える実用的なギフト</p>
                  <Badge variant="default" className="mt-2">人気</Badge>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">QUOカード</h4>
                  <p className="text-2xl font-bold text-blue-600">¥3,000</p>
                  <p className="text-sm text-muted-foreground">コンビニで利用可能</p>
                  <Badge variant="secondary" className="mt-2">アクティブ</Badge>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">カタログギフト</h4>
                  <p className="text-2xl font-bold text-purple-600">¥8,000</p>
                  <p className="text-sm text-muted-foreground">お中元・お歳暮スタイル</p>
                  <Badge variant="secondary" className="mt-2">季節限定</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reward Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>報酬分析</CardTitle>
              <CardDescription>報酬タイプ別の選択率と効果</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4">
                  <div className="text-3xl font-bold text-green-600 mb-2">65%</div>
                  <div className="text-sm font-medium">割引選択率</div>
                  <div className="text-xs text-muted-foreground">最も人気の報酬タイプ</div>
                </div>
                
                <div className="text-center p-4">
                  <div className="text-3xl font-bold text-blue-600 mb-2">25%</div>
                  <div className="text-sm font-medium">ギフト選択率</div>
                  <div className="text-xs text-muted-foreground">図書カードが最人気</div>
                </div>
                
                <div className="text-center p-4">
                  <div className="text-3xl font-bold text-purple-600 mb-2">10%</div>
                  <div className="text-sm font-medium">家族割引</div>
                  <div className="text-xs text-muted-foreground">兄弟姉妹紹介</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Codes Tab */}
        <TabsContent value="codes" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Code Generation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  紹介コード生成
                </CardTitle>
                <CardDescription>個人専用の紹介コードを作成</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="referrer-select">紹介者を選択</Label>
                  <Select value={selectedReferrer} onValueChange={setSelectedReferrer}>
                    <SelectTrigger>
                      <SelectValue placeholder="紹介者を選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tanaka">田中 花子 (保護者)</SelectItem>
                      <SelectItem value="yamada">山田 次郎 (生徒)</SelectItem>
                      <SelectItem value="sato">佐藤 美咲 (保護者)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedReferrer && (
                  <div className="space-y-3">
                    <div className="p-4 bg-muted rounded-lg">
                      <Label className="text-sm font-medium">生成された紹介コード</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <code className="flex-1 text-lg font-mono bg-white px-3 py-2 rounded border">
                          {selectedReferrer === 'tanaka' ? 'HANAKO2024' :
                           selectedReferrer === 'yamada' ? 'JIRO2024' : 'MISAKI2024'}
                        </code>
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard(
                            selectedReferrer === 'tanaka' ? 'HANAKO2024' :
                            selectedReferrer === 'yamada' ? 'JIRO2024' : 'MISAKI2024'
                          )}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => sendReferralLink('email', selectedReferrer === 'tanaka' ? 'HANAKO2024' : selectedReferrer === 'yamada' ? 'JIRO2024' : 'MISAKI2024')}
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        メール送信
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => sendReferralLink('sms', selectedReferrer === 'tanaka' ? 'HANAKO2024' : selectedReferrer === 'yamada' ? 'JIRO2024' : 'MISAKI2024')}
                      >
                        <Phone className="mr-2 h-4 w-4" />
                        SMS送信
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* QR Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  QRコード生成
                </CardTitle>
                <CardDescription>簡単共有のためのQRコード</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedReferrer && (
                  <div className="text-center space-y-3">
                    <div className="flex justify-center">
                      <div className="p-4 bg-white rounded-lg border">
                        <QRCodeCanvas
                          value={`https://eikaiwa-grow.com/referral?code=${
                            selectedReferrer === 'tanaka' ? 'HANAKO2024' :
                            selectedReferrer === 'yamada' ? 'JIRO2024' : 'MISAKI2024'
                          }`}
                          size={150}
                          level="M"
                          includeMargin
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      このQRコードをスキャンして紹介登録
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        ダウンロード
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Share2 className="mr-2 h-4 w-4" />
                        共有
                      </Button>
                    </div>
                  </div>
                )}
                
                {!selectedReferrer && (
                  <div className="text-center py-8 text-muted-foreground">
                    紹介者を選択するとQRコードが生成されます
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Active Codes List */}
          <Card>
            <CardHeader>
              <CardTitle>アクティブな紹介コード</CardTitle>
              <CardDescription>現在使用中の紹介コード一覧</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>紹介者</TableHead>
                    <TableHead>コード</TableHead>
                    <TableHead>作成日</TableHead>
                    <TableHead>使用回数</TableHead>
                    <TableHead>成約数</TableHead>
                    <TableHead>成功率</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockReferrals.map((referral) => (
                    <TableRow key={referral.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={referral.referrer.avatar} />
                            <AvatarFallback>{referral.referrer.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{referral.referrer.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded text-sm">
                          {referral.code}
                        </code>
                      </TableCell>
                      <TableCell>{new Date(referral.createdAt).toLocaleDateString('ja-JP')}</TableCell>
                      <TableCell>3</TableCell>
                      <TableCell>{referral.status === 'completed' ? '1' : '0'}</TableCell>
                      <TableCell>
                        <Badge variant={referral.status === 'completed' ? 'default' : 'secondary'}>
                          {referral.status === 'completed' ? '33%' : '0%'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" onClick={() => copyToClipboard(referral.code)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <QrCode className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Share2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                特別紹介キャンペーン
              </CardTitle>
              <CardDescription>期間限定の紹介促進キャンペーン管理</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCampaigns.map((campaign) => (
                  <div key={campaign.id} className="border rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">{campaign.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{campaign.nameEn}</p>
                        <p className="text-sm">{campaign.description}</p>
                      </div>
                      <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                        {campaign.status === 'active' ? 'アクティブ' : '予定'}
                      </Badge>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3 mb-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">期間</Label>
                        <p className="text-sm font-medium">
                          {new Date(campaign.startDate).toLocaleDateString('ja-JP')} - {new Date(campaign.endDate).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">進捗</Label>
                        <div className="flex items-center gap-2">
                          <Progress value={(campaign.referrals / campaign.target) * 100} className="flex-1 h-2" />
                          <span className="text-sm">{campaign.referrals}/{campaign.target}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">特典</Label>
                        <p className="text-sm font-medium text-green-600">
                          ¥{campaign.bonusReward.value.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        {campaign.bonusReward.description}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <BarChart3 className="mr-2 h-3 w-3" />
                          詳細
                        </Button>
                        <Button size="sm" variant="outline">
                          編集
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Thank You Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                自動お礼メッセージ
              </CardTitle>
              <CardDescription>紹介成功時の自動感謝メッセージ設定</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">紹介完了メッセージ</h4>
                    <Badge variant="secondary">アクティブ</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    紹介者への感謝メッセージ（成約時自動送信）
                  </p>
                  <div className="bg-muted p-3 rounded text-sm">
                    "{`{name}`}様<br/><br/>
                    この度は、EikaiwaGrowをご紹介いただき、誠にありがとうございました。<br/>
                    おかげさまで、{`{referee_name}`}様にご入会いただくことができました。<br/><br/>
                    心ばかりの感謝の気持ちとして、{`{reward}`}をご用意させていただきました。<br/><br/>
                    今後ともどうぞよろしくお願いいたします。<br/><br/>
                    EikaiwaGrow運営チーム
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">新規登録歓迎メッセージ</h4>
                    <Badge variant="secondary">アクティブ</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    被紹介者への歓迎メッセージ（登録時自動送信）
                  </p>
                  <div className="bg-muted p-3 rounded text-sm">
                    "{`{referee_name}`}様<br/><br/>
                    EikaiwaGrowへようこそ！<br/>
                    {`{referrer_name}`}様のご紹介により、ご入会いただき、ありがとうございます。<br/><br/>
                    紹介特典として、{`{discount}`}を適用させていただきました。<br/><br/>
                    充実した英語学習の時間をお過ごしください。<br/><br/>
                    EikaiwaGrow運営チーム
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                紹介ランキング
              </CardTitle>
              <CardDescription>月間トップ紹介者ランキング</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboardData.map((person, index) => (
                  <div key={person.rank} className={`flex items-center gap-4 p-4 rounded-lg border ${index < 3 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200' : ''}`}>
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground text-lg font-bold">
                      {person.rank <= 3 ? (
                        <Trophy className={`h-6 w-6 ${person.rank === 1 ? 'text-yellow-300' : person.rank === 2 ? 'text-gray-300' : 'text-orange-300'}`} />
                      ) : (
                        person.rank
                      )}
                    </div>
                    
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={person.avatar} />
                      <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{person.name}</h3>
                        {person.rank === 1 && <Badge className="bg-yellow-500">今月のMVP</Badge>}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {person.referrals}件の紹介
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          ¥{person.rewards.toLocaleString()}の報酬
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {person.referrals}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        紹介数
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Awards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  今月のMVP
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <Avatar className="h-16 w-16 mx-auto">
                    <AvatarImage src={leaderboardData[0].avatar} />
                    <AvatarFallback>{leaderboardData[0].name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold">{leaderboardData[0].name}</h3>
                  <p className="text-sm text-muted-foreground">8件の紹介で1位獲得</p>
                  <Badge className="bg-yellow-500">特別ボーナス対象</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  急上昇賞
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <Avatar className="h-16 w-16 mx-auto">
                    <AvatarImage src={leaderboardData[1].avatar} />
                    <AvatarFallback>{leaderboardData[1].name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold">{leaderboardData[1].name}</h3>
                  <p className="text-sm text-muted-foreground">前月比+300%成長</p>
                  <Badge variant="secondary">成長賞</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-pink-500" />
                  継続紹介賞
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <Avatar className="h-16 w-16 mx-auto">
                    <AvatarImage src={leaderboardData[2].avatar} />
                    <AvatarFallback>{leaderboardData[2].name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold">{leaderboardData[2].name}</h3>
                  <p className="text-sm text-muted-foreground">6ヶ月連続紹介達成</p>
                  <Badge variant="outline">継続賞</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}