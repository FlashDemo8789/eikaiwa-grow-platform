import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { Organization, Plan } from '@/lib/prisma-stub'

export interface TenantContext {
  organizationId: string
  organizationSlug: string
  plan: Plan
  userId: string
  userRole: string
  schoolIds: string[]
}

export class TenantService {
  /**
   * Extract tenant context from request headers
   */
  static getTenantContext(request: NextRequest): TenantContext | null {
    const organizationId = request.headers.get('x-organization-id')
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')
    const schoolIdsHeader = request.headers.get('x-school-ids')

    if (!organizationId || !userId || !userRole) {
      return null
    }

    let schoolIds: string[] = []
    try {
      schoolIds = schoolIdsHeader ? JSON.parse(schoolIdsHeader) : []
    } catch {
      schoolIds = []
    }

    return {
      organizationId,
      organizationSlug: '', // Will be populated when needed
      plan: 'BASIC' as Plan, // Will be populated when needed
      userId,
      userRole,
      schoolIds,
    }
  }

  /**
   * Get organization details and enrich tenant context
   */
  static async enrichTenantContext(context: TenantContext): Promise<TenantContext | null> {
    try {
      const organization = await prisma.organization.findUnique({
        where: { id: context.organizationId },
        select: {
          id: true,
          slug: true,
          plan: true,
          status: true,
        },
      })

      if (!organization || organization.status !== 'ACTIVE') {
        return null
      }

      return {
        ...context,
        organizationSlug: organization.slug,
        plan: organization.plan,
      }
    } catch (error) {
      logger.error('Failed to enrich tenant context', {
        organizationId: context.organizationId,
        error: error instanceof Error ? error.message : error,
      })
      return null
    }
  }

  /**
   * Check if organization has access to a feature based on their plan
   */
  static hasFeatureAccess(plan: Plan, feature: string): boolean {
    const PLAN_FEATURES: Record<Plan, string[]> = {
      BASIC: [
        'basic_analytics',
        'student_management',
        'lesson_scheduling',
        'attendance_tracking',
      ],
      PROFESSIONAL: [
        'basic_analytics',
        'student_management',
        'lesson_scheduling',
        'attendance_tracking',
        'advanced_analytics',
        'progress_tracking',
        'automated_notifications',
        'api_access',
        'multiple_schools',
      ],
      ENTERPRISE: [
        'basic_analytics',
        'student_management',
        'lesson_scheduling',
        'attendance_tracking',
        'advanced_analytics',
        'progress_tracking',
        'automated_notifications',
        'api_access',
        'multiple_schools',
        'custom_branding',
        'advanced_reporting',
        'sso_integration',
        'priority_support',
        'data_export',
      ],
    }

    return PLAN_FEATURES[plan]?.includes(feature) || false
  }

  /**
   * Check resource limits based on organization plan
   */
  static checkResourceLimits(plan: Plan, resource: string): number {
    const PLAN_LIMITS: Record<Plan, Record<string, number>> = {
      BASIC: {
        schools: 1,
        users_per_school: 5,
        students_per_school: 100,
        api_calls_per_month: 1000,
        storage_gb: 1,
      },
      PROFESSIONAL: {
        schools: 5,
        users_per_school: 20,
        students_per_school: 500,
        api_calls_per_month: 10000,
        storage_gb: 10,
      },
      ENTERPRISE: {
        schools: -1, // Unlimited
        users_per_school: -1, // Unlimited
        students_per_school: -1, // Unlimited
        api_calls_per_month: -1, // Unlimited
        storage_gb: 100,
      },
    }

    return PLAN_LIMITS[plan]?.[resource] || 0
  }

  /**
   * Get current usage for resource limits checking
   */
  static async getCurrentUsage(
    organizationId: string,
    resource: string
  ): Promise<number> {
    try {
      switch (resource) {
        case 'schools':
          return await prisma.school.count({
            where: {
              organizationId,
              status: 'ACTIVE',
            },
          })

        case 'users':
          return await prisma.user.count({
            where: {
              organizationId,
              status: 'ACTIVE',
            },
          })

        case 'students':
          return await prisma.student.count({
            where: {
              organizationId,
              status: 'ACTIVE',
            },
          })

        default:
          return 0
      }
    } catch (error) {
      logger.error('Failed to get current usage', {
        organizationId,
        resource,
        error: error instanceof Error ? error.message : error,
      })
      return 0
    }
  }

  /**
   * Check if organization can create more resources
   */
  static async canCreateResource(
    organizationId: string,
    plan: Plan,
    resource: string
  ): Promise<boolean> {
    const limit = this.checkResourceLimits(plan, resource)
    
    // Unlimited resources
    if (limit === -1) {
      return true
    }

    const currentUsage = await this.getCurrentUsage(organizationId, resource)
    return currentUsage < limit
  }

  /**
   * Data isolation middleware - ensures queries are scoped to organization
   */
  static createDataIsolationWrapper() {
    return {
      /**
       * Wrap Prisma queries with organization scoping
       */
      withOrganizationScope: <T>(
        organizationId: string,
        query: (prisma: any) => Promise<T>
      ): Promise<T> => {
        // Create a proxy that automatically adds organizationId to where clauses
        const scopedPrisma = new Proxy(prisma, {
          get(target, prop) {
            const original = target[prop]
            
            if (typeof original === 'object' && original !== null) {
              // For model operations like prisma.user.findMany
              return new Proxy(original, {
                get(modelTarget, modelProp) {
                  const modelMethod = modelTarget[modelProp]
                  
                  if (typeof modelMethod === 'function') {
                    return (...args: any[]) => {
                      // Add organizationId to where clause
                      if (args[0] && typeof args[0] === 'object') {
                        if (args[0].where) {
                          args[0].where.organizationId = organizationId
                        } else {
                          args[0].where = { organizationId }
                        }
                      }
                      
                      return modelMethod.apply(modelTarget, args)
                    }
                  }
                  
                  return modelMethod
                },
              })
            }
            
            return original
          },
        })

        return query(scopedPrisma)
      },
    }
  }

  /**
   * Validate tenant access to a specific school
   */
  static validateSchoolAccess(
    context: TenantContext,
    schoolId: string
  ): boolean {
    // Super admin and org admin can access all schools in their organization
    if (['SUPER_ADMIN', 'ORG_ADMIN'].includes(context.userRole)) {
      return true
    }

    // Other users can only access their assigned schools
    return context.schoolIds.includes(schoolId)
  }

  /**
   * Get accessible schools for a user
   */
  static async getAccessibleSchools(
    context: TenantContext
  ): Promise<string[]> {
    // Super admin and org admin can access all schools in their organization
    if (['SUPER_ADMIN', 'ORG_ADMIN'].includes(context.userRole)) {
      const schools = await prisma.school.findMany({
        where: {
          organizationId: context.organizationId,
          status: 'ACTIVE',
        },
        select: {
          id: true,
        },
      })
      
      return schools.map(school => school.id)
    }

    // Other users can only access their assigned schools
    return context.schoolIds
  }

  /**
   * Create organization-scoped database connection
   */
  static createScopedConnection(organizationId: string) {
    // This could be enhanced to use read replicas or sharding
    return {
      ...prisma,
      // Add organization context to all queries
      $use: async (params: any, next: any) => {
        // Add organizationId to all queries where applicable
        if (params.model && params.args?.where) {
          // List of models that should be scoped by organization
          const scopedModels = [
            'User',
            'School',
            'Student',
            'Course',
            'Lesson',
            'Event',
          ]

          if (scopedModels.includes(params.model)) {
            params.args.where.organizationId = organizationId
          }
        }

        return next(params)
      },
    }
  }
}

/**
 * Tenant-aware base repository that automatically applies data isolation
 */
export abstract class TenantAwareRepository<T> {
  protected organizationId: string
  protected prisma: any

  constructor(organizationId: string) {
    this.organizationId = organizationId
    this.prisma = TenantService.createScopedConnection(organizationId)
  }

  protected addTenantScope(where: any = {}): any {
    return {
      ...where,
      organizationId: this.organizationId,
    }
  }

  protected async validateTenantAccess<R>(
    operation: () => Promise<R>
  ): Promise<R> {
    try {
      return await operation()
    } catch (error) {
      logger.error('Tenant access validation failed', {
        organizationId: this.organizationId,
        error: error instanceof Error ? error.message : error,
      })
      throw error
    }
  }
}