"use client"

import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { JapaneseNameForm } from "@/components/ui/japanese/japanese-form"
import { Users, Calendar, Globe, Heart, AlertTriangle, GraduationCap } from "lucide-react"

const englishLevels = [
  { value: "BEGINNER", label: "初心者 (Beginner)", description: "英語学習を始めたばかり" },
  { value: "ELEMENTARY", label: "基礎 (Elementary)", description: "基本的な単語と文法を理解" },
  { value: "PRE_INTERMEDIATE", label: "準中級 (Pre-Intermediate)", description: "日常会話の基礎ができる" },
  { value: "INTERMEDIATE", label: "中級 (Intermediate)", description: "簡単な会話ができる" },
  { value: "UPPER_INTERMEDIATE", label: "上級中級 (Upper-Intermediate)", description: "幅広いトピックで会話可能" },
  { value: "ADVANCED", label: "上級 (Advanced)", description: "流暢に意見を表現できる" },
  { value: "PROFICIENCY", label: "熟練 (Proficiency)", description: "ネイティブレベル" }
]

const nationalities = [
  "日本", "アメリカ", "イギリス", "カナダ", "オーストラリア", 
  "ニュージーランド", "フィリピン", "インド", "中国", "韓国", 
  "タイ", "ベトナム", "ブラジル", "フランス", "ドイツ", "その他"
]

const relationships = [
  "父", "母", "祖父", "祖母", "兄", "姉", "弟", "妹", 
  "叔父", "叔母", "従兄弟", "従姉妹", "友人", "その他"
]

export function StudentInfoStep() {
  const { 
    register, 
    formState: { errors }, 
    setValue, 
    watch 
  } = useFormContext()

  const watchedValues = watch()

  return (
    <div className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-blue-600" />
            基本情報
          </CardTitle>
          <CardDescription>
            生徒さんの基本的な情報を入力してください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Name Fields */}
          <div className="space-y-4">
            <JapaneseNameForm
              name={watchedValues.studentName || { kanji: "", furigana: "" }}
              onChange={(name) => {
                setValue("studentName.kanji", name.kanji)
                setValue("studentName.furigana", name.furigana)
              }}
              required
            />
            
            <div>
              <Label htmlFor="romaji">ローマ字 (Romaji) *</Label>
              <Input
                id="romaji"
                {...register("studentName.romaji")}
                placeholder="Yamada Taro"
                className="mt-1"
              />
              {errors.studentName?.romaji && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.studentName.romaji.message as string}
                </p>
              )}
            </div>
          </div>

          {/* Birth Date and Gender */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="birthDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                生年月日 *
              </Label>
              <Input
                id="birthDate"
                type="date"
                {...register("birthDate")}
                className="mt-1"
              />
              {errors.birthDate && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.birthDate.message as string}
                </p>
              )}
            </div>

            <div>
              <Label>性別 *</Label>
              <RadioGroup
                value={watchedValues.gender}
                onValueChange={(value) => setValue("gender", value)}
                className="flex flex-row gap-6 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male">男性</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female">女性</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">その他</Label>
                </div>
              </RadioGroup>
              {errors.gender && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.gender.message as string}
                </p>
              )}
            </div>
          </div>

          {/* Nationality */}
          <div>
            <Label className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              国籍 *
            </Label>
            <Select
              value={watchedValues.nationality}
              onValueChange={(value) => setValue("nationality", value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="国籍を選択してください" />
              </SelectTrigger>
              <SelectContent>
                {nationalities.map((nationality) => (
                  <SelectItem key={nationality} value={nationality}>
                    {nationality}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.nationality && (
              <p className="text-sm text-red-600 mt-1">
                {errors.nationality.message as string}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* English Level */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="h-5 w-5 text-green-600" />
            英語レベル
          </CardTitle>
          <CardDescription>
            現在の英語力を選択してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Label>英語レベル *</Label>
            <div className="grid grid-cols-1 gap-3">
              {englishLevels.map((level) => (
                <div
                  key={level.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                    watchedValues.englishLevel === level.value
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200"
                  }`}
                  onClick={() => setValue("englishLevel", level.value)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        {...register("englishLevel")}
                        value={level.value}
                        className="text-green-600"
                      />
                      <div>
                        <div className="font-medium">{level.label}</div>
                        <div className="text-sm text-gray-600">{level.description}</div>
                      </div>
                    </div>
                    {watchedValues.englishLevel === level.value && (
                      <Badge variant="default" className="bg-green-600">
                        選択中
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {errors.englishLevel && (
              <p className="text-sm text-red-600 mt-1">
                {errors.englishLevel.message as string}
              </p>
            )}
          </div>

          <div className="mt-6">
            <Label htmlFor="previousExperience">これまでの英語学習経験</Label>
            <Textarea
              id="previousExperience"
              {...register("previousExperience")}
              placeholder="英会話スクール、オンライン学習、独学など、これまでの学習経験があれば記入してください"
              rows={3}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Health and Emergency Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="h-5 w-5 text-red-600" />
            健康情報・緊急連絡先
          </CardTitle>
          <CardDescription>
            安全なレッスンのために必要な情報です
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Health Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="allergies" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                アレルギー
              </Label>
              <Textarea
                id="allergies"
                {...register("allergies")}
                placeholder="食物アレルギーや薬物アレルギーがあれば記入してください"
                rows={2}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="medicalConditions">健康上の注意事項</Label>
              <Textarea
                id="medicalConditions"
                {...register("medicalConditions")}
                placeholder="持病、服用中の薬、運動制限など、レッスン時に注意が必要なことがあれば記入してください"
                rows={2}
                className="mt-1"
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="border-t pt-6">
            <h4 className="font-semibold mb-4">緊急連絡先</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyContactName">お名前 *</Label>
                <Input
                  id="emergencyContactName"
                  {...register("emergencyContact.name")}
                  placeholder="田中花子"
                  className="mt-1"
                />
                {errors.emergencyContact?.name && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.emergencyContact.name.message as string}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="emergencyContactRelationship">続柄 *</Label>
                <Select
                  value={watchedValues.emergencyContact?.relationship}
                  onValueChange={(value) => setValue("emergencyContact.relationship", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="続柄を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationships.map((relationship) => (
                      <SelectItem key={relationship} value={relationship}>
                        {relationship}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.emergencyContact?.relationship && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.emergencyContact.relationship.message as string}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="emergencyContactPhone">電話番号 *</Label>
                <Input
                  id="emergencyContactPhone"
                  {...register("emergencyContact.phone")}
                  placeholder="090-1234-5678"
                  className="mt-1"
                />
                {errors.emergencyContact?.phone && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.emergencyContact.phone.message as string}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}