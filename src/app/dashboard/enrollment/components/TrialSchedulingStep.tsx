"use client"

import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Calendar,
  Clock,
  Video,
  Users,
  MapPin,
  Gift,
  Star,
  CheckCircle2,
  Info,
  User,
  Camera
} from "lucide-react"

const trialTimeSlots = [
  { value: "09:00", label: "9:00 AM", available: true },
  { value: "10:00", label: "10:00 AM", available: true },
  { value: "11:00", label: "11:00 AM", available: false },
  { value: "13:00", label: "1:00 PM", available: true },
  { value: "14:00", label: "2:00 PM", available: true },
  { value: "15:00", label: "3:00 PM", available: true },
  { value: "16:00", label: "4:00 PM", available: false },
  { value: "17:00", label: "5:00 PM", available: true },
  { value: "18:00", label: "6:00 PM", available: true },
  { value: "19:00", label: "7:00 PM", available: true }
]

const trialBenefits = [
  {
    icon: Gift,
    title: "無料体験レッスン",
    description: "45分間の本格的なレッスンを無料で体験"
  },
  {
    icon: User,
    title: "個別カウンセリング",
    description: "お子さまの英語レベルと学習目標を詳しくお聞きします"
  },
  {
    icon: Star,
    title: "学習プラン提案",
    description: "最適なコースとスケジュールをご提案"
  },
  {
    icon: Camera,
    title: "レッスン見学",
    description: "実際のクラスの様子をご見学いただけます"
  }
]

const trialTypeOptions = [
  {
    value: "in_person",
    title: "対面レッスン",
    subtitle: "In-Person",
    icon: Users,
    description: "教室での対面レッスン",
    benefits: ["直接的なコミュニケーション", "クラスメイトとの交流", "教材を実際に使用"],
    recommended: true
  },
  {
    value: "online",
    title: "オンラインレッスン",
    subtitle: "Online",
    icon: Video,
    description: "ZoomやGoogle Meetでのオンラインレッスン",
    benefits: ["自宅から参加可能", "移動時間不要", "デジタル教材を使用"],
    recommended: false
  }
]

// Generate available dates for the next 30 days (excluding Sundays and some holidays)
const generateAvailableDates = () => {
  const dates = []
  const today = new Date()
  
  for (let i = 1; i <= 30; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    
    // Skip Sundays (0) and some random days for realism
    if (date.getDay() !== 0 && Math.random() > 0.1) {
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('ja-JP', { 
          month: 'long', 
          day: 'numeric',
          weekday: 'short'
        }),
        dayOfWeek: date.getDay(),
        available: Math.random() > 0.2 // 80% chance available
      })
    }
  }
  
  return dates
}

const availableDates = generateAvailableDates()

export function TrialSchedulingStep() {
  const { 
    register, 
    formState: { errors }, 
    setValue, 
    watch 
  } = useFormContext()

  const watchedValues = watch()
  const wantsTrialLesson = watchedValues.wantsTrialLesson
  const selectedTrialType = watchedValues.trialType
  const selectedDate = watchedValues.trialDate
  const selectedTime = watchedValues.trialTime

  return (
    <div className="space-y-8">
      {/* Trial Lesson Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Gift className="h-5 w-5 text-orange-600" />
            無料体験レッスン
          </CardTitle>
          <CardDescription>
            入学前に無料で体験レッスンを受講いただけます
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Trial lesson benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {trialBenefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <benefit.icon className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{benefit.title}</h3>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Trial lesson toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-orange-50 to-yellow-50">
            <div>
              <h3 className="font-semibold text-lg">無料体験レッスンを予約する</h3>
              <p className="text-sm text-gray-600">
                お子さまに最適なレッスンかどうか、まずは体験してみてください
              </p>
            </div>
            <Switch
              id="wantsTrialLesson"
              checked={wantsTrialLesson}
              onCheckedChange={(checked) => setValue("wantsTrialLesson", checked)}
              className="scale-125"
            />
          </div>
        </CardContent>
      </Card>

      {/* Trial Lesson Details */}
      {wantsTrialLesson && (
        <>
          {/* Trial Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Video className="h-5 w-5 text-blue-600" />
                レッスン形式
              </CardTitle>
              <CardDescription>
                体験レッスンの形式を選択してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {trialTypeOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`relative p-6 border rounded-xl cursor-pointer transition-all hover:shadow-lg ${
                      selectedTrialType === option.value
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setValue("trialType", option.value)}
                  >
                    {option.recommended && (
                      <div className="absolute -top-3 left-4">
                        <Badge className="bg-green-500 hover:bg-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          おすすめ
                        </Badge>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-3 rounded-lg ${
                        selectedTrialType === option.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <option.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{option.title}</h3>
                        <p className="text-sm text-gray-600">{option.subtitle}</p>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{option.description}</p>

                    <div className="space-y-2">
                      {option.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>

                    <input
                      type="radio"
                      {...register("trialType")}
                      value={option.value}
                      className="text-blue-600 scale-125 absolute top-4 right-4"
                    />
                  </div>
                ))}
              </div>
              {errors.trialType && (
                <p className="text-sm text-red-600 mt-3">
                  {errors.trialType.message as string}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Date and Time Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
                日程選択
              </CardTitle>
              <CardDescription>
                ご希望の日時を選択してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Selection */}
              <div>
                <Label className="text-base font-medium mb-3 block">希望日 *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
                  {availableDates.map((date) => (
                    <button
                      key={date.value}
                      type="button"
                      disabled={!date.available}
                      onClick={() => setValue("trialDate", date.value)}
                      className={`p-3 border rounded-lg text-center transition-colors ${
                        selectedDate === date.value
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : date.available
                          ? "border-gray-200 hover:border-gray-300"
                          : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <div className="text-sm font-medium">{date.label}</div>
                      {!date.available && (
                        <div className="text-xs text-red-500 mt-1">満席</div>
                      )}
                    </button>
                  ))}
                </div>
                {errors.trialDate && (
                  <p className="text-sm text-red-600 mt-2">
                    {errors.trialDate.message as string}
                  </p>
                )}
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div>
                  <Label className="text-base font-medium mb-3 block">希望時間 *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {trialTimeSlots.map((time) => (
                      <button
                        key={time.value}
                        type="button"
                        disabled={!time.available}
                        onClick={() => setValue("trialTime", time.value)}
                        className={`p-3 border rounded-lg text-center transition-colors ${
                          selectedTime === time.value
                            ? "border-purple-500 bg-purple-50 text-purple-700"
                            : time.available
                            ? "border-gray-200 hover:border-gray-300"
                            : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <Clock className="h-4 w-4 mx-auto mb-1" />
                        <div className="text-sm font-medium">{time.label}</div>
                        {!time.available && (
                          <div className="text-xs text-red-500 mt-1">満席</div>
                        )}
                      </button>
                    ))}
                  </div>
                  {errors.trialTime && (
                    <p className="text-sm text-red-600 mt-2">
                      {errors.trialTime.message as string}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Parent Attendance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-green-600" />
                保護者の参加
              </CardTitle>
              <CardDescription>
                体験レッスンへの保護者の方の参加について
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">保護者も一緒に参加する</h3>
                  <p className="text-sm text-gray-600">
                    お子さまの様子を見学し、レッスンについて直接お話しいただけます
                  </p>
                </div>
                <Switch
                  id="parentAttendance"
                  checked={watchedValues.parentAttendance || false}
                  onCheckedChange={(checked) => setValue("parentAttendance", checked)}
                />
              </div>
              
              {selectedTrialType === "online" && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <Info className="h-4 w-4 inline mr-2" />
                    オンラインレッスンの場合、保護者の方も同じ画面で参加いただけます
                  </p>
                </div>
              )}

              {selectedTrialType === "in_person" && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    <MapPin className="h-4 w-4 inline mr-2" />
                    教室見学も兼ねて、施設をご案内いたします
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Special Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Info className="h-5 w-5 text-indigo-600" />
                体験レッスンに関するご要望
              </CardTitle>
              <CardDescription>
                体験レッスンに関して特別なご要望があれば記入してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="trialNotes">ご要望・ご質問（任意）</Label>
                <Textarea
                  id="trialNotes"
                  {...register("trialNotes")}
                  placeholder="例：人見知りなので最初はゆっくりお願いします、特定のトピックに興味があります、アレルギーについて相談したいです"
                  rows={4}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Booking Summary */}
          {selectedDate && selectedTime && selectedTrialType && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-green-800">
                  <CheckCircle2 className="h-5 w-5" />
                  体験レッスン予約内容
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">レッスン形式:</span>
                    <span className="font-medium text-green-900">
                      {trialTypeOptions.find(t => t.value === selectedTrialType)?.title}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">日程:</span>
                    <span className="font-medium text-green-900">
                      {availableDates.find(d => d.value === selectedDate)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">時間:</span>
                    <span className="font-medium text-green-900">
                      {trialTimeSlots.find(t => t.value === selectedTime)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">保護者参加:</span>
                    <span className="font-medium text-green-900">
                      {watchedValues.parentAttendance ? "あり" : "なし"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">料金:</span>
                    <span className="font-bold text-green-900">無料</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* No Trial Lesson */}
      {!wantsTrialLesson && (
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                体験レッスンをスキップ
              </h3>
              <p className="text-gray-600 mb-4">
                体験レッスンなしで直接入学手続きを進めます
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-yellow-800">
                  <Info className="h-4 w-4 inline mr-2" />
                  後から体験レッスンを予約することも可能です
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}