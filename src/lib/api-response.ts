import { NextResponse } from 'next/server'
import { ApiResponse, ApiError } from '@/types/api'

// Re-export the types for convenience
export type { ApiResponse, ApiError } from '@/types/api'

export class ApiResponseBuilder {
  static success<T>(data?: T, message?: string, meta?: any): NextResponse<ApiResponse<T>> {
    return NextResponse.json({
      success: true,
      data,
      message,
      meta,
    })
  }

  static error(
    error: ApiError | string,
    status: number = 400
  ): NextResponse<ApiResponse> {
    const errorObj: ApiError = typeof error === 'string' 
      ? { code: 'GENERIC_ERROR', message: error }
      : error

    return NextResponse.json({
      success: false,
      error: errorObj,
    }, { status })
  }

  static validationError(message: string, field?: string): NextResponse<ApiResponse> {
    return this.error({
      code: 'VALIDATION_ERROR',
      message,
      field,
    }, 400)
  }

  static unauthorizedError(message: string = 'Unauthorized'): NextResponse<ApiResponse> {
    return this.error({
      code: 'UNAUTHORIZED',
      message,
    }, 401)
  }

  static forbiddenError(message: string = 'Forbidden'): NextResponse<ApiResponse> {
    return this.error({
      code: 'FORBIDDEN',
      message,
    }, 403)
  }

  static notFoundError(resource: string): NextResponse<ApiResponse> {
    return this.error({
      code: 'NOT_FOUND',
      message: `${resource} not found`,
    }, 404)
  }

  static conflictError(message: string): NextResponse<ApiResponse> {
    return this.error({
      code: 'CONFLICT',
      message,
    }, 409)
  }

  static rateLimitError(): NextResponse<ApiResponse> {
    return this.error({
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests',
    }, 429)
  }

  static internalError(message: string = 'Internal server error'): NextResponse<ApiResponse> {
    return this.error({
      code: 'INTERNAL_ERROR',
      message,
    }, 500)
  }

  static serviceUnavailableError(message: string = 'Service temporarily unavailable'): NextResponse<ApiResponse> {
    return this.error({
      code: 'SERVICE_UNAVAILABLE',
      message,
    }, 503)
  }
}

// Error codes enum for consistency
export enum ErrorCodes {
  GENERIC_ERROR = 'GENERIC_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  
  // Business logic errors
  ORGANIZATION_NOT_FOUND = 'ORGANIZATION_NOT_FOUND',
  SCHOOL_NOT_FOUND = 'SCHOOL_NOT_FOUND',
  STUDENT_NOT_FOUND = 'STUDENT_NOT_FOUND',
  LESSON_NOT_FOUND = 'LESSON_NOT_FOUND',
  COURSE_NOT_FOUND = 'COURSE_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  
  SUBSCRIPTION_EXPIRED = 'SUBSCRIPTION_EXPIRED',
  FEATURE_NOT_AVAILABLE = 'FEATURE_NOT_AVAILABLE',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_SUSPENDED = 'ACCOUNT_SUSPENDED',
}