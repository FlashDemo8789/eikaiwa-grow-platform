"use client"

import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { JapaneseAddressForm } from "@/components/ui/japanese/japanese-form"
import { 
  CreditCard, 
  Building, 
  Store, 
  Smartphone,
  Calendar,
  MapPin,
  Shield,
  AlertCircle,
  CheckCircle2,
  Info
} from "lucide-react"

const paymentMethods = [
  {
    value: "credit_card",
    title: "クレジットカード",
    subtitle: "Credit Card",
    icon: CreditCard,
    description: "Visa、Mastercard、JCB、AMEX対応",
    benefits: ["自動引き落とし", "ポイント獲得可能", "手続き簡単"],
    recommended: true
  },
  {
    value: "bank_transfer",
    title: "銀行振込",
    subtitle: "Bank Transfer",
    icon: Building,
    description: "指定口座への月次自動振替",
    benefits: ["手数料なし", "確実な支払い", "家計管理しやすい"],
    recommended: false
  },
  {
    value: "konbini",
    title: "コンビニ払い",
    subtitle: "Convenience Store",
    icon: Store,
    description: "毎月コンビニで現金払い",
    benefits: ["現金で支払い", "24時間対応", "手軽に利用"],
    recommended: false
  },
  {
    value: "paypay",
    title: "PayPay",
    subtitle: "PayPay Payment",
    icon: Smartphone,
    description: "PayPayアプリでの自動支払い",
    benefits: ["スマホで完結", "PayPayポイント獲得", "即時決済"],
    recommended: false
  }
]

const billingCycles = [
  { value: "monthly", label: "月払い", description: "毎月お支払い", discount: 0 },
  { value: "quarterly", label: "3ヶ月払い", description: "3ヶ月分を一括", discount: 5 },
  { value: "semi_annual", label: "6ヶ月払い", description: "6ヶ月分を一括", discount: 10 },
  { value: "annual", label: "年払い", description: "12ヶ月分を一括", discount: 15 }
]

const paymentDays = [
  { value: 5, label: "5日" },
  { value: 10, label: "10日" },
  { value: 15, label: "15日" },
  { value: 20, label: "20日" },
  { value: 25, label: "25日" },
  { value: 28, label: "28日" }
]

const bankList = [
  "みずほ銀行", "三菱UFJ銀行", "三井住友銀行", "りそな銀行", 
  "ゆうちょ銀行", "楽天銀行", "イオン銀行", "住信SBIネット銀行",
  "その他の銀行"
]

export function PaymentSetupStep() {
  const { 
    register, 
    formState: { errors }, 
    setValue, 
    watch 
  } = useFormContext()

  const watchedValues = watch()
  const selectedPaymentMethod = watchedValues.paymentMethod
  const sameAsStudentAddress = watchedValues.billingAddress?.sameAsStudent

  return (
    <div className="space-y-8">
      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5 text-blue-600" />
            お支払い方法
          </CardTitle>
          <CardDescription>
            ご希望のお支払い方法を選択してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {paymentMethods.map((method) => (
              <div
                key={method.value}
                className={`relative p-6 border rounded-xl cursor-pointer transition-all hover:shadow-lg ${
                  selectedPaymentMethod === method.value
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setValue("paymentMethod", method.value)}
              >
                {method.recommended && (
                  <div className="absolute -top-3 left-4">
                    <Badge className="bg-green-500 hover:bg-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      おすすめ
                    </Badge>
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-lg ${
                    selectedPaymentMethod === method.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <method.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{method.title}</h3>
                    <p className="text-sm text-gray-600">{method.subtitle}</p>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{method.description}</p>

                <div className="space-y-2 mb-4">
                  {method.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                <input
                  type="radio"
                  {...register("paymentMethod")}
                  value={method.value}
                  className="text-blue-600 scale-125 absolute top-4 right-4"
                />
              </div>
            ))}
          </div>
          {errors.paymentMethod && (
            <p className="text-sm text-red-600 mt-3">
              {errors.paymentMethod.message as string}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Credit Card Details */}
      {selectedPaymentMethod === "credit_card" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5 text-green-600" />
              クレジットカード情報
            </CardTitle>
            <CardDescription>
              <div className="flex items-center gap-2 text-blue-600">
                <Shield className="h-4 w-4" />
                SSL暗号化により安全に保護されます
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">カード番号 *</Label>
              <Input
                id="cardNumber"
                {...register("cardInfo.cardNumber")}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="mt-1"
              />
              {errors.cardInfo?.cardNumber && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.cardInfo.cardNumber.message as string}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate">有効期限 *</Label>
                <Input
                  id="expiryDate"
                  {...register("cardInfo.expiryDate")}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="mt-1"
                />
                {errors.cardInfo?.expiryDate && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.cardInfo.expiryDate.message as string}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="cvv">CVV *</Label>
                <Input
                  id="cvv"
                  {...register("cardInfo.cvv")}
                  placeholder="123"
                  maxLength={4}
                  className="mt-1"
                />
                {errors.cardInfo?.cvv && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.cardInfo.cvv.message as string}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="holderName">カード名義人 *</Label>
              <Input
                id="holderName"
                {...register("cardInfo.holderName")}
                placeholder="YAMADA TARO"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                カードに記載されている通りにローマ字で入力してください
              </p>
              {errors.cardInfo?.holderName && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.cardInfo.holderName.message as string}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bank Transfer Details */}
      {selectedPaymentMethod === "bank_transfer" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building className="h-5 w-5 text-blue-600" />
              銀行口座情報
            </CardTitle>
            <CardDescription>
              自動振替のための口座情報を入力してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="accountHolder">口座名義人 *</Label>
              <Input
                id="accountHolder"
                {...register("bankInfo.accountHolder")}
                placeholder="ヤマダ タロウ"
                className="mt-1"
              />
              {errors.bankInfo?.accountHolder && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.bankInfo.accountHolder.message as string}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="bankName">銀行名 *</Label>
              <Select
                value={watchedValues.bankInfo?.bankName}
                onValueChange={(value) => setValue("bankInfo.bankName", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="銀行を選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {bankList.map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.bankInfo?.bankName && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.bankInfo.bankName.message as string}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="branchName">支店名 *</Label>
              <Input
                id="branchName"
                {...register("bankInfo.branchName")}
                placeholder="新宿支店"
                className="mt-1"
              />
              {errors.bankInfo?.branchName && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.bankInfo.branchName.message as string}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="accountNumber">口座番号 *</Label>
              <Input
                id="accountNumber"
                {...register("bankInfo.accountNumber")}
                placeholder="1234567"
                className="mt-1"
              />
              {errors.bankInfo?.accountNumber && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.bankInfo.accountNumber.message as string}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing Cycle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-purple-600" />
            お支払いサイクル
          </CardTitle>
          <CardDescription>
            長期一括払いで割引が適用されます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {billingCycles.map((cycle) => (
              <div
                key={cycle.value}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  watchedValues.billingCycle === cycle.value
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200"
                }`}
                onClick={() => setValue("billingCycle", cycle.value)}
              >
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="radio"
                    {...register("billingCycle")}
                    value={cycle.value}
                    className="text-purple-600"
                  />
                  <h3 className="font-semibold">{cycle.label}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">{cycle.description}</p>
                {cycle.discount > 0 && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {cycle.discount}% OFF
                  </Badge>
                )}
              </div>
            ))}
          </div>
          {errors.billingCycle && (
            <p className="text-sm text-red-600 mt-3">
              {errors.billingCycle.message as string}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Payment Day Selection */}
      {(selectedPaymentMethod === "credit_card" || selectedPaymentMethod === "bank_transfer") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-orange-600" />
              引き落とし日
            </CardTitle>
            <CardDescription>
              毎月の引き落とし日を選択してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {paymentDays.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => setValue("paymentDay", day.value)}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    watchedValues.paymentDay === day.value
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-semibold">{day.label}</div>
                </button>
              ))}
            </div>
            {errors.paymentDay && (
              <p className="text-sm text-red-600 mt-3">
                {errors.paymentDay.message as string}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Billing Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-indigo-600" />
            請求書送付先住所
          </CardTitle>
          <CardDescription>
            請求書やレシートの送付先住所を設定してください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Same as student address option */}
          <div className="flex items-center space-x-2">
            <Switch
              id="sameAsStudent"
              checked={sameAsStudentAddress}
              onCheckedChange={(checked) => setValue("billingAddress.sameAsStudent", checked)}
            />
            <Label htmlFor="sameAsStudent">
              生徒の住所と同じ住所を使用する
            </Label>
          </div>

          {/* Address form when different from student address */}
          {!sameAsStudentAddress && (
            <JapaneseAddressForm
              address={watchedValues.billingAddress || {
                zipCode: "",
                prefecture: "",
                city: "",
                town: "",
                building: ""
              }}
              onChange={(address) => {
                Object.keys(address).forEach(key => {
                  if (key !== 'sameAsStudent') {
                    setValue(`billingAddress.${key}`, address[key])
                  }
                })
              }}
              required={!sameAsStudentAddress}
            />
          )}
        </CardContent>
      </Card>

      {/* Payment Information Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                お支払いに関する重要事項
              </h3>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• 初回のお支払いは入学金と初月の月謝を含みます</li>
                <li>• クレジットカードの場合、毎月自動で引き落とされます</li>
                <li>• 銀行振込の場合、口座振替の手続きに1-2週間かかる場合があります</li>
                <li>• コンビニ払いの場合、毎月払込票をお送りします</li>
                <li>• お支払い方法は後から変更することも可能です</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}