"use client"

import { useState, useRef } from "react"
import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  X, 
  Eye,
  Camera,
  FileCheck,
  Shield,
  AlertCircle,
  CheckCircle2,
  Info
} from "lucide-react"

const documentTypes = [
  {
    key: "studentPhoto",
    title: "生徒の写真",
    description: "学生証や名札作成に使用します",
    icon: Camera,
    required: true,
    maxFiles: 2,
    acceptedTypes: "image/*",
    note: "顔がはっきりと写った写真を1-2枚アップロードしてください"
  },
  {
    key: "parentId",
    title: "保護者身分証明書",
    description: "運転免許証、健康保険証など（写真撮影可）",
    icon: FileCheck,
    required: false,
    maxFiles: 2,
    acceptedTypes: "image/*,application/pdf",
    note: "身分証明書の写真または写真ファイル。個人情報は適切に管理いたします"
  },
  {
    key: "medicalRecords",
    title: "健康診断書・医療記録",
    description: "アレルギーや持病に関する医療記録",
    icon: FileText,
    required: false,
    maxFiles: 3,
    acceptedTypes: "image/*,application/pdf",
    note: "必要に応じてアップロードしてください"
  },
  {
    key: "previousReports",
    title: "前の学校の成績表・レポート",
    description: "英語学習歴の参考にします",
    icon: FileText,
    required: false,
    maxFiles: 5,
    acceptedTypes: "image/*,application/pdf",
    note: "英語関連の成績や資格証明書があればアップロードしてください"
  }
]

const consentItems = [
  {
    key: "photographyConsent",
    title: "写真・動画撮影に関する同意",
    description: "レッスンの様子やイベントでの写真・動画撮影、およびウェブサイトやSNSでの使用に同意します",
    required: true
  },
  {
    key: "dataUsageConsent", 
    title: "個人情報の利用に関する同意",
    description: "学習管理、連絡、サービス向上のための個人情報利用に同意します",
    required: true
  },
  {
    key: "emergencyTreatmentConsent",
    title: "緊急時の医療措置に関する同意", 
    description: "緊急時に必要な医療措置を受けることに同意します",
    required: true
  },
  {
    key: "marketingConsent",
    title: "マーケティング情報の配信同意",
    description: "新しいコースやイベント情報、お得な情報の配信に同意します（任意）",
    required: false
  }
]

interface FileWithPreview {
  file: File
  preview: string
  name: string
}

export function DocumentUploadStep() {
  const { 
    setValue, 
    watch,
    formState: { errors }
  } = useFormContext()

  const watchedValues = watch()
  const [dragActive, setDragActive] = useState<string | null>(null)
  const [additionalDocs, setAdditionalDocs] = useState<Array<FileWithPreview & { description: string }>>([])
  const [additionalDescription, setAdditionalDescription] = useState("")

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  const handleFileUpload = (documentType: string, files: FileList | null) => {
    if (!files) return

    const currentFiles = watchedValues[documentType] || []
    const maxFiles = documentTypes.find(doc => doc.key === documentType)?.maxFiles || 1
    
    const newFiles: FileWithPreview[] = []
    
    for (let i = 0; i < Math.min(files.length, maxFiles - currentFiles.length); i++) {
      const file = files[i]
      const preview = URL.createObjectURL(file)
      
      newFiles.push({
        file,
        preview,
        name: file.name
      })
    }

    setValue(documentType, [...currentFiles, ...newFiles])
  }

  const removeFile = (documentType: string, index: number) => {
    const currentFiles = watchedValues[documentType] || []
    const updatedFiles = currentFiles.filter((_: any, i: number) => i !== index)
    
    // Revoke object URL to free memory
    URL.revokeObjectURL(currentFiles[index].preview)
    
    setValue(documentType, updatedFiles)
  }

  const handleDrag = (e: React.DragEvent, documentType: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(documentType)
    } else if (e.type === "dragleave") {
      setDragActive(null)
    }
  }

  const handleDrop = (e: React.DragEvent, documentType: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(null)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(documentType, e.dataTransfer.files)
    }
  }

  const addAdditionalDocument = () => {
    if (additionalDocs.length > 0 && additionalDescription.trim()) {
      const currentAdditional = watchedValues.additionalDocuments || []
      const docsWithDescription = additionalDocs.map(doc => ({
        ...doc,
        description: additionalDescription.trim()
      }))
      
      setValue("additionalDocuments", [...currentAdditional, ...docsWithDescription])
      setAdditionalDocs([])
      setAdditionalDescription("")
    }
  }

  return (
    <div className="space-y-8">
      {/* Document Upload Sections */}
      {documentTypes.map((docType) => {
        const files = watchedValues[docType.key] || []
        const hasMaxFiles = files.length >= docType.maxFiles
        
        return (
          <Card key={docType.key}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <docType.icon className="h-5 w-5 text-blue-600" />
                {docType.title}
                {docType.required && <Badge variant="destructive" className="ml-2">必須</Badge>}
              </CardTitle>
              <CardDescription>
                {docType.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File upload area */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive === docType.key
                    ? "border-blue-500 bg-blue-50"
                    : hasMaxFiles
                    ? "border-gray-200 bg-gray-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragEnter={(e) => handleDrag(e, docType.key)}
                onDragLeave={(e) => handleDrag(e, docType.key)}
                onDragOver={(e) => handleDrag(e, docType.key)}
                onDrop={(e) => handleDrop(e, docType.key)}
              >
                {!hasMaxFiles ? (
                  <>
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      ファイルをドラッグ＆ドロップ
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      または
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRefs.current[docType.key]?.click()}
                    >
                      ファイルを選択
                    </Button>
                    <input
                      ref={(el) => fileInputRefs.current[docType.key] = el}
                      type="file"
                      multiple
                      accept={docType.acceptedTypes}
                      onChange={(e) => handleFileUpload(docType.key, e.target.files)}
                      className="hidden"
                    />
                  </>
                ) : (
                  <p className="text-green-600 font-medium">
                    <CheckCircle2 className="h-5 w-5 inline mr-2" />
                    最大ファイル数に達しました
                  </p>
                )}
              </div>

              {/* File list */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">アップロード済みファイル:</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {files.map((fileData: FileWithPreview, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="flex-shrink-0">
                          {fileData.file.type.startsWith('image/') ? (
                            <img
                              src={fileData.preview}
                              alt={fileData.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <FileText className="h-12 w-12 text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{fileData.name}</p>
                          <p className="text-xs text-gray-500">
                            {(fileData.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {fileData.file.type.startsWith('image/') && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(fileData.preview, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFile(docType.key, index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* File requirements note */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  <Info className="h-4 w-4 inline mr-2" />
                  {docType.note}
                </p>
              </div>

              {/* Error display */}
              {errors[docType.key] && (
                <p className="text-sm text-red-600">
                  {errors[docType.key].message as string}
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}

      {/* Additional Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-purple-600" />
            その他の書類（任意）
          </CardTitle>
          <CardDescription>
            上記以外で提出したい書類があれば追加できます
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="additionalDescription">書類の説明</Label>
            <Input
              id="additionalDescription"
              value={additionalDescription}
              onChange={(e) => setAdditionalDescription(e.target.value)}
              placeholder="例：習い事の修了証、英語検定の結果など"
              className="mt-1"
            />
          </div>

          {/* Additional file upload area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRefs.current.additional?.click()}
            >
              ファイルを選択
            </Button>
            <input
              ref={(el) => fileInputRefs.current.additional = el}
              type="file"
              multiple
              accept="image/*,application/pdf"
              onChange={(e) => {
                if (e.target.files) {
                  const files = Array.from(e.target.files).map(file => ({
                    file,
                    preview: URL.createObjectURL(file),
                    name: file.name
                  }))
                  setAdditionalDocs(files)
                }
              }}
              className="hidden"
            />
          </div>

          {additionalDocs.length > 0 && additionalDescription && (
            <Button
              type="button"
              onClick={addAdditionalDocument}
              className="w-full"
            >
              書類を追加
            </Button>
          )}

          {/* Show added additional documents */}
          {(watchedValues.additionalDocuments || []).length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">追加済み書類:</Label>
              {watchedValues.additionalDocuments.map((doc: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <FileText className="h-8 w-8 text-purple-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{doc.description}</p>
                    <p className="text-xs text-gray-500">{doc.name}</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const updated = watchedValues.additionalDocuments.filter((_: any, i: number) => i !== index)
                      setValue("additionalDocuments", updated)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Consent Forms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-green-600" />
            同意事項
          </CardTitle>
          <CardDescription>
            以下の項目をご確認の上、同意にチェックを入れてください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {consentItems.map((item) => (
            <div key={item.key} className="space-y-3">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id={item.key}
                  checked={watchedValues.consentForms?.[item.key] || false}
                  onCheckedChange={(checked) => setValue(`consentForms.${item.key}`, checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label
                    htmlFor={item.key}
                    className={`text-sm font-medium cursor-pointer ${
                      item.required ? 'text-gray-900' : 'text-gray-700'
                    }`}
                  >
                    {item.title}
                    {item.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
              
              {item.required && !watchedValues.consentForms?.[item.key] && (
                <p className="text-sm text-red-600 ml-6">
                  この項目への同意が必要です
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                個人情報の取り扱いについて
              </h3>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• アップロードされたファイルは暗号化されて安全に保存されます</li>
                <li>• 個人情報は学習管理および緊急時対応のみに使用されます</li>
                <li>• 第三者への情報提供は行いません（法的要求がある場合を除く）</li>
                <li>• 写真の使用に関しては事前に個別に確認いたします</li>
                <li>• いつでも情報の修正・削除をリクエストできます</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}