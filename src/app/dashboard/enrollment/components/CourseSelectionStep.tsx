"use client"

import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  GraduationCap, 
  Users, 
  User, 
  UserCheck,
  Calendar,
  Clock,
  Target,
  Package,
  Star,
  Zap,
  Gift
} from "lucide-react"

const courseTypes = [
  {
    value: "group",
    title: "グループレッスン",
    subtitle: "Group Lessons",
    icon: Users,
    description: "4-6名のクラスメイトと一緒に学習",
    features: ["クラスメイトとの交流", "競争心が刺激される", "リーズナブルな料金"],
    price: "月額 8,800円〜",
    recommended: false
  },
  {
    value: "semi_private", 
    title: "セミプライベート",
    subtitle: "Semi-Private Lessons",
    icon: UserCheck,
    description: "2-3名の少人数制レッスン",
    features: ["個別指導に近い環境", "発話機会が多い", "柔軟なカリキュラム"],
    price: "月額 15,400円〜",
    recommended: true
  },
  {
    value: "private",
    title: "プライベートレッスン",
    subtitle: "Private Lessons", 
    icon: User,
    description: "マンツーマンの集中レッスン",
    features: ["完全オーダーメイド", "最高の学習効果", "フレキシブルな時間設定"],
    price: "月額 22,000円〜",
    recommended: false
  }
]

const courseLevels = [
  { value: "tots", label: "トッツ（2-3歳）", ages: "2-3歳", description: "歌とゲームで英語に慣れ親しむ" },
  { value: "pre_k", label: "プレキンダー（4-5歳）", ages: "4-5歳", description: "アルファベットと基本単語" },
  { value: "elementary_beginner", label: "小学生初級（6-8歳）", ages: "6-8歳", description: "フォニックスと簡単な会話" },
  { value: "elementary_intermediate", label: "小学生中級（9-11歳）", ages: "9-11歳", description: "読み書きと日常会話" },
  { value: "elementary_advanced", label: "小学生上級（10-12歳）", ages: "10-12歳", description: "英検対策と実用英語" },
  { value: "junior_high", label: "中学生コース（13-15歳）", ages: "13-15歳", description: "文法強化と会話実践" },
  { value: "adult_beginner", label: "大人初級（16歳以上）", ages: "16歳〜", description: "基礎から始める英会話" },
  { value: "adult_conversation", label: "大人会話（16歳以上）", ages: "16歳〜", description: "実践的な日常英会話" }
]

const weekDays = [
  { value: "monday", label: "月曜日", shortLabel: "月" },
  { value: "tuesday", label: "火曜日", shortLabel: "火" },
  { value: "wednesday", label: "水曜日", shortLabel: "水" },
  { value: "thursday", label: "木曜日", shortLabel: "木" },
  { value: "friday", label: "金曜日", shortLabel: "金" },
  { value: "saturday", label: "土曜日", shortLabel: "土" },
  { value: "sunday", label: "日曜日", shortLabel: "日" }
]

const timeSlots = [
  { value: "09:00", label: "9:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "13:00", label: "1:00 PM" },
  { value: "14:00", label: "2:00 PM" },
  { value: "15:00", label: "3:00 PM" },
  { value: "16:00", label: "4:00 PM" },
  { value: "17:00", label: "5:00 PM" },
  { value: "18:00", label: "6:00 PM" },
  { value: "19:00", label: "7:00 PM" },
  { value: "20:00", label: "8:00 PM" }
]

const packageTypes = [
  {
    value: "monthly",
    title: "月払い",
    description: "毎月お支払い",
    discount: 0,
    icon: Calendar
  },
  {
    value: "quarterly", 
    title: "3ヶ月一括",
    description: "3ヶ月分を一括払い",
    discount: 5,
    icon: Package
  },
  {
    value: "semi_annual",
    title: "6ヶ月一括",
    description: "6ヶ月分を一括払い",
    discount: 10,
    icon: Star
  },
  {
    value: "annual",
    title: "年間一括",
    description: "12ヶ月分を一括払い",
    discount: 15,
    icon: Zap
  }
]

const additionalServices = [
  { 
    id: "homework_support", 
    label: "宿題サポート", 
    description: "レッスン後の宿題フォロー",
    price: "+1,100円/月"
  },
  { 
    id: "eiken_prep", 
    label: "英検対策", 
    description: "英検合格に向けた特別対策",
    price: "+2,200円/月"
  },
  { 
    id: "conversation_club", 
    label: "会話クラブ", 
    description: "月2回の追加会話練習",
    price: "+1,650円/月"
  },
  { 
    id: "seasonal_camps", 
    label: "季節キャンプ参加権", 
    description: "春夏冬の特別キャンプへの参加権",
    price: "+550円/月"
  },
  { 
    id: "progress_reports", 
    label: "詳細進捗レポート", 
    description: "月次の詳細な学習進捗報告",
    price: "+880円/月"
  }
]

export function CourseSelectionStep() {
  const { 
    register, 
    formState: { errors }, 
    setValue, 
    watch 
  } = useFormContext()

  const watchedValues = watch()
  const selectedCourseType = watchedValues.courseType
  const selectedDays = watchedValues.preferredDays || []
  const selectedTimes = watchedValues.preferredTimes || []
  const selectedPackage = watchedValues.packageType
  const selectedServices = watchedValues.additionalServices || []

  const handleDayToggle = (dayValue: string) => {
    const currentDays = selectedDays
    const newDays = currentDays.includes(dayValue)
      ? currentDays.filter((d: string) => d !== dayValue)
      : [...currentDays, dayValue]
    setValue("preferredDays", newDays)
  }

  const handleTimeToggle = (timeValue: string) => {
    const currentTimes = selectedTimes
    const newTimes = currentTimes.includes(timeValue)
      ? currentTimes.filter((t: string) => t !== timeValue)
      : [...currentTimes, timeValue]
    setValue("preferredTimes", newTimes)
  }

  const handleServiceToggle = (serviceId: string) => {
    const currentServices = selectedServices
    const newServices = currentServices.includes(serviceId)
      ? currentServices.filter((s: string) => s !== serviceId)
      : [...currentServices, serviceId]
    setValue("additionalServices", newServices)
  }

  return (
    <div className="space-y-8">
      {/* Course Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            レッスンタイプ
          </CardTitle>
          <CardDescription>
            ご希望のレッスンスタイルをお選びください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {courseTypes.map((course) => (
              <div
                key={course.value}
                className={`relative p-6 border rounded-xl cursor-pointer transition-all hover:shadow-lg ${
                  selectedCourseType === course.value
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setValue("courseType", course.value)}
              >
                {course.recommended && (
                  <div className="absolute -top-3 left-4">
                    <Badge className="bg-orange-500 hover:bg-orange-600">
                      <Gift className="h-3 w-3 mr-1" />
                      おすすめ
                    </Badge>
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-lg ${
                    selectedCourseType === course.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <course.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{course.title}</h3>
                    <p className="text-sm text-gray-600">{course.subtitle}</p>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{course.description}</p>

                <div className="space-y-2 mb-4">
                  {course.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-600">{course.price}</span>
                  <input
                    type="radio"
                    {...register("courseType")}
                    value={course.value}
                    className="text-blue-600 scale-125"
                  />
                </div>
              </div>
            ))}
          </div>
          {errors.courseType && (
            <p className="text-sm text-red-600 mt-3">
              {errors.courseType.message as string}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Course Level Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-green-600" />
            コースレベル
          </CardTitle>
          <CardDescription>
            生徒さんの年齢と英語レベルに適したコースを選択してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {courseLevels.map((level) => (
              <div
                key={level.value}
                className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                  watchedValues.courseLevel === level.value
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200"
                }`}
                onClick={() => setValue("courseLevel", level.value)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      {...register("courseLevel")}
                      value={level.value}
                      className="text-green-600"
                    />
                    <div>
                      <div className="font-medium">{level.label}</div>
                      <div className="text-sm text-gray-600">
                        {level.ages} • {level.description}
                      </div>
                    </div>
                  </div>
                  {watchedValues.courseLevel === level.value && (
                    <Badge variant="default" className="bg-green-600">
                      選択中
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
          {errors.courseLevel && (
            <p className="text-sm text-red-600 mt-3">
              {errors.courseLevel.message as string}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Schedule Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-purple-600" />
            スケジュール希望
          </CardTitle>
          <CardDescription>
            ご希望の曜日と時間帯を選択してください（複数選択可能）
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preferred Days */}
          <div>
            <Label className="text-base font-medium mb-3 block">希望曜日 *</Label>
            <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
              {weekDays.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => handleDayToggle(day.value)}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    selectedDays.includes(day.value)
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium">{day.shortLabel}</div>
                  <div className="text-xs mt-1 hidden md:block">{day.label}</div>
                </button>
              ))}
            </div>
            {errors.preferredDays && (
              <p className="text-sm text-red-600 mt-2">
                {errors.preferredDays.message as string}
              </p>
            )}
          </div>

          {/* Preferred Times */}
          <div>
            <Label className="text-base font-medium mb-3 block">希望時間 *</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {timeSlots.map((time) => (
                <button
                  key={time.value}
                  type="button"
                  onClick={() => handleTimeToggle(time.value)}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    selectedTimes.includes(time.value)
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Clock className="h-4 w-4 mx-auto mb-1" />
                  <div className="text-sm font-medium">{time.label}</div>
                </button>
              ))}
            </div>
            {errors.preferredTimes && (
              <p className="text-sm text-red-600 mt-2">
                {errors.preferredTimes.message as string}
              </p>
            )}
          </div>

          {/* Start Date */}
          <div>
            <Label htmlFor="startDate" className="text-base font-medium">
              開始希望日 *
            </Label>
            <Input
              id="startDate"
              type="date"
              {...register("startDate")}
              className="mt-2 max-w-xs"
            />
            {errors.startDate && (
              <p className="text-sm text-red-600 mt-1">
                {errors.startDate.message as string}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Package Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5 text-orange-600" />
            料金プラン
          </CardTitle>
          <CardDescription>
            お支払い方法による割引があります
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {packageTypes.map((pkg) => (
              <div
                key={pkg.value}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedPackage === pkg.value
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200"
                }`}
                onClick={() => setValue("packageType", pkg.value)}
              >
                <div className="flex items-center gap-2 mb-3">
                  <pkg.icon className="h-5 w-5 text-orange-600" />
                  <input
                    type="radio"
                    {...register("packageType")}
                    value={pkg.value}
                    className="text-orange-600 ml-auto"
                  />
                </div>
                <h3 className="font-semibold mb-1">{pkg.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{pkg.description}</p>
                {pkg.discount > 0 && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {pkg.discount}% OFF
                  </Badge>
                )}
              </div>
            ))}
          </div>
          {errors.packageType && (
            <p className="text-sm text-red-600 mt-3">
              {errors.packageType.message as string}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Additional Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5 text-yellow-600" />
            オプションサービス
          </CardTitle>
          <CardDescription>
            学習効果を高める追加サービスをお選びください（任意）
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {additionalServices.map((service) => (
              <div
                key={service.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedServices.includes(service.id)
                    ? "border-yellow-500 bg-yellow-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={service.id}
                      checked={selectedServices.includes(service.id)}
                      onCheckedChange={() => handleServiceToggle(service.id)}
                      className="mt-1"
                    />
                    <div>
                      <label htmlFor={service.id} className="font-medium cursor-pointer">
                        {service.label}
                      </label>
                      <p className="text-sm text-gray-600">{service.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs">
                    {service.price}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Goals and Special Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-indigo-600" />
            学習目標・特別なご要望
          </CardTitle>
          <CardDescription>
            学習目標や特別な配慮が必要なことがあれば記入してください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="goals">学習目標（任意）</Label>
            <Textarea
              id="goals"
              {...register("goals")}
              placeholder="例：英検3級合格、日常会話ができるようになりたい、海外旅行で使える英語を身につけたい"
              rows={3}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="specialRequests">特別なご要望（任意）</Label>
            <Textarea
              id="specialRequests"
              {...register("specialRequests")}
              placeholder="例：人見知りなので最初はゆっくりペースで、宿題は少なめにしてほしい、特定の分野に集中したい"
              rows={3}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}