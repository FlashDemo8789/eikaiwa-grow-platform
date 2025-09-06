"use client"

import { useState, useCallback, useEffect } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { 
  CheckCircle, 
  Circle, 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Send,
  Users,
  GraduationCap,
  CreditCard,
  FileText,
  Calendar,
  Mail,
  MessageCircle,
  Upload
} from "lucide-react"

// Step Components
import { StudentInfoStep } from "./components/StudentInfoStep"
import { ParentInfoStep } from "./components/ParentInfoStep"
import { CourseSelectionStep } from "./components/CourseSelectionStep"
import { PaymentSetupStep } from "./components/PaymentSetupStep"
import { DocumentUploadStep } from "./components/DocumentUploadStep"
import { TrialSchedulingStep } from "./components/TrialSchedulingStep"
import { ConfirmationStep } from "./components/ConfirmationStep"

// Types and Validation Schema
const studentInfoSchema = z.object({
  // Student basic info
  studentName: z.object({
    kanji: z.string().min(1, "お名前（漢字）は必須です"),
    furigana: z.string().min(1, "ふりがなは必須です"),
    romaji: z.string().min(1, "ローマ字は必須です")
  }),
  birthDate: z.string().min(1, "生年月日は必須です"),
  gender: z.enum(["male", "female", "other"]),
  nationality: z.string().min(1, "国籍は必須です"),
  englishLevel: z.enum(["BEGINNER", "ELEMENTARY", "PRE_INTERMEDIATE", "INTERMEDIATE", "UPPER_INTERMEDIATE", "ADVANCED", "PROFICIENCY"]),
  previousExperience: z.string().optional(),
  medicalConditions: z.string().optional(),
  allergies: z.string().optional(),
  emergencyContact: z.object({
    name: z.string().min(1, "緊急連絡先の名前は必須です"),
    relationship: z.string().min(1, "続柄は必須です"),
    phone: z.string().min(1, "電話番号は必須です")
  })
})

const parentInfoSchema = z.object({
  // Primary parent/guardian
  primaryParent: z.object({
    name: z.object({
      kanji: z.string().min(1, "お名前（漢字）は必須です"),
      furigana: z.string().min(1, "ふりがなは必須です")
    }),
    relationship: z.string().min(1, "続柄は必須です"),
    email: z.string().email("有効なメールアドレスを入力してください"),
    phone: z.string().min(1, "電話番号は必須です"),
    lineId: z.string().optional(),
    occupation: z.string().optional(),
    workSchedule: z.string().optional()
  }),
  // Secondary parent/guardian (optional)
  secondaryParent: z.object({
    name: z.object({
      kanji: z.string().optional(),
      furigana: z.string().optional()
    }),
    relationship: z.string().optional(),
    email: z.string().email("有効なメールアドレスを入力してください").optional().or(z.literal("")),
    phone: z.string().optional(),
    lineId: z.string().optional()
  }).optional(),
  // Address
  address: z.object({
    zipCode: z.string().min(1, "郵便番号は必須です"),
    prefecture: z.string().min(1, "都道府県は必須です"),
    city: z.string().min(1, "市区町村は必須です"),
    town: z.string().min(1, "町名・番地は必須です"),
    building: z.string().optional()
  }),
  // Communication preferences
  preferredCommunication: z.enum(["email", "line", "phone", "both"]),
  japaneseLevel: z.enum(["native", "fluent", "intermediate", "basic", "minimal"])
})

const courseSelectionSchema = z.object({
  courseType: z.enum(["group", "private", "semi_private"]),
  courseLevel: z.string().min(1, "コースレベルは必須です"),
  preferredDays: z.array(z.string()).min(1, "希望曜日を選択してください"),
  preferredTimes: z.array(z.string()).min(1, "希望時間を選択してください"),
  startDate: z.string().min(1, "開始希望日は必須です"),
  goals: z.string().optional(),
  specialRequests: z.string().optional(),
  packageType: z.enum(["monthly", "quarterly", "semi_annual", "annual"]),
  additionalServices: z.array(z.string()).optional()
})

const paymentSetupSchema = z.object({
  paymentMethod: z.enum(["credit_card", "bank_transfer", "konbini", "paypay"]),
  billingCycle: z.enum(["monthly", "quarterly", "semi_annual", "annual"]),
  cardInfo: z.object({
    cardNumber: z.string().optional(),
    expiryDate: z.string().optional(),
    cvv: z.string().optional(),
    holderName: z.string().optional()
  }).optional(),
  bankInfo: z.object({
    accountHolder: z.string().optional(),
    bankName: z.string().optional(),
    branchName: z.string().optional(),
    accountNumber: z.string().optional()
  }).optional(),
  billingAddress: z.object({
    sameAsStudent: z.boolean(),
    zipCode: z.string().optional(),
    prefecture: z.string().optional(),
    city: z.string().optional(),
    town: z.string().optional(),
    building: z.string().optional()
  }),
  paymentDay: z.number().min(1).max(31).optional()
})

const documentUploadSchema = z.object({
  studentPhoto: z.array(z.object({
    file: z.any(),
    preview: z.string(),
    name: z.string()
  })).optional(),
  parentId: z.array(z.object({
    file: z.any(),
    preview: z.string(),
    name: z.string()
  })).optional(),
  medicalRecords: z.array(z.object({
    file: z.any(),
    preview: z.string(),
    name: z.string()
  })).optional(),
  previousReports: z.array(z.object({
    file: z.any(),
    preview: z.string(),
    name: z.string()
  })).optional(),
  consentForms: z.object({
    photographyConsent: z.boolean(),
    dataUsageConsent: z.boolean(),
    emergencyTreatmentConsent: z.boolean(),
    marketingConsent: z.boolean()
  }),
  additionalDocuments: z.array(z.object({
    file: z.any(),
    preview: z.string(),
    name: z.string(),
    description: z.string()
  })).optional()
})

const trialSchedulingSchema = z.object({
  wantsTrialLesson: z.boolean(),
  trialDate: z.string().optional(),
  trialTime: z.string().optional(),
  trialType: z.enum(["online", "in_person"]).optional(),
  trialNotes: z.string().optional(),
  parentAttendance: z.boolean().optional()
})

const confirmationSchema = z.object({
  emailConfirmation: z.boolean(),
  lineConfirmation: z.boolean(),
  smsConfirmation: z.boolean(),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "利用規約に同意する必要があります"
  }),
  privacyAccepted: z.boolean().refine((val) => val === true, {
    message: "プライバシーポリシーに同意する必要があります"
  })
})

const enrollmentSchema = studentInfoSchema
  .merge(parentInfoSchema)
  .merge(courseSelectionSchema)
  .merge(paymentSetupSchema)
  .merge(documentUploadSchema)
  .merge(trialSchedulingSchema)
  .merge(confirmationSchema)

type EnrollmentFormData = z.infer<typeof enrollmentSchema>

interface Step {
  id: number
  title: string
  description: string
  icon: any
  component: React.ComponentType<any>
  schema: z.ZodSchema<any>
}

const steps: Step[] = [
  {
    id: 1,
    title: "生徒情報",
    description: "Student Information",
    icon: Users,
    component: StudentInfoStep,
    schema: studentInfoSchema
  },
  {
    id: 2,
    title: "保護者情報",
    description: "Parent Information",
    icon: Users,
    component: ParentInfoStep,
    schema: parentInfoSchema
  },
  {
    id: 3,
    title: "コース選択",
    description: "Course Selection",
    icon: GraduationCap,
    component: CourseSelectionStep,
    schema: courseSelectionSchema
  },
  {
    id: 4,
    title: "お支払い設定",
    description: "Payment Setup",
    icon: CreditCard,
    component: PaymentSetupStep,
    schema: paymentSetupSchema
  },
  {
    id: 5,
    title: "書類アップロード",
    description: "Document Upload",
    icon: Upload,
    component: DocumentUploadStep,
    schema: documentUploadSchema
  },
  {
    id: 6,
    title: "体験レッスン予約",
    description: "Trial Lesson Scheduling",
    icon: Calendar,
    component: TrialSchedulingStep,
    schema: trialSchedulingSchema
  },
  {
    id: 7,
    title: "確認・送信",
    description: "Confirmation",
    icon: Send,
    component: ConfirmationStep,
    schema: confirmationSchema
  }
]

export default function StudentEnrollmentPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDraftSaving, setIsDraftSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const { toast } = useToast()

  const methods = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentSchema),
    mode: "onChange",
    defaultValues: {
      studentName: { kanji: "", furigana: "", romaji: "" },
      primaryParent: { 
        name: { kanji: "", furigana: "" },
        email: "",
        phone: "",
        relationship: ""
      },
      address: {
        zipCode: "",
        prefecture: "",
        city: "",
        town: "",
        building: ""
      },
      consentForms: {
        photographyConsent: false,
        dataUsageConsent: false,
        emergencyTreatmentConsent: false,
        marketingConsent: false
      },
      wantsTrialLesson: false,
      emailConfirmation: true,
      lineConfirmation: false,
      smsConfirmation: false,
      termsAccepted: false,
      privacyAccepted: false
    }
  })

  const { 
    handleSubmit, 
    trigger, 
    watch, 
    formState: { errors, isValid },
    getValues,
    reset
  } = methods

  // Auto-save draft functionality
  const saveDraft = useCallback(async () => {
    setIsDraftSaving(true)
    try {
      const formData = getValues()
      localStorage.setItem('enrollment_draft', JSON.stringify({
        data: formData,
        timestamp: new Date().toISOString(),
        currentStep
      }))
      setLastSaved(new Date())
      toast({
        title: "下書きを保存しました",
        description: "入力内容が自動保存されました",
        variant: "default"
      })
    } catch (error) {
      console.error('Failed to save draft:', error)
    } finally {
      setIsDraftSaving(false)
    }
  }, [getValues, currentStep, toast])

  // Load draft on component mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('enrollment_draft')
      if (savedDraft) {
        const { data, currentStep: savedStep, timestamp } = JSON.parse(savedDraft)
        const savedDate = new Date(timestamp)
        const hoursSinceLastSave = (Date.now() - savedDate.getTime()) / (1000 * 60 * 60)
        
        if (hoursSinceLastSave < 24) { // Load draft if less than 24 hours old
          reset(data)
          setCurrentStep(savedStep)
          setLastSaved(savedDate)
          toast({
            title: "下書きを読み込みました",
            description: `${savedDate.toLocaleString('ja-JP')}に保存された内容を復元しました`,
            variant: "default"
          })
        }
      }
    } catch (error) {
      console.error('Failed to load draft:', error)
    }
  }, [reset, toast])

  // Auto-save every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      const formData = getValues()
      const hasData = Object.values(formData).some(value => {
        if (typeof value === 'string') return value.trim().length > 0
        if (typeof value === 'object' && value !== null) {
          return Object.values(value).some(v => typeof v === 'string' ? v.trim().length > 0 : !!v)
        }
        return !!value
      })
      
      if (hasData) {
        saveDraft()
      }
    }, 120000) // 2 minutes

    return () => clearInterval(interval)
  }, [saveDraft, getValues])

  const currentStepData = steps.find(step => step.id === currentStep)
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100

  const validateCurrentStep = async () => {
    if (currentStepData) {
      try {
        const formData = getValues()
        await currentStepData.schema.parseAsync(formData)
        return true
      } catch (error) {
        console.error('Step validation failed:', error)
        return false
      }
    }
    return false
  }

  const nextStep = async () => {
    const isStepValid = await trigger()
    if (isStepValid && currentStep < steps.length) {
      const isCurrentStepValid = await validateCurrentStep()
      if (isCurrentStepValid) {
        setCompletedSteps(prev => [...new Set([...prev, currentStep])])
        setCurrentStep(prev => prev + 1)
        // Save progress
        saveDraft()
      } else {
        toast({
          title: "入力エラー",
          description: "必須項目を正しく入力してください",
          variant: "destructive"
        })
      }
    }
  }

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const goToStep = (stepId: number) => {
    if (stepId <= currentStep || completedSteps.includes(stepId - 1)) {
      setCurrentStep(stepId)
    }
  }

  const onSubmit = async (data: EnrollmentFormData) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      console.log('Enrollment data:', data)
      
      // Clear draft after successful submission
      localStorage.removeItem('enrollment_draft')
      
      toast({
        title: "入学手続きが完了しました！",
        description: "確認メールをお送りしました。ご不明な点がございましたらお気軽にお問い合わせください。",
        variant: "default"
      })
      
      // Reset form or redirect
      reset()
      setCurrentStep(1)
      setCompletedSteps([])
      
    } catch (error) {
      toast({
        title: "エラーが発生しました",
        description: "入学手続きの送信に失敗しました。もう一度お試しください。",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const CurrentStepComponent = currentStepData?.component

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          新規生徒登録
        </h1>
        <p className="text-gray-600 mb-4">
          Student Enrollment Manager
        </p>
        
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              ステップ {currentStep} / {steps.length}
            </span>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {isDraftSaving ? (
                <div className="flex items-center gap-1">
                  <LoadingSpinner size="sm" />
                  <span>保存中...</span>
                </div>
              ) : lastSaved ? (
                <div className="flex items-center gap-1">
                  <Save className="h-4 w-4" />
                  <span>最終保存: {lastSaved.toLocaleTimeString('ja-JP')}</span>
                </div>
              ) : null}
            </div>
          </div>
          <Progress value={progress} className="h-2 mb-4" />
          
          {/* Step Navigator */}
          <div className="flex flex-wrap gap-2">
            {steps.map((step) => {
              const isCompleted = completedSteps.includes(step.id)
              const isCurrent = step.id === currentStep
              const isAccessible = step.id <= currentStep || completedSteps.includes(step.id - 1)
              
              return (
                <button
                  key={step.id}
                  onClick={() => goToStep(step.id)}
                  disabled={!isAccessible}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isCurrent
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : isCompleted
                      ? 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200'
                      : isAccessible
                      ? 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                      : 'bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Circle className={`h-4 w-4 ${isCurrent ? 'fill-current' : ''}`} />
                  )}
                  <step.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{step.title}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                {currentStepData && <currentStepData.icon className="h-6 w-6 text-blue-600" />}
                <div>
                  <CardTitle className="text-xl font-semibold">
                    {currentStepData?.title}
                  </CardTitle>
                  <CardDescription>
                    {currentStepData?.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {CurrentStepComponent && <CurrentStepComponent />}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              onClick={previousStep}
              disabled={currentStep === 1 || isLoading}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              前のステップ
            </Button>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={saveDraft}
                disabled={isDraftSaving}
                className="flex items-center gap-2"
              >
                {isDraftSaving ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                下書き保存
              </Button>

              {currentStep < steps.length ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  次のステップ
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading || !isValid}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  入学手続きを完了する
                </Button>
              )}
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}