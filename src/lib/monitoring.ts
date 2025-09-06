import { NextRequest, NextResponse } from 'next/server'
import { logger, MetricsLogger } from './logger'

// Performance monitoring
export class PerformanceMonitor {
  private startTime: number
  private operation: string
  private metadata: Record<string, any>

  constructor(operation: string, metadata: Record<string, any> = {}) {
    this.operation = operation
    this.metadata = metadata
    this.startTime = Date.now()
  }

  end(additionalMetadata: Record<string, any> = {}) {
    const duration = Date.now() - this.startTime
    const allMetadata = { ...this.metadata, ...additionalMetadata }

    // Log performance metrics
    logger.info({
      type: 'performance',
      operation: this.operation,
      duration,
      ...allMetadata,
    }, `Performance: ${this.operation} completed in ${duration}ms`)

    // Send metrics to monitoring system
    MetricsLogger.logTimer(
      `performance.${this.operation.replace(/\s+/g, '_').toLowerCase()}`,
      duration,
      allMetadata
    )

    return duration
  }

  static async measure<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata: Record<string, any> = {}
  ): Promise<T> {
    const monitor = new PerformanceMonitor(operation, metadata)
    try {
      const result = await fn()
      monitor.end({ success: true })
      return result
    } catch (error) {
      monitor.end({ success: false, error: error instanceof Error ? error.message : error })
      throw error
    }
  }
}

// Health check system
export interface HealthCheck {
  name: string
  check: () => Promise<{ healthy: boolean; details?: any; latency?: number }>
}

export class HealthCheckService {
  private checks: Map<string, HealthCheck> = new Map()

  registerCheck(check: HealthCheck) {
    this.checks.set(check.name, check)
  }

  async runCheck(name: string): Promise<{ healthy: boolean; details?: any; latency?: number }> {
    const check = this.checks.get(name)
    if (!check) {
      return { healthy: false, details: { error: 'Check not found' } }
    }

    const start = Date.now()
    try {
      const result = await check.check()
      const latency = Date.now() - start
      
      logger.debug({
        type: 'health_check',
        check: name,
        healthy: result.healthy,
        latency,
        details: result.details,
      }, `Health check: ${name}`)

      return { ...result, latency }
    } catch (error) {
      const latency = Date.now() - start
      logger.error({
        type: 'health_check',
        check: name,
        healthy: false,
        latency,
        error: error instanceof Error ? error.message : error,
      }, `Health check failed: ${name}`)

      return {
        healthy: false,
        latency,
        details: { error: error instanceof Error ? error.message : error },
      }
    }
  }

  async runAllChecks(): Promise<{ healthy: boolean; checks: Record<string, any> }> {
    const results: Record<string, any> = {}
    let overallHealthy = true

    await Promise.all(
      Array.from(this.checks.keys()).map(async (name) => {
        const result = await this.runCheck(name)
        results[name] = result
        if (!result.healthy) {
          overallHealthy = false
        }
      })
    )

    return { healthy: overallHealthy, checks: results }
  }
}

// Create singleton health check service
export const healthCheckService = new HealthCheckService()

// Built-in health checks
export const builtInHealthChecks = {
  database: {
    name: 'database',
    check: async () => {
      try {
        const { PrismaClient } = await import('@prisma/client')
        const prisma = new PrismaClient()
        
        const start = Date.now()
        await prisma.$queryRaw`SELECT 1`
        const latency = Date.now() - start
        
        await prisma.$disconnect()
        
        return {
          healthy: true,
          details: { latency: `${latency}ms` },
          latency,
        }
      } catch (error) {
        return {
          healthy: false,
          details: { error: error instanceof Error ? error.message : error },
        }
      }
    },
  },

  redis: {
    name: 'redis',
    check: async () => {
      try {
        const { getRedisClient } = await import('./redis')
        const redis = getRedisClient()
        
        const start = Date.now()
        await redis.ping()
        const latency = Date.now() - start
        
        return {
          healthy: true,
          details: { latency: `${latency}ms` },
          latency,
        }
      } catch (error) {
        return {
          healthy: false,
          details: { error: error instanceof Error ? error.message : error },
        }
      }
    },
  },

  memory: {
    name: 'memory',
    check: async () => {
      const usage = process.memoryUsage()
      const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024)
      const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024)
      const heapUsagePercent = Math.round((usage.heapUsed / usage.heapTotal) * 100)
      
      // Consider unhealthy if heap usage > 90%
      const healthy = heapUsagePercent < 90
      
      return {
        healthy,
        details: {
          heapUsed: `${heapUsedMB}MB`,
          heapTotal: `${heapTotalMB}MB`,
          heapUsagePercent: `${heapUsagePercent}%`,
          rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
        },
      }
    },
  },

  disk: {
    name: 'disk',
    check: async () => {
      try {
        const fs = await import('fs/promises')
        const stats = await fs.stat('.')
        
        return {
          healthy: true,
          details: {
            accessible: true,
            stats: {
              size: stats.size,
              isDirectory: stats.isDirectory(),
              isFile: stats.isFile(),
            },
          },
        }
      } catch (error) {
        return {
          healthy: false,
          details: { error: error instanceof Error ? error.message : error },
        }
      }
    },
  },
}

// Request monitoring middleware
export function withRequestMonitoring() {
  return (handler: (req: NextRequest) => Promise<NextResponse>) => {
    return async (req: NextRequest): Promise<NextResponse> => {
      const startTime = Date.now()
      const requestId = Math.random().toString(36).substring(2, 15)
      
      // Log request
      logger.info({
        type: 'request',
        requestId,
        method: req.method,
        url: req.url,
        userAgent: req.headers.get('user-agent'),
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      }, 'Request started')

      try {
        const response = await handler(req)
        const duration = Date.now() - startTime
        
        // Log response
        logger.info({
          type: 'response',
          requestId,
          method: req.method,
          url: req.url,
          status: response.status,
          duration,
        }, 'Request completed')

        // Send metrics
        MetricsLogger.logTimer('http.request.duration', duration, {
          method: req.method,
          status: response.status.toString(),
          route: req.nextUrl.pathname,
        })

        MetricsLogger.logCounter('http.request.count', 1, {
          method: req.method,
          status: response.status.toString(),
          route: req.nextUrl.pathname,
        })

        return response
      } catch (error) {
        const duration = Date.now() - startTime
        
        logger.error({
          type: 'request_error',
          requestId,
          method: req.method,
          url: req.url,
          duration,
          error: error instanceof Error ? error.message : error,
        }, 'Request failed')

        // Send error metrics
        MetricsLogger.logCounter('http.request.error', 1, {
          method: req.method,
          route: req.nextUrl.pathname,
        })

        throw error
      }
    }
  }
}

// Application metrics
export class ApplicationMetrics {
  private static instance: ApplicationMetrics
  private metrics: Map<string, any> = new Map()

  static getInstance(): ApplicationMetrics {
    if (!this.instance) {
      this.instance = new ApplicationMetrics()
    }
    return this.instance
  }

  // User metrics
  recordUserAction(action: string, organizationId: string, userId: string) {
    MetricsLogger.logCounter('user.action', 1, {
      action,
      organizationId,
      userId,
    })
  }

  recordUserLogin(organizationId: string, success: boolean) {
    MetricsLogger.logCounter('user.login', 1, {
      organizationId,
      success: success.toString(),
    })
  }

  // Database metrics
  recordDatabaseQuery(model: string, operation: string, duration: number) {
    MetricsLogger.logTimer('database.query.duration', duration, {
      model,
      operation,
    })
  }

  recordDatabaseError(model: string, operation: string, error: string) {
    MetricsLogger.logCounter('database.error', 1, {
      model,
      operation,
      error,
    })
  }

  // Cache metrics
  recordCacheOperation(operation: string, hit: boolean, duration?: number) {
    MetricsLogger.logCounter('cache.operation', 1, {
      operation,
      hit: hit.toString(),
    })

    if (duration !== undefined) {
      MetricsLogger.logTimer('cache.operation.duration', duration, {
        operation,
        hit: hit.toString(),
      })
    }
  }

  // Business metrics
  recordBusinessEvent(event: string, organizationId: string, value?: number) {
    MetricsLogger.logCounter(`business.${event}`, 1, {
      organizationId,
    })

    if (value !== undefined) {
      MetricsLogger.logGauge(`business.${event}.value`, value, {
        organizationId,
      })
    }
  }

  // System metrics
  recordSystemMetric(name: string, value: number, tags: Record<string, string> = {}) {
    MetricsLogger.logGauge(`system.${name}`, value, tags)
  }

  // Get current metrics
  getCurrentMetrics(): Record<string, any> {
    return Object.fromEntries(this.metrics)
  }
}

// Export singleton instance
export const applicationMetrics = ApplicationMetrics.getInstance()

// Initialize built-in health checks
export function initializeHealthChecks() {
  Object.values(builtInHealthChecks).forEach(check => {
    healthCheckService.registerCheck(check)
  })
  
  logger.info('Health checks initialized', {
    checks: Object.keys(builtInHealthChecks),
  })
}

// Error tracking and alerting
export class ErrorTracker {
  static trackError(error: Error, context: Record<string, any> = {}) {
    logger.error({
      type: 'error_tracking',
      error: error.message,
      stack: error.stack,
      ...context,
    }, 'Error tracked')

    // Send error metrics
    MetricsLogger.logCounter('error.count', 1, {
      error: error.constructor.name,
      ...context,
    })

    // In production, this would integrate with error tracking services
    // like Sentry, Bugsnag, or custom alerting systems
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service
    }
  }

  static trackSecurityIncident(
    incident: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    context: Record<string, any> = {}
  ) {
    logger.warn({
      type: 'security_incident',
      incident,
      severity,
      ...context,
    }, `Security incident: ${incident}`)

    MetricsLogger.logCounter('security.incident', 1, {
      incident,
      severity,
      ...context,
    })

    // In production, this would trigger immediate alerts for high/critical incidents
    if (severity === 'critical' || severity === 'high') {
      // TODO: Send immediate alert
    }
  }
}