import { NextRequest, NextResponse } from 'next/server'
import { TenantService, TenantContext } from '@/lib/tenant'
import { ApiResponseBuilder, ErrorCodes } from '@/lib/api-response'
import { logger } from '@/lib/logger'

/**
 * Middleware to handle tenant context and data isolation
 */
export async function tenantMiddleware(
  request: NextRequest,
  handler: (request: NextRequest & { tenant: TenantContext }) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Extract tenant context from request headers
    const tenantContext = TenantService.getTenantContext(request)
    
    if (!tenantContext) {
      logger.warn('No tenant context found in request', {
        path: request.nextUrl.pathname,
      })
      
      return ApiResponseBuilder.unauthorizedError('Invalid tenant context')
    }

    // Enrich tenant context with organization details
    const enrichedContext = await TenantService.enrichTenantContext(tenantContext)
    
    if (!enrichedContext) {
      logger.warn('Organization not found or inactive', {
        organizationId: tenantContext.organizationId,
      })
      
      return ApiResponseBuilder.forbiddenError('Organization not accessible')
    }

    // Add tenant context to request
    const requestWithTenant = Object.assign(request, {
      tenant: enrichedContext,
    })

    // Call the handler with tenant context
    return await handler(requestWithTenant)
  } catch (error) {
    logger.error('Tenant middleware error', {
      error: error instanceof Error ? error.message : error,
    })
    
    return ApiResponseBuilder.internalError('Tenant context processing failed')
  }
}

/**
 * Higher-order function to wrap API handlers with tenant middleware
 */
export function withTenant<T extends NextRequest & { tenant: TenantContext }>(
  handler: (request: T) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    return tenantMiddleware(request, handler as any)
  }
}

/**
 * Feature access middleware
 */
export function requireFeature(feature: string) {
  return (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    const originalMethod = descriptor.value

    descriptor.value = async function (
      request: NextRequest & { tenant: TenantContext },
      ...args: any[]
    ) {
      if (!TenantService.hasFeatureAccess(request.tenant.plan, feature)) {
        logger.warn('Feature access denied', {
          organizationId: request.tenant.organizationId,
          plan: request.tenant.plan,
          feature,
        })
        
        return ApiResponseBuilder.forbiddenError(
          `Feature '${feature}' not available in your current plan`
        )
      }

      return originalMethod.apply(this, [request, ...args])
    }

    return descriptor
  }
}

/**
 * Resource limit middleware
 */
export function checkResourceLimit(resource: string) {
  return (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    const originalMethod = descriptor.value

    descriptor.value = async function (
      request: NextRequest & { tenant: TenantContext },
      ...args: any[]
    ) {
      const canCreate = await TenantService.canCreateResource(
        request.tenant.organizationId,
        request.tenant.plan,
        resource
      )

      if (!canCreate) {
        logger.warn('Resource limit exceeded', {
          organizationId: request.tenant.organizationId,
          plan: request.tenant.plan,
          resource,
        })
        
        return ApiResponseBuilder.forbiddenError(
          `Resource limit exceeded for '${resource}'. Please upgrade your plan.`
        )
      }

      return originalMethod.apply(this, [request, ...args])
    }

    return descriptor
  }
}

/**
 * School access validation middleware
 */
export function requireSchoolAccess() {
  return (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    const originalMethod = descriptor.value

    descriptor.value = async function (
      request: NextRequest & { tenant: TenantContext },
      { params }: { params: { schoolId: string } },
      ...args: any[]
    ) {
      const schoolId = params?.schoolId
      
      if (!schoolId) {
        return ApiResponseBuilder.validationError('School ID is required')
      }

      if (!TenantService.validateSchoolAccess(request.tenant, schoolId)) {
        logger.warn('School access denied', {
          userId: request.tenant.userId,
          organizationId: request.tenant.organizationId,
          schoolId,
          userRole: request.tenant.userRole,
        })
        
        return ApiResponseBuilder.forbiddenError('Access to this school is not allowed')
      }

      return originalMethod.apply(this, [request, { params }, ...args])
    }

    return descriptor
  }
}

/**
 * Audit logging middleware for tenant actions
 */
export function auditLog(action: string, resourceType: string) {
  return (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    const originalMethod = descriptor.value

    descriptor.value = async function (
      request: NextRequest & { tenant: TenantContext },
      ...args: any[]
    ) {
      const startTime = Date.now()
      const result = await originalMethod.apply(this, [request, ...args])
      const duration = Date.now() - startTime

      // Log the action for audit purposes
      logger.info('Tenant action audit', {
        action,
        resourceType,
        organizationId: request.tenant.organizationId,
        userId: request.tenant.userId,
        userRole: request.tenant.userRole,
        duration,
        success: result.status < 400,
        statusCode: result.status,
      })

      return result
    }

    return descriptor
  }
}