import { ServiceResponse, ApiError, PaginationParams, FilterParams } from '@/types/api'
import { logger } from '@/lib/logger'
import { ErrorCodes } from '@/lib/api-response'

export abstract class BaseService {
  protected serviceName: string

  constructor(serviceName: string) {
    this.serviceName = serviceName
  }

  protected success<T>(data?: T, meta?: any): ServiceResponse<T> {
    return {
      success: true,
      data,
      meta,
    }
  }

  protected error(code: string, message: string, field?: string): ServiceResponse {
    const error: ApiError = {
      code,
      message,
      field,
    }

    logger.error({ error }, `[${this.serviceName}] ${message}`)

    return {
      success: false,
      error,
    }
  }

  protected validationError(message: string, field?: string): ServiceResponse {
    return this.error(ErrorCodes.VALIDATION_ERROR, message, field)
  }

  protected notFoundError(resource: string): ServiceResponse {
    return this.error(ErrorCodes.NOT_FOUND, `${resource} not found`)
  }

  protected conflictError(message: string): ServiceResponse {
    return this.error(ErrorCodes.CONFLICT, message)
  }

  protected forbiddenError(message: string = 'Access denied'): ServiceResponse {
    return this.error(ErrorCodes.FORBIDDEN, message)
  }

  protected async handleServiceCall<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<ServiceResponse<T>> {
    try {
      const result = await operation()
      logger.info(`[${this.serviceName}] ${operationName} completed successfully`)
      return this.success(result)
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : error,
      }, `[${this.serviceName}] ${operationName} failed`)

      if (error instanceof Error) {
        // Handle specific database errors
        if (error.message.includes('Unique constraint')) {
          return this.conflictError('Resource already exists')
        }
        
        if (error.message.includes('Foreign key constraint')) {
          return this.validationError('Invalid reference to related resource')
        }

        if (error.message.includes('Record to update not found')) {
          return this.notFoundError('Resource')
        }
      }

      return this.error(ErrorCodes.INTERNAL_ERROR, 'An unexpected error occurred')
    }
  }

  protected validatePagination(pagination: PaginationParams): PaginationParams {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination

    return {
      page: Math.max(1, page),
      limit: Math.min(100, Math.max(1, limit)), // Max 100 items per page
      sortBy,
      sortOrder: sortOrder === 'asc' ? 'asc' : 'desc',
    }
  }

  protected sanitizeFilters(filters: FilterParams): FilterParams {
    const sanitized: FilterParams = {}

    // Remove empty strings and null values
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        sanitized[key] = value
      }
    })

    return sanitized
  }

  protected async checkResourceAccess(
    resourceId: string,
    organizationId: string,
    checkFunction: (id: string, orgId: string) => Promise<boolean>
  ): Promise<boolean> {
    try {
      return await checkFunction(resourceId, organizationId)
    } catch (error) {
      logger.warn(`[${this.serviceName}] Access check failed`, {
        resourceId,
        organizationId,
        error: error instanceof Error ? error.message : error,
      })
      return false
    }
  }

  protected generateCacheKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.join(':')}`
  }

  protected async withCache<T>(
    cacheKey: string,
    fetchFunction: () => Promise<T>,
    ttlSeconds: number = 300 // 5 minutes default
  ): Promise<T> {
    // This would integrate with Redis cache
    // For now, just return the direct result
    return await fetchFunction()
  }
}