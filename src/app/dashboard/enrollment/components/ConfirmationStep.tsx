"use client"

import { useFormContext } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { 
  Send,
  Mail,
  MessageCircle,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  FileText,
  Shield,
  Eye,
  Calendar,
  CreditCard,
  Users,
  Info
} from "lucide-react"

const confirmationMethods = [
  {
    key: "emailConfirmation",
    title: "メール確認",
    icon: Mail,
    description: "入学手続き完了の確認メールを送信",
    details: "詳細な入学案内、初回レッスンの案内、必要な準備物のリストをお送りします"
  },
  {
    key: "lineConfirmation",
    title: "LINE確認",
    icon: MessageCircle,
    description: "LINEで簡易確認メッセージを送信",
    details: "入学完了の通知と、今後のLINEでの連絡についてご案内します"
  },
  {
    key: "smsConfirmation",
    title: "SMS確認",
    icon: Smartphone,
    description: "携帯電話にショートメッセージを送信",
    details: "緊急時の連絡手段として、SMS通知の設定を確認します"
  }
]

export function ConfirmationStep() {
  const { 
    formState: { errors }, 
    setValue, 
    watch 
  } = useFormContext()

  const watchedValues = watch()

  // Calculate estimated costs
  const calculateEstimatedCost = () => {
    const courseType = watchedValues.courseType
    const packageType = watchedValues.packageType
    const additionalServices = watchedValues.additionalServices || []
    
    let baseCost = 0
    switch (courseType) {
      case 'group':
        baseCost = 8800
        break
      case 'semi_private':
        baseCost = 15400
        break
      case 'private':
        baseCost = 22000
        break
    }
    
    let discount = 0
    switch (packageType) {
      case 'quarterly':
        discount = 5
        break
      case 'semi_annual':
        discount = 10
        break
      case 'annual':
        discount = 15
        break
    }
    
    const servicesCost = additionalServices.length * 1500 // Rough estimate
    const subtotal = baseCost + servicesCost
    const discountAmount = Math.floor(subtotal * discount / 100)
    
    return {
      baseCost,
      servicesCost,
      subtotal,
      discount,
      discountAmount,
      total: subtotal - discountAmount,
      enrollmentFee: 11000
    }
  }

  const costs = calculateEstimatedCost()

  const getSummaryData = () => {
    return {
      student: {
        name: `${watchedValues.studentName?.kanji || ''} (${watchedValues.studentName?.furigana || ''})`,
        romaji: watchedValues.studentName?.romaji || '',
        birthDate: watchedValues.birthDate || '',
        level: watchedValues.englishLevel || ''
      },
      parent: {
        name: `${watchedValues.primaryParent?.name?.kanji || ''} (${watchedValues.primaryParent?.name?.furigana || ''})`,
        email: watchedValues.primaryParent?.email || '',
        phone: watchedValues.primaryParent?.phone || '',
        relationship: watchedValues.primaryParent?.relationship || ''
      },
      course: {
        type: watchedValues.courseType || '',
        level: watchedValues.courseLevel || '',
        days: watchedValues.preferredDays || [],
        times: watchedValues.preferredTimes || [],
        startDate: watchedValues.startDate || '',
        packageType: watchedValues.packageType || ''
      },
      payment: {
        method: watchedValues.paymentMethod || '',
        billingCycle: watchedValues.billingCycle || ''
      },
      trial: {
        wanted: watchedValues.wantsTrialLesson || false,
        type: watchedValues.trialType || '',
        date: watchedValues.trialDate || '',
        time: watchedValues.trialTime || ''
      }
    }
  }

  const summary = getSummaryData()

  return (
    <div className="space-y-8">
      {/* Enrollment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-blue-600" />
            入学手続き内容確認
          </CardTitle>
          <CardDescription>
            入力いただいた内容をご確認ください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Student Information */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              生徒情報
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">お名前:</span>
                  <p className="font-medium">{summary.student.name}</p>
                  <p className="text-sm text-gray-500">{summary.student.romaji}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">生年月日:</span>
                  <p className="font-medium">{summary.student.birthDate}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">英語レベル:</span>
                  <p className="font-medium">{summary.student.level}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Parent Information */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              保護者情報
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">お名前:</span>
                  <p className="font-medium">{summary.parent.name}</p>
                  <p className="text-sm text-gray-500">({summary.parent.relationship})</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">連絡先:</span>
                  <p className="font-medium">{summary.parent.email}</p>
                  <p className="text-sm text-gray-500">{summary.parent.phone}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Course Information */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              コース情報
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">コースタイプ:</span>
                  <p className="font-medium">{summary.course.type}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">レベル:</span>
                  <p className="font-medium">{summary.course.level}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">希望曜日:</span>
                  <p className="font-medium">{summary.course.days.join(', ')}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">希望時間:</span>
                  <p className="font-medium">{summary.course.times.join(', ')}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">開始日:</span>
                  <p className="font-medium">{summary.course.startDate}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">支払いプラン:</span>
                  <p className="font-medium">{summary.course.packageType}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Trial Lesson */}
          {summary.trial.wanted && (
            <>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  体験レッスン
                </h3>
                <div className="bg-green-50 p-4 rounded-lg space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-green-700">レッスン形式:</span>
                      <p className="font-medium text-green-900">{summary.trial.type}</p>
                    </div>
                    <div>
                      <span className="text-sm text-green-700">日程:</span>
                      <p className="font-medium text-green-900">{summary.trial.date} {summary.trial.time}</p>
                    </div>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Payment Information */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              お支払い情報
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">支払い方法:</span>
                  <p className="font-medium">{summary.payment.method}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">支払いサイクル:</span>
                  <p className="font-medium">{summary.payment.billingCycle}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Summary */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-blue-800">
            <CreditCard className="h-5 w-5" />
            料金概算
          </CardTitle>
          <CardDescription>
            入学時の初期費用と月額料金の概算です
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>入学金</span>
              <span className="font-mono">¥{costs.enrollmentFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>月額基本料金</span>
              <span className="font-mono">¥{costs.baseCost.toLocaleString()}</span>
            </div>
            {costs.servicesCost > 0 && (
              <div className="flex justify-between">
                <span>オプションサービス</span>
                <span className="font-mono">¥{costs.servicesCost.toLocaleString()}</span>
              </div>
            )}
            {costs.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>長期割引 ({costs.discount}%)</span>
                <span className="font-mono">-¥{costs.discountAmount.toLocaleString()}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>初回お支払い額</span>
              <span className="font-mono">¥{(costs.enrollmentFee + costs.total).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>月額料金（2回目以降）</span>
              <span className="font-mono">¥{costs.total.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <Info className="h-4 w-4 inline mr-2" />
              料金は概算です。正確な金額は入学手続き完了後にご連絡いたします。
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Send className="h-5 w-5 text-green-600" />
            確認通知設定
          </CardTitle>
          <CardDescription>
            入学手続き完了の通知方法を選択してください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {confirmationMethods.map((method) => (
            <div key={method.key} className="space-y-2">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <method.icon className="h-5 w-5 text-gray-600 mt-1" />
                  <div>
                    <h3 className="font-semibold">{method.title}</h3>
                    <p className="text-sm text-gray-600">{method.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{method.details}</p>
                  </div>
                </div>
                <Switch
                  checked={watchedValues[method.key] || false}
                  onCheckedChange={(checked) => setValue(method.key, checked)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Terms and Privacy */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-red-800">
            <Shield className="h-5 w-5" />
            利用規約・プライバシーポリシー
          </CardTitle>
          <CardDescription>
            ご利用には以下への同意が必要です
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="termsAccepted"
                checked={watchedValues.termsAccepted || false}
                onCheckedChange={(checked) => setValue("termsAccepted", checked)}
                className="mt-1"
              />
              <div>
                <label htmlFor="termsAccepted" className="text-sm font-medium cursor-pointer">
                  利用規約に同意します *
                </label>
                <p className="text-xs text-gray-600 mt-1">
                  レッスンのキャンセルポリシー、受講マナー、料金規定などをご確認ください
                </p>
                <button
                  type="button"
                  className="text-xs text-blue-600 hover:underline mt-1 flex items-center gap-1"
                >
                  <Eye className="h-3 w-3" />
                  利用規約を読む
                </button>
              </div>
            </div>
            
            {errors.termsAccepted && (
              <p className="text-sm text-red-600 ml-6">
                {errors.termsAccepted.message as string}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="privacyAccepted"
                checked={watchedValues.privacyAccepted || false}
                onCheckedChange={(checked) => setValue("privacyAccepted", checked)}
                className="mt-1"
              />
              <div>
                <label htmlFor="privacyAccepted" className="text-sm font-medium cursor-pointer">
                  プライバシーポリシーに同意します *
                </label>
                <p className="text-xs text-gray-600 mt-1">
                  個人情報の収集、利用、管理について定めたポリシーです
                </p>
                <button
                  type="button"
                  className="text-xs text-blue-600 hover:underline mt-1 flex items-center gap-1"
                >
                  <Eye className="h-3 w-3" />
                  プライバシーポリシーを読む
                </button>
              </div>
            </div>
            
            {errors.privacyAccepted && (
              <p className="text-sm text-red-600 ml-6">
                {errors.privacyAccepted.message as string}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Final Notice */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-green-900 mb-2">
                入学手続き完了後の流れ
              </h3>
              <ul className="space-y-2 text-sm text-green-800">
                <li>• 24時間以内に確認メールをお送りします</li>
                <li>• 3営業日以内に担当講師からご挨拶のお電話をいたします</li>
                <li>• レッスン開始1週間前に詳しいご案内をお送りします</li>
                <li>• 教材の準備や初回レッスンの流れをご説明します</li>
                <li>• ご不明な点はいつでもお気軽にお問い合わせください</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}