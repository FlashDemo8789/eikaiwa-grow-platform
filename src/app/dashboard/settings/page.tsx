'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Building2,
  Users,
  CreditCard,
  Plug,
  Mail,
  Bell,
  Download,
  Languages,
  Shield,
  FileText,
  Upload,
  Save,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit,
  Key,
  AlertTriangle,
  CheckCircle,
  Info,
  MessageSquare,
  Calendar
} from "lucide-react"

// Mock data - replace with actual API calls
const mockSchoolProfile = {
  name: "えいごスクール / English School",
  nameEn: "English School",
  nameJa: "えいごスクール",
  logo: "",
  email: "info@englishschool.com",
  phone: "03-1234-5678",
  address: {
    zipCode: "123-4567",
    prefecture: "東京都",
    city: "渋谷区",
    town: "渋谷1-1-1",
    building: "渋谷ビル3F"
  },
  website: "https://englishschool.com",
  description: "子供から大人まで楽しく学べる英語教室です。",
  descriptionEn: "A fun English school for children and adults.",
  businessHours: "平日 9:00-21:00, 土日 9:00-18:00",
  established: "2020-04-01"
}

const mockUsers = [
  { id: 1, name: "田中 花子", email: "tanaka@school.com", role: "admin", status: "active", lastLogin: "2024-01-15" },
  { id: 2, name: "佐藤 太郎", email: "sato@school.com", role: "teacher", status: "active", lastLogin: "2024-01-14" },
  { id: 3, name: "鈴木 美咲", email: "suzuki@school.com", role: "staff", status: "inactive", lastLogin: "2024-01-10" }
]

const mockEmailTemplates = [
  { id: 1, name: "入学確認 / Enrollment Confirmation", subject: "入学手続き完了のお知らせ", language: "both" },
  { id: 2, name: "月謝請求 / Monthly Payment", subject: "月謝のお支払いについて", language: "both" },
  { id: 3, name: "イベント案内 / Event Notification", subject: "特別イベントのご案内", language: "both" }
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("school")
  const [schoolProfile, setSchoolProfile] = useState(mockSchoolProfile)
  const [users, setUsers] = useState(mockUsers)
  const [emailTemplates, setEmailTemplates] = useState(mockEmailTemplates)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')

  const handleSave = async () => {
    setIsLoading(true)
    setSaveStatus('saving')
    
    // Simulate API call
    setTimeout(() => {
      setSaveStatus('success')
      setIsLoading(false)
      setTimeout(() => setSaveStatus('idle'), 3000)
    }, 1000)
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">設定 / Settings</h1>
          <p className="text-muted-foreground">
            システム設定とアカウント管理 / System configuration and account management
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {saveStatus === 'success' && (
            <div className="flex items-center text-green-600 text-sm">
              <CheckCircle className="h-4 w-4 mr-1" />
              保存完了
            </div>
          )}
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                保存中...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                設定を保存
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
          <TabsTrigger value="school" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">スクール</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">ユーザー</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">料金</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Plug className="h-4 w-4" />
            <span className="hidden sm:inline">連携</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">テンプレート</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">通知</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">データ</span>
          </TabsTrigger>
          <TabsTrigger value="localization" className="flex items-center gap-2">
            <Languages className="h-4 w-4" />
            <span className="hidden sm:inline">言語</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">セキュリティ</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">ログ</span>
          </TabsTrigger>
        </TabsList>

        {/* School Profile Settings */}
        <TabsContent value="school">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  スクール基本情報 / School Profile
                </CardTitle>
                <CardDescription>
                  スクールの基本情報を管理します / Manage your school's basic information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label>スクールロゴ / School Logo</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                      {schoolProfile.logo ? (
                        <img src={schoolProfile.logo} alt="Logo" className="h-full w-full object-cover rounded-lg" />
                      ) : (
                        <Upload className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        アップロード
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        推奨サイズ: 200x200px (PNG, JPG)
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Basic Information */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="schoolNameJa">スクール名（日本語）</Label>
                    <Input
                      id="schoolNameJa"
                      value={schoolProfile.nameJa}
                      onChange={(e) => setSchoolProfile({...schoolProfile, nameJa: e.target.value})}
                      placeholder="えいごスクール"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="schoolNameEn">School Name (English)</Label>
                    <Input
                      id="schoolNameEn"
                      value={schoolProfile.nameEn}
                      onChange={(e) => setSchoolProfile({...schoolProfile, nameEn: e.target.value})}
                      placeholder="English School"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">メールアドレス / Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={schoolProfile.email}
                      onChange={(e) => setSchoolProfile({...schoolProfile, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">電話番号 / Phone</Label>
                    <Input
                      id="phone"
                      value={schoolProfile.phone}
                      onChange={(e) => setSchoolProfile({...schoolProfile, phone: e.target.value})}
                      placeholder="03-1234-5678"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-4">
                  <Label>住所 / Address</Label>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">郵便番号</Label>
                      <Input
                        id="zipCode"
                        value={schoolProfile.address.zipCode}
                        onChange={(e) => setSchoolProfile({
                          ...schoolProfile,
                          address: {...schoolProfile.address, zipCode: e.target.value}
                        })}
                        placeholder="123-4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prefecture">都道府県</Label>
                      <Select
                        value={schoolProfile.address.prefecture}
                        onValueChange={(value) => setSchoolProfile({
                          ...schoolProfile,
                          address: {...schoolProfile.address, prefecture: value}
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="東京都">東京都</SelectItem>
                          <SelectItem value="神奈川県">神奈川県</SelectItem>
                          <SelectItem value="埼玉県">埼玉県</SelectItem>
                          <SelectItem value="千葉県">千葉県</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">市区町村</Label>
                      <Input
                        id="city"
                        value={schoolProfile.address.city}
                        onChange={(e) => setSchoolProfile({
                          ...schoolProfile,
                          address: {...schoolProfile.address, city: e.target.value}
                        })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="town">町名・番地</Label>
                      <Input
                        id="town"
                        value={schoolProfile.address.town}
                        onChange={(e) => setSchoolProfile({
                          ...schoolProfile,
                          address: {...schoolProfile.address, town: e.target.value}
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="building">建物名・部屋番号</Label>
                      <Input
                        id="building"
                        value={schoolProfile.address.building}
                        onChange={(e) => setSchoolProfile({
                          ...schoolProfile,
                          address: {...schoolProfile.address, building: e.target.value}
                        })}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="website">ウェブサイト / Website</Label>
                    <Input
                      id="website"
                      value={schoolProfile.website}
                      onChange={(e) => setSchoolProfile({...schoolProfile, website: e.target.value})}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessHours">営業時間 / Business Hours</Label>
                    <Input
                      id="businessHours"
                      value={schoolProfile.businessHours}
                      onChange={(e) => setSchoolProfile({...schoolProfile, businessHours: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">スクール説明（日本語）</Label>
                  <Textarea
                    id="description"
                    rows={3}
                    value={schoolProfile.description}
                    onChange={(e) => setSchoolProfile({...schoolProfile, description: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descriptionEn">School Description (English)</Label>
                  <Textarea
                    id="descriptionEn"
                    rows={3}
                    value={schoolProfile.descriptionEn}
                    onChange={(e) => setSchoolProfile({...schoolProfile, descriptionEn: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* User Management */}
        <TabsContent value="users">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      ユーザー管理 / User Management
                    </CardTitle>
                    <CardDescription>
                      システムユーザーと権限を管理します / Manage system users and permissions
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    ユーザー追加
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          <div className="text-xs text-muted-foreground">
                            最終ログイン: {user.lastLogin}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={user.role === 'admin' ? 'default' : user.role === 'teacher' ? 'secondary' : 'outline'}
                        >
                          {user.role}
                        </Badge>
                        <Badge 
                          variant={user.status === 'active' ? 'default' : 'secondary'}
                        >
                          {user.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Billing Settings */}
        <TabsContent value="billing">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  料金・請求設定 / Billing Settings
                </CardTitle>
                <CardDescription>
                  料金プランと決済設定を管理します / Manage subscription and payment settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>現在のプラン / Current Plan</Label>
                    <div className="p-4 border rounded-lg bg-blue-50">
                      <div className="font-medium">プロフェッショナルプラン</div>
                      <div className="text-sm text-muted-foreground">月額 ¥29,800</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        生徒数無制限、全機能利用可能
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>次回請求日 / Next Billing Date</Label>
                    <div className="p-4 border rounded-lg">
                      <div className="font-medium">2024年2月1日</div>
                      <div className="text-sm text-muted-foreground">¥29,800</div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base font-medium">決済設定 / Payment Settings</Label>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>請求書送付先メールアドレス</Label>
                      <Input type="email" placeholder="billing@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label>請求書発行日</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="選択してください" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">毎月1日</SelectItem>
                          <SelectItem value="15">毎月15日</SelectItem>
                          <SelectItem value="end">月末</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>支払い方法 / Payment Methods</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5" />
                          <div>
                            <div className="font-medium">**** **** **** 4242</div>
                            <div className="text-sm text-muted-foreground">VISA • 有効期限 12/25</div>
                          </div>
                        </div>
                        <Badge>デフォルト</Badge>
                      </div>
                      <Button variant="outline" className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        カード追加
                      </Button>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    プランのアップグレードやダウングレードはいつでも可能です。変更は次回請求サイクルから適用されます。
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* API Integrations */}
        <TabsContent value="integrations">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plug className="h-5 w-5" />
                  API連携 / Integrations
                </CardTitle>
                <CardDescription>
                  外部サービスとの連携を管理します / Manage external service integrations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* LINE Integration */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">LINE公式アカウント</div>
                        <div className="text-sm text-muted-foreground">保護者との連絡にLINEを使用</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-600">接続済み</Badge>
                      <Switch checked={true} />
                    </div>
                  </div>
                  <div className="pl-13 space-y-2">
                    <Label>Channel Access Token</Label>
                    <div className="flex gap-2">
                      <Input 
                        type={showPassword ? "text" : "password"}
                        value="channel-token-***************"
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Payment Providers */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">決済プロバイダー / Payment Providers</Label>
                  
                  <div className="space-y-4">
                    {/* Stripe */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">Stripe</div>
                          <div className="text-sm text-muted-foreground">クレジットカード決済</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-blue-600">接続済み</Badge>
                        <Switch checked={true} />
                      </div>
                    </div>

                    {/* Bank Transfer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium">銀行振込</div>
                          <div className="text-sm text-muted-foreground">従来の振込決済</div>
                        </div>
                      </div>
                      <Switch checked={false} />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Webhook Settings */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Webhook設定</Label>
                  <div className="space-y-2">
                    <Label>Webhook URL</Label>
                    <Input placeholder="https://your-domain.com/webhooks" />
                  </div>
                  <div className="space-y-2">
                    <Label>署名キー</Label>
                    <Input type="password" placeholder="webhook-signing-key" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="webhook-active" />
                    <Label htmlFor="webhook-active">Webhook を有効にする</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Email Templates */}
        <TabsContent value="templates">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      メール・SMS テンプレート / Email & SMS Templates
                    </CardTitle>
                    <CardDescription>
                      自動送信メールとSMSのテンプレートを管理します 
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    テンプレート追加
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {emailTemplates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Mail className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-muted-foreground">{template.subject}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={template.language === 'both' ? 'default' : 'secondary'}>
                          {template.language === 'both' ? '日英対応' : template.language}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  通知設定 / Notification Preferences
                </CardTitle>
                <CardDescription>
                  通知の受信設定を管理します / Configure notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-base font-medium">メール通知 / Email Notifications</Label>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">新規入学申込</div>
                        <div className="text-sm text-muted-foreground">新しい生徒の入学申込があった時</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">支払い通知</div>
                        <div className="text-sm text-muted-foreground">月謝の支払いが完了した時</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">出席アラート</div>
                        <div className="text-sm text-muted-foreground">生徒の欠席が多い時</div>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">システム更新</div>
                        <div className="text-sm text-muted-foreground">新機能やメンテナンス情報</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base font-medium">LINE通知 / LINE Notifications</Label>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">緊急連絡</div>
                        <div className="text-sm text-muted-foreground">台風や災害時の休校連絡</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">イベント案内</div>
                        <div className="text-sm text-muted-foreground">発表会やパーティーの案内</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base font-medium">通知タイミング / Notification Timing</Label>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>平日の通知時間</Label>
                      <Select defaultValue="9-18">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">24時間</SelectItem>
                          <SelectItem value="9-18">9:00 - 18:00</SelectItem>
                          <SelectItem value="10-17">10:00 - 17:00</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>週末の通知</Label>
                      <Select defaultValue="limited">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="off">無効</SelectItem>
                          <SelectItem value="limited">緊急のみ</SelectItem>
                          <SelectItem value="all">全て</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Data Management */}
        <TabsContent value="data">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  データバックアップ・エクスポート / Data Backup & Export
                </CardTitle>
                <CardDescription>
                  データのバックアップと外部出力を管理します / Manage data backup and export
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-base font-medium">自動バックアップ / Automatic Backup</Label>
                  
                  <div className="p-4 border rounded-lg bg-green-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-900">自動バックアップ有効</span>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="text-sm text-green-700">
                      毎日午前2時に自動バックアップを実行しています。
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      最新バックアップ: 2024年1月15日 02:00
                    </div>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>バックアップ頻度</Label>
                      <Select defaultValue="daily">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">毎日</SelectItem>
                          <SelectItem value="weekly">毎週</SelectItem>
                          <SelectItem value="monthly">毎月</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>保存期間</Label>
                      <Select defaultValue="90">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30日間</SelectItem>
                          <SelectItem value="90">90日間</SelectItem>
                          <SelectItem value="365">1年間</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base font-medium">データエクスポート / Data Export</Label>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <Button variant="outline" className="h-20 flex-col">
                      <Users className="h-6 w-6 mb-2" />
                      生徒データ
                      <span className="text-xs text-muted-foreground">CSV形式</span>
                    </Button>
                    
                    <Button variant="outline" className="h-20 flex-col">
                      <Calendar className="h-6 w-6 mb-2" />
                      出席記録
                      <span className="text-xs text-muted-foreground">Excel形式</span>
                    </Button>
                    
                    <Button variant="outline" className="h-20 flex-col">
                      <CreditCard className="h-6 w-6 mb-2" />
                      支払い履歴
                      <span className="text-xs text-muted-foreground">PDF形式</span>
                    </Button>
                    
                    <Button variant="outline" className="h-20 flex-col">
                      <FileText className="h-6 w-6 mb-2" />
                      全データ
                      <span className="text-xs text-muted-foreground">JSON形式</span>
                    </Button>
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    エクスポートされたデータには個人情報が含まれています。取り扱いには十分ご注意ください。
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Localization */}
        <TabsContent value="localization">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  言語・地域設定 / Language & Localization
                </CardTitle>
                <CardDescription>
                  システムの言語と地域設定を管理します / Configure language and regional settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>デフォルト言語 / Default Language</Label>
                    <Select defaultValue="ja">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ja">日本語</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="both">両言語対応</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>タイムゾーン / Timezone</Label>
                    <Select defaultValue="asia-tokyo">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asia-tokyo">Asia/Tokyo (JST)</SelectItem>
                        <SelectItem value="utc">UTC</SelectItem>
                        <SelectItem value="america-new_york">America/New_York (EST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>日付形式 / Date Format</Label>
                    <Select defaultValue="yyyy-mm-dd">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yyyy-mm-dd">2024年1月15日</SelectItem>
                        <SelectItem value="mm-dd-yyyy">01/15/2024</SelectItem>
                        <SelectItem value="dd-mm-yyyy">15/01/2024</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>通貨 / Currency</Label>
                    <Select defaultValue="jpy">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jpy">日本円 (¥)</SelectItem>
                        <SelectItem value="usd">US Dollar ($)</SelectItem>
                        <SelectItem value="eur">Euro (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base font-medium">多言語対応設定</Label>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">自動翻訳機能</div>
                        <div className="text-sm text-muted-foreground">メールや通知を自動で多言語化</div>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">ふりがな自動生成</div>
                        <div className="text-sm text-muted-foreground">漢字名前に自動でふりがなを付与</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">英語名併記</div>
                        <div className="text-sm text-muted-foreground">日本語名と英語名を両方表示</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  セキュリティ設定 / Security Settings
                </CardTitle>
                <CardDescription>
                  システムのセキュリティ設定を管理します / Configure system security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-base font-medium">二要素認証 / Two-Factor Authentication</Label>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-green-600" />
                        <span className="font-medium">2FA有効化</span>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="text-sm text-muted-foreground mb-3">
                      管理者アカウントは2FAが必須です。スタッフアカウントは任意設定可能。
                    </div>
                    <Button variant="outline" size="sm">
                      <Key className="mr-2 h-4 w-4" />
                      バックアップコード生成
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base font-medium">パスワードポリシー / Password Policy</Label>
                  
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>最小文字数</Label>
                        <Select defaultValue="8">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="6">6文字</SelectItem>
                            <SelectItem value="8">8文字</SelectItem>
                            <SelectItem value="12">12文字</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>パスワード更新頻度</Label>
                        <Select defaultValue="90">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30日</SelectItem>
                            <SelectItem value="90">90日</SelectItem>
                            <SelectItem value="never">更新不要</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="require-uppercase" defaultChecked />
                        <Label htmlFor="require-uppercase">大文字を含む</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="require-numbers" defaultChecked />
                        <Label htmlFor="require-numbers">数字を含む</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="require-symbols" />
                        <Label htmlFor="require-symbols">記号を含む</Label>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base font-medium">ログイン制限 / Login Restrictions</Label>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>最大ログイン試行回数</Label>
                      <Select defaultValue="5">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3回</SelectItem>
                          <SelectItem value="5">5回</SelectItem>
                          <SelectItem value="10">10回</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>アカウントロック時間</Label>
                      <Select defaultValue="30">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15分</SelectItem>
                          <SelectItem value="30">30分</SelectItem>
                          <SelectItem value="60">1時間</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">IPアドレス制限</div>
                      <div className="text-sm text-muted-foreground">特定のIPアドレスからのみアクセス許可</div>
                    </div>
                    <Switch />
                  </div>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    セキュリティ設定を変更すると、全ユーザーに影響する可能性があります。慎重に設定してください。
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Logs */}
        <TabsContent value="logs">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  システムログ・監査証跡 / System Logs & Audit Trail
                </CardTitle>
                <CardDescription>
                  システムの使用履歴と監査ログを確認します / View system usage history and audit logs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全ログ</SelectItem>
                      <SelectItem value="login">ログイン</SelectItem>
                      <SelectItem value="payment">支払い</SelectItem>
                      <SelectItem value="data">データ変更</SelectItem>
                      <SelectItem value="error">エラー</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="7">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">過去24時間</SelectItem>
                      <SelectItem value="7">過去7日</SelectItem>
                      <SelectItem value="30">過去30日</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    ログ出力
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">ログイン</Badge>
                        <span className="text-sm">田中 花子がログインしました</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        2024-01-15 09:15:32
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 pl-16">
                      IP: 192.168.1.100 | ブラウザ: Chrome 120.0
                    </div>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">データ更新</Badge>
                        <span className="text-sm">生徒情報が更新されました (ID: 1234)</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        2024-01-15 09:20:15
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 pl-20">
                      変更者: 佐藤 太郎 | 変更項目: 電話番号
                    </div>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="default">支払い</Badge>
                        <span className="text-sm">月謝支払いが完了しました (¥15,000)</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        2024-01-15 10:30:45
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 pl-16">
                      生徒: 山田 太郎 | 決済方法: クレジットカード
                    </div>
                  </div>

                  <div className="p-3 border rounded-lg border-red-200 bg-red-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="destructive">エラー</Badge>
                        <span className="text-sm">ログイン失敗 (5回連続)</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        2024-01-15 11:45:20
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 pl-14">
                      アカウント: test@example.com | IP: 203.0.113.1 (アカウントロック済み)
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <Button variant="outline">
                    さらに読み込む
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}