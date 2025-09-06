// Simple logger for Next.js that works in both server and edge runtime
const logLevels = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
} as const

type LogLevel = keyof typeof logLevels

const currentLevel = (process.env.LOG_LEVEL || 'info') as LogLevel

class SimpleLogger {
  private level: LogLevel
  private module?: string

  constructor(module?: string, level: LogLevel = currentLevel) {
    this.module = module
    this.level = level
  }

  private shouldLog(level: LogLevel): boolean {
    return logLevels[level] >= logLevels[this.level]
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString()
    const modulePrefix = this.module ? `[${this.module}] ` : ''
    const dataStr = data ? ` ${JSON.stringify(data)}` : ''
    return `${timestamp} [${level.toUpperCase()}] ${modulePrefix}${message}${dataStr}`
  }

  debug(data: any, message?: string) {
    if (this.shouldLog('debug')) {
      const msg = message || (typeof data === 'string' ? data : JSON.stringify(data))
      console.log(this.formatMessage('debug', msg, typeof data !== 'string' ? data : undefined))
    }
  }

  info(data: any, message?: string) {
    if (this.shouldLog('info')) {
      const msg = message || (typeof data === 'string' ? data : JSON.stringify(data))
      console.log(this.formatMessage('info', msg, typeof data !== 'string' ? data : undefined))
    }
  }

  warn(data: any, message?: string) {
    if (this.shouldLog('warn')) {
      const msg = message || (typeof data === 'string' ? data : JSON.stringify(data))
      console.warn(this.formatMessage('warn', msg, typeof data !== 'string' ? data : undefined))
    }
  }

  error(data: any, message?: string) {
    if (this.shouldLog('error')) {
      const msg = message || (typeof data === 'string' ? data : JSON.stringify(data))
      console.error(this.formatMessage('error', msg, typeof data !== 'string' ? data : undefined))
    }
  }

  child(context: { module?: string; requestId?: string }) {
    const moduleName = context.module || context.requestId || this.module
    return new SimpleLogger(moduleName, this.level)
  }
}

// Create base logger
export const logger = new SimpleLogger()

// Child loggers for different modules
export const createModuleLogger = (module: string) => {
  return new SimpleLogger(module)
}

// Structured logging helpers
export class LoggingService {
  private logger: SimpleLogger

  constructor(module?: string) {
    this.logger = module ? createModuleLogger(module) : logger
  }

  // Request logging
  logRequest(req: any, additionalData: any = {}) {
    this.logger.info({
      type: 'request',
      method: req.method,
      url: req.url,
      userAgent: req.headers?.['user-agent'],
      ip: req.headers?.['x-forwarded-for'] || req.headers?.['x-real-ip'],
      organizationId: req.headers?.['x-organization-id'],
      userId: req.headers?.['x-user-id'],
      ...additionalData,
    }, 'Incoming request')
  }

  // Response logging
  logResponse(req: any, res: any, duration: number, additionalData: any = {}) {
    this.logger.info({
      type: 'response',
      method: req.method,
      url: req.url,
      status: res.status,
      duration: `${duration}ms`,
      organizationId: req.headers?.['x-organization-id'],
      userId: req.headers?.['x-user-id'],
      ...additionalData,
    }, 'Request completed')
  }

  // Database operation logging
  logDatabaseOperation(operation: string, model: string, duration: number, additionalData: any = {}) {
    this.logger.debug({
      type: 'database',
      operation,
      model,
      duration: `${duration}ms`,
      ...additionalData,
    }, 'Database operation')
  }

  // Cache operation logging
  logCacheOperation(operation: string, key: string, hit?: boolean, duration?: number) {
    this.logger.debug({
      type: 'cache',
      operation,
      key,
      hit,
      duration: duration ? `${duration}ms` : undefined,
    }, 'Cache operation')
  }

  // Business logic logging
  logBusinessEvent(event: string, organizationId: string, userId?: string, data: any = {}) {
    this.logger.info({
      type: 'business',
      event,
      organizationId,
      userId,
      ...data,
    }, `Business event: ${event}`)
  }

  // Security logging
  logSecurityEvent(event: string, severity: 'low' | 'medium' | 'high' | 'critical', data: any = {}) {
    this.logger.warn({
      type: 'security',
      event,
      severity,
      ...data,
    }, `Security event: ${event}`)
  }

  // Performance logging
  logPerformance(operation: string, duration: number, threshold: number = 1000, data: any = {}) {
    const level = duration > threshold ? 'warn' : 'info'
    this.logger[level]({
      type: 'performance',
      operation,
      duration: `${duration}ms`,
      threshold: `${threshold}ms`,
      ...data,
    }, `Performance: ${operation}`)
  }

  // Error logging with context
  logError(error: Error | string, context: any = {}) {
    const errorMessage = error instanceof Error ? error.message : error
    const errorStack = error instanceof Error ? error.stack : undefined

    this.logger.error({
      type: 'error',
      error: errorMessage,
      stack: errorStack,
      ...context,
    }, 'Error occurred')
  }

  // Audit logging
  logAudit(action: string, resource: string, organizationId: string, userId: string, data: any = {}) {
    this.logger.info({
      type: 'audit',
      action,
      resource,
      organizationId,
      userId,
      timestamp: new Date().toISOString(),
      ...data,
    }, `Audit: ${action} on ${resource}`)
  }

  // Rate limiting logging
  logRateLimit(identifier: string, limit: number, current: number, window: string) {
    this.logger.warn({
      type: 'ratelimit',
      identifier,
      limit,
      current,
      window,
    }, 'Rate limit event')
  }

  // Feature flag logging
  logFeatureFlag(flag: string, enabled: boolean, organizationId: string, userId?: string) {
    this.logger.debug({
      type: 'feature_flag',
      flag,
      enabled,
      organizationId,
      userId,
    }, `Feature flag: ${flag}`)
  }

  // Health check logging
  logHealthCheck(service: string, status: 'healthy' | 'unhealthy', duration?: number, details?: any) {
    const level = status === 'healthy' ? 'debug' : 'warn'
    this.logger[level]({
      type: 'health',
      service,
      status,
      duration: duration ? `${duration}ms` : undefined,
      details,
    }, `Health check: ${service}`)
  }
}

// Request ID middleware for tracing
export function withRequestId() {
  const requestId = Math.random().toString(36).substring(2, 15)
  return new SimpleLogger(requestId)
}

// Error handling helper
export function logAndThrow(message: string, context: any = {}) {
  logger.error({ ...context, type: 'fatal' }, message)
  throw new Error(message)
}

// Metrics logging (for integration with monitoring systems)
export class MetricsLogger {
  static logMetric(name: string, value: number, tags: Record<string, string> = {}) {
    logger.info({
      type: 'metric',
      name,
      value,
      tags,
      timestamp: Date.now(),
    }, `Metric: ${name}`)
  }

  static logCounter(name: string, increment: number = 1, tags: Record<string, string> = {}) {
    this.logMetric(`${name}.count`, increment, tags)
  }

  static logGauge(name: string, value: number, tags: Record<string, string> = {}) {
    this.logMetric(`${name}.gauge`, value, tags)
  }

  static logHistogram(name: string, value: number, tags: Record<string, string> = {}) {
    this.logMetric(`${name}.histogram`, value, tags)
  }

  static logTimer(name: string, duration: number, tags: Record<string, string> = {}) {
    this.logMetric(`${name}.timer`, duration, tags)
  }
}

// Export default logger
export default logger