export interface Lesson {
  id: string
  title: string
  description?: string
  courseId: string
  courseName: string
  teacherId: string
  teacherName: string
  scheduledDate: Date
  startTime: string
  endTime: string
  status: LessonStatus
  objectives: LessonObjective[]
  activities: LessonActivity[]
  materials: LessonMaterial[]
  homework: HomeworkAssignment[]
  vocabulary: VocabularyItem[]
  studentNotes: StudentPerformanceNote[]
  templateId?: string
  progress: LessonProgress
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, any>
}

export interface LessonObjective {
  id: string
  description: string
  category: ObjectiveCategory
  achieved: boolean
  order: number
}

export interface LessonActivity {
  id: string
  name: string
  description: string
  type: ActivityType
  duration: number // minutes
  materials: string[]
  instructions: string
  order: number
  completed: boolean
}

export interface LessonMaterial {
  id: string
  name: string
  type: MaterialType
  url?: string
  filePath?: string
  fileSize?: number
  mimeType?: string
  description?: string
  tags: string[]
  uploadedAt: Date
}

export interface HomeworkAssignment {
  id: string
  title: string
  description: string
  type: HomeworkType
  dueDate: Date
  materials: string[]
  instructions: string
  estimatedTime: number // minutes
  assignedStudents: string[]
  submissions: HomeworkSubmission[]
  createdAt: Date
}

export interface HomeworkSubmission {
  id: string
  studentId: string
  studentName: string
  submittedAt: Date
  status: SubmissionStatus
  content?: string
  attachments: string[]
  grade?: number
  feedback?: string
  teacherNotes?: string
}

export interface VocabularyItem {
  id: string
  english: string
  japanese: string
  hiragana?: string
  katakana?: string
  romaji?: string
  partOfSpeech: PartOfSpeech
  difficulty: DifficultyLevel
  example: VocabularyExample
  notes?: string
  practiced: boolean
  masteryLevel: MasteryLevel
}

export interface VocabularyExample {
  english: string
  japanese: string
  pronunciation?: string
}

export interface StudentPerformanceNote {
  id: string
  studentId: string
  studentName: string
  performance: PerformanceRating
  participation: ParticipationLevel
  comprehension: ComprehensionLevel
  speaking: SkillLevel
  listening: SkillLevel
  reading: SkillLevel
  writing: SkillLevel
  notes: string
  strengths: string[]
  areasForImprovement: string[]
  homework: HomeworkPerformance
  attendance: AttendanceStatus
  mood: MoodRating
  updatedAt: Date
}

export interface LessonProgress {
  objectivesCompleted: number
  totalObjectives: number
  activitiesCompleted: number
  totalActivities: number
  vocabularyPracticed: number
  totalVocabulary: number
  overallCompletion: number // percentage
  timeSpent: number // minutes
}

export interface LessonTemplate {
  id: string
  name: string
  description: string
  category: TemplateCategory
  ageGroup: AgeGroup
  skillLevel: SkillLevel
  duration: number // minutes
  objectives: Omit<LessonObjective, 'id' | 'achieved'>[]
  activities: Omit<LessonActivity, 'id' | 'completed'>[]
  materials: Omit<LessonMaterial, 'id' | 'uploadedAt'>[]
  vocabulary: Omit<VocabularyItem, 'id' | 'practiced' | 'masteryLevel'>[]
  tags: string[]
  isPublic: boolean
  createdBy: string
  createdAt: Date
  timesUsed: number
}

export interface LessonPlanPrint {
  lesson: Lesson
  includeObjectives: boolean
  includeActivities: boolean
  includeMaterials: boolean
  includeVocabulary: boolean
  includeHomework: boolean
  includeStudentNotes: boolean
  format: PrintFormat
  orientation: 'portrait' | 'landscape'
  fontSize: 'small' | 'medium' | 'large'
  includeJapanese: boolean
}

// Enums and Types
export type LessonStatus = 
  | 'planned'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rescheduled'

export type ObjectiveCategory = 
  | 'speaking'
  | 'listening'
  | 'reading'
  | 'writing'
  | 'grammar'
  | 'vocabulary'
  | 'pronunciation'
  | 'cultural'
  | 'social'

export type ActivityType = 
  | 'warmup'
  | 'presentation'
  | 'practice'
  | 'production'
  | 'game'
  | 'role_play'
  | 'discussion'
  | 'reading'
  | 'writing'
  | 'listening'
  | 'review'
  | 'assessment'

export type MaterialType = 
  | 'pdf'
  | 'video'
  | 'audio'
  | 'image'
  | 'worksheet'
  | 'presentation'
  | 'link'
  | 'textbook'
  | 'handout'

export type HomeworkType = 
  | 'worksheet'
  | 'reading'
  | 'writing'
  | 'listening'
  | 'speaking'
  | 'vocabulary'
  | 'grammar'
  | 'project'
  | 'presentation'

export type SubmissionStatus = 
  | 'pending'
  | 'submitted'
  | 'late'
  | 'graded'
  | 'missing'

export type PartOfSpeech = 
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'preposition'
  | 'conjunction'
  | 'interjection'
  | 'pronoun'
  | 'determiner'

export type DifficultyLevel = 
  | 'beginner'
  | 'elementary'
  | 'intermediate'
  | 'upper_intermediate'
  | 'advanced'

export type MasteryLevel = 
  | 'unknown'
  | 'introduced'
  | 'practicing'
  | 'mastered'

export type PerformanceRating = 
  | 'excellent'
  | 'good'
  | 'satisfactory'
  | 'needs_improvement'
  | 'absent'

export type ParticipationLevel = 
  | 'very_active'
  | 'active'
  | 'moderate'
  | 'quiet'
  | 'absent'

export type ComprehensionLevel = 
  | 'fully_understood'
  | 'mostly_understood'
  | 'partially_understood'
  | 'struggled'
  | 'not_assessed'

export type SkillLevel = 
  | 'excellent'
  | 'good'
  | 'developing'
  | 'needs_practice'
  | 'not_assessed'

export type HomeworkPerformance = 
  | 'completed_well'
  | 'completed'
  | 'partially_completed'
  | 'not_completed'
  | 'no_homework'

export type AttendanceStatus = 
  | 'present'
  | 'late'
  | 'absent'
  | 'excused'

export type MoodRating = 
  | 'very_happy'
  | 'happy'
  | 'neutral'
  | 'sad'
  | 'frustrated'
  | 'not_assessed'

export type TemplateCategory = 
  | 'conversation'
  | 'grammar'
  | 'vocabulary'
  | 'pronunciation'
  | 'business'
  | 'exam_prep'
  | 'cultural'
  | 'holiday_special'
  | 'assessment'

export type AgeGroup = 
  | 'toddler'
  | 'preschool'
  | 'elementary'
  | 'middle_school'
  | 'high_school'
  | 'adult'
  | 'senior'
  | 'mixed'

export type PrintFormat = 
  | 'detailed'
  | 'summary'
  | 'teacher_guide'
  | 'student_handout'

// Filter and Search Types
export interface LessonFilters {
  courseId?: string
  teacherId?: string
  status?: LessonStatus
  dateFrom?: Date
  dateTo?: Date
  skillLevel?: SkillLevel
  ageGroup?: AgeGroup
  search?: string
}

export interface LessonSearchParams {
  search?: string
  courseId?: string
  teacherId?: string
  status?: LessonStatus
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
  sortBy?: 'date' | 'title' | 'course' | 'status'
  sortOrder?: 'asc' | 'desc'
}

// API Request/Response Types
export interface CreateLessonRequest {
  title: string
  description?: string
  courseId: string
  scheduledDate: Date
  startTime: string
  endTime: string
  objectives: Omit<LessonObjective, 'id' | 'achieved'>[]
  activities: Omit<LessonActivity, 'id' | 'completed'>[]
  templateId?: string
}

export interface UpdateLessonRequest {
  title?: string
  description?: string
  scheduledDate?: Date
  startTime?: string
  endTime?: string
  status?: LessonStatus
  objectives?: LessonObjective[]
  activities?: LessonActivity[]
  vocabulary?: VocabularyItem[]
}

export interface BulkUpdateLessonsRequest {
  lessonIds: string[]
  updates: Partial<UpdateLessonRequest>
}

export interface LessonProgressUpdate {
  objectivesCompleted?: number
  activitiesCompleted?: number
  vocabularyPracticed?: number
  timeSpent?: number
}

// Japanese Language Support
export interface JapaneseText {
  kanji?: string
  hiragana?: string
  katakana?: string
  romaji?: string
  english: string
}

export interface JapaneseLessonContent {
  objectives: Array<{
    id: string
    japanese: JapaneseText
    achieved: boolean
  }>
  activities: Array<{
    id: string
    name: JapaneseText
    description: JapaneseText
    instructions: JapaneseText
  }>
  vocabulary: VocabularyItem[]
}

// Constants
export const LESSON_DURATION_PRESETS = [
  { label: '30分', value: 30 },
  { label: '45分', value: 45 },
  { label: '60分', value: 60 },
  { label: '90分', value: 90 },
  { label: '120分', value: 120 },
] as const

export const OBJECTIVE_CATEGORIES = [
  { key: 'speaking', label: 'スピーキング', color: 'blue' },
  { key: 'listening', label: 'リスニング', color: 'green' },
  { key: 'reading', label: '読解', color: 'purple' },
  { key: 'writing', label: 'ライティング', color: 'orange' },
  { key: 'grammar', label: '文法', color: 'red' },
  { key: 'vocabulary', label: '語彙', color: 'yellow' },
  { key: 'pronunciation', label: '発音', color: 'pink' },
  { key: 'cultural', label: '文化', color: 'indigo' },
  { key: 'social', label: 'ソーシャル', color: 'gray' },
] as const

export const ACTIVITY_TYPES = [
  { key: 'warmup', label: 'ウォームアップ', icon: '🔥' },
  { key: 'presentation', label: 'プレゼンテーション', icon: '📊' },
  { key: 'practice', label: '練習', icon: '💪' },
  { key: 'production', label: 'プロダクション', icon: '🎭' },
  { key: 'game', label: 'ゲーム', icon: '🎮' },
  { key: 'role_play', label: 'ロールプレイ', icon: '🎭' },
  { key: 'discussion', label: 'ディスカッション', icon: '💬' },
  { key: 'reading', label: '読解', icon: '📖' },
  { key: 'writing', label: 'ライティング', icon: '✏️' },
  { key: 'listening', label: 'リスニング', icon: '👂' },
  { key: 'review', label: '復習', icon: '🔄' },
  { key: 'assessment', label: '評価', icon: '📝' },
] as const

export const SKILL_LEVELS = [
  { key: 'excellent', label: '優秀', color: 'green', score: 5 },
  { key: 'good', label: '良い', color: 'blue', score: 4 },
  { key: 'developing', label: '発達中', color: 'yellow', score: 3 },
  { key: 'needs_practice', label: '練習が必要', color: 'orange', score: 2 },
  { key: 'not_assessed', label: '未評価', color: 'gray', score: 0 },
] as const

export const MOOD_RATINGS = [
  { key: 'very_happy', label: 'とても嬉しい', emoji: '😄', color: 'green' },
  { key: 'happy', label: '嬉しい', emoji: '😊', color: 'blue' },
  { key: 'neutral', label: '普通', emoji: '😐', color: 'gray' },
  { key: 'sad', label: '悲しい', emoji: '😢', color: 'orange' },
  { key: 'frustrated', label: 'イライラ', emoji: '😤', color: 'red' },
  { key: 'not_assessed', label: '未評価', emoji: '❓', color: 'gray' },
] as const