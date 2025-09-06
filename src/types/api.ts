import { NextRequest } from 'next/server'

// Base API response structure
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  message?: string
  meta?: {
    total?: number
    page?: number
    limit?: number
    hasNext?: boolean
    hasPrev?: boolean
  }
}

// Error structure
export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  field?: string
}

// Request with user context
export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string
    email: string
    role: string
    organizationId: string
    schoolIds?: string[]
  }
  organization: {
    id: string
    slug: string
    plan: string
  }
}

// Pagination parameters
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Filter parameters
export interface FilterParams {
  search?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  [key: string]: any
}

// API Handler type
export type ApiHandler<T = any> = (
  request: AuthenticatedRequest,
  params?: { params: Record<string, string> }
) => Promise<Response>

// Service response type
export interface ServiceResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: {
    total?: number
    page?: number
    limit?: number
  }
}

// Repository response type
export interface RepositoryResponse<T = any> {
  data: T
  total?: number
}

// Event types for event-driven architecture
export interface EventPayload {
  type: string
  organizationId: string
  userId?: string
  data: Record<string, any>
  metadata?: Record<string, any>
}

// Cache key patterns
export interface CacheKeyPatterns {
  USER_PROFILE: (userId: string) => string
  ORGANIZATION: (orgId: string) => string
  SCHOOL_LIST: (orgId: string) => string
  STUDENT_LIST: (schoolId: string) => string
  LESSON_LIST: (schoolId: string, date: string) => string
  ANALYTICS: (schoolId: string, period: string) => string
}

// Rate limiting
export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyGenerator?: (request: NextRequest) => string
}