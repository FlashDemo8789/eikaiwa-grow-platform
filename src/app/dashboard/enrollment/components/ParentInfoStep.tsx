"use client"

import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { JapaneseNameForm, JapaneseAddressForm } from "@/components/ui/japanese/japanese-form"
import { 
  Users, 
  Mail, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Briefcase,
  Clock,
  Plus,
  Minus,
  Languages
} from "lucide-react"

const relationships = [
  "父", "母", "祖父", "祖母", "叔父", "叔母", 
  "兄", "姉", "保護者", "後見人", "その他"
]

const occupations = [
  "会社員", "公務員", "自営業", "医師", "看護師", "教師", 
  "エンジニア", "デザイナー", "主婦・主夫", "学生", 
  "フリーランス", "その他"
]

const communicationPreferences = [
  { value: "email", label: "メール", icon: Mail, description: "メールでのご連絡" },
  { value: "line", label: "LINE", icon: MessageCircle, description: "LINEでのご連絡" },
  { value: "phone", label: "電話", icon: Phone, description: "お電話でのご連絡" },
  { value: "both", label: "メール+LINE", icon: MessageCircle, description: "メールとLINE両方" }
]

const japaneseLevel = [
  { value: "native", label: "母語", description: "日本語が母語" },
  { value: "fluent", label: "流暢", description: "ビジネスレベル" },
  { value: "intermediate", label: "中級", description: "日常会話可能" },
  { value: "basic", label: "基礎", description: "基本的な会話" },
  { value: "minimal", label: "最小限", description: "簡単な単語のみ" }
]

export function ParentInfoStep() {
  const [showSecondaryParent, setShowSecondaryParent] = useState(false)
  const { 
    register, 
    formState: { errors }, 
    setValue, 
    watch 
  } = useFormContext()

  const watchedValues = watch()

  return (
    <div className="space-y-8">
      {/* Primary Parent Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-blue-600" />
            主たる保護者情報
          </CardTitle>
          <CardDescription>
            メインの連絡先となる保護者の方の情報を入力してください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Name */}
          <JapaneseNameForm
            name={watchedValues.primaryParent?.name || { kanji: "", furigana: "" }}
            onChange={(name) => {
              setValue("primaryParent.name.kanji", name.kanji)
              setValue("primaryParent.name.furigana", name.furigana)
            }}
            required
          />

          {/* Relationship */}
          <div>
            <Label htmlFor="primaryRelationship">続柄 *</Label>
            <Select
              value={watchedValues.primaryParent?.relationship}
              onValueChange={(value) => setValue("primaryParent.relationship", value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="生徒さんとの続柄を選択" />
              </SelectTrigger>
              <SelectContent>
                {relationships.map((relationship) => (
                  <SelectItem key={relationship} value={relationship}>
                    {relationship}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.primaryParent?.relationship && (
              <p className="text-sm text-red-600 mt-1">
                {errors.primaryParent.relationship.message as string}
              </p>
            )}
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primaryEmail" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                メールアドレス *
              </Label>
              <Input
                id="primaryEmail"
                type="email"
                {...register("primaryParent.email")}
                placeholder="tanaka@example.com"
                className="mt-1"
              />
              {errors.primaryParent?.email && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.primaryParent.email.message as string}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="primaryPhone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                電話番号 *
              </Label>
              <Input
                id="primaryPhone"
                {...register("primaryParent.phone")}
                placeholder="090-1234-5678"
                className="mt-1"
              />
              {errors.primaryParent?.phone && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.primaryParent.phone.message as string}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="primaryLineId" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              LINE ID（任意）
            </Label>
            <Input
              id="primaryLineId"
              {...register("primaryParent.lineId")}
              placeholder="@your_line_id"
              className="mt-1"
            />
          </div>

          {/* Occupation and Work Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primaryOccupation" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                職業（任意）
              </Label>
              <Select
                value={watchedValues.primaryParent?.occupation}
                onValueChange={(value) => setValue("primaryParent.occupation", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="職業を選択" />
                </SelectTrigger>
                <SelectContent>
                  {occupations.map((occupation) => (
                    <SelectItem key={occupation} value={occupation}>
                      {occupation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="primaryWorkSchedule" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                勤務時間（任意）
              </Label>
              <Input
                id="primaryWorkSchedule"
                {...register("primaryParent.workSchedule")}
                placeholder="例：平日9:00-17:00"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Parent Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-green-600" />
                第二保護者情報（任意）
              </CardTitle>
              <CardDescription>
                必要に応じて、もう一人の保護者の方の情報を入力できます
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSecondaryParent(!showSecondaryParent)}
              className="flex items-center gap-2"
            >
              {showSecondaryParent ? (
                <>
                  <Minus className="h-4 w-4" />
                  削除
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  追加
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        {showSecondaryParent && (
          <CardContent className="space-y-6">
            <JapaneseNameForm
              name={watchedValues.secondaryParent?.name || { kanji: "", furigana: "" }}
              onChange={(name) => {
                setValue("secondaryParent.name.kanji", name.kanji)
                setValue("secondaryParent.name.furigana", name.furigana)
              }}
              required={false}
            />

            <div>
              <Label htmlFor="secondaryRelationship">続柄</Label>
              <Select
                value={watchedValues.secondaryParent?.relationship}
                onValueChange={(value) => setValue("secondaryParent.relationship", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="生徒さんとの続柄を選択" />
                </SelectTrigger>
                <SelectContent>
                  {relationships.map((relationship) => (
                    <SelectItem key={relationship} value={relationship}>
                      {relationship}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="secondaryEmail" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  メールアドレス
                </Label>
                <Input
                  id="secondaryEmail"
                  type="email"
                  {...register("secondaryParent.email")}
                  placeholder="sato@example.com"
                  className="mt-1"
                />
                {errors.secondaryParent?.email && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.secondaryParent.email.message as string}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="secondaryPhone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  電話番号
                </Label>
                <Input
                  id="secondaryPhone"
                  {...register("secondaryParent.phone")}
                  placeholder="080-1234-5678"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="secondaryLineId" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                LINE ID
              </Label>
              <Input
                id="secondaryLineId"
                {...register("secondaryParent.lineId")}
                placeholder="@your_line_id"
                className="mt-1"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-purple-600" />
            住所情報
          </CardTitle>
          <CardDescription>
            生徒さんのご自宅住所を入力してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <JapaneseAddressForm
            address={watchedValues.address || {
              zipCode: "",
              prefecture: "",
              city: "",
              town: "",
              building: ""
            }}
            onChange={(address) => {
              Object.keys(address).forEach(key => {
                setValue(`address.${key}`, address[key])
              })
            }}
            required
          />
        </CardContent>
      </Card>

      {/* Communication Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="h-5 w-5 text-orange-600" />
            連絡設定
          </CardTitle>
          <CardDescription>
            ご連絡方法と言語設定を選択してください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preferred Communication Method */}
          <div>
            <Label className="text-base font-medium">希望連絡方法 *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {communicationPreferences.map((pref) => (
                <div
                  key={pref.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                    watchedValues.preferredCommunication === pref.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                  onClick={() => setValue("preferredCommunication", pref.value)}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      {...register("preferredCommunication")}
                      value={pref.value}
                      className="text-blue-600"
                    />
                    <pref.icon className="h-5 w-5 text-gray-600" />
                    <div>
                      <div className="font-medium">{pref.label}</div>
                      <div className="text-sm text-gray-600">{pref.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {errors.preferredCommunication && (
              <p className="text-sm text-red-600 mt-1">
                {errors.preferredCommunication.message as string}
              </p>
            )}
          </div>

          {/* Japanese Level */}
          <div>
            <Label className="flex items-center gap-2 text-base font-medium">
              <Languages className="h-5 w-5" />
              日本語レベル *
            </Label>
            <p className="text-sm text-gray-600 mb-3">
              保護者の方の日本語レベルを選択してください（連絡の参考にします）
            </p>
            <div className="space-y-2">
              {japaneseLevel.map((level) => (
                <div
                  key={level.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                    watchedValues.japaneseLevel === level.value
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200"
                  }`}
                  onClick={() => setValue("japaneseLevel", level.value)}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      {...register("japaneseLevel")}
                      value={level.value}
                      className="text-green-600"
                    />
                    <div>
                      <div className="font-medium">{level.label}</div>
                      <div className="text-sm text-gray-600">{level.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {errors.japaneseLevel && (
              <p className="text-sm text-red-600 mt-1">
                {errors.japaneseLevel.message as string}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}