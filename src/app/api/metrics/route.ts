import { NextRequest } from 'next/server'
import { ApiResponseBuilder } from '@/lib/api-response'
import { applicationMetrics } from '@/lib/monitoring'
import { cacheService } from '@/lib/redis'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    // This endpoint should be protected and only accessible to monitoring systems
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.INTERNAL_API_TOKEN

    if (!authHeader || !expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return ApiResponseBuilder.unauthorizedError('Invalid internal API token')
    }

    // Get application metrics
    const appMetrics = applicationMetrics.getCurrentMetrics()

    // Get system metrics
    const memoryUsage = process.memoryUsage()
    const systemMetrics = {
      memory: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
        external: Math.round(memoryUsage.external / 1024 / 1024), // MB
      },
      process: {
        pid: process.pid,
        uptime: Math.round(process.uptime()),
        version: process.version,
      },
    }

    // Get cache metrics
    let cacheMetrics = null
    try {
      cacheMetrics = await cacheService.getStats()
    } catch (error) {
      logger.warn('Failed to get cache metrics', { error })
    }

    const metrics = {
      timestamp: new Date().toISOString(),
      application: appMetrics,
      system: systemMetrics,
      cache: cacheMetrics,
    }

    return ApiResponseBuilder.success(metrics, 'Metrics retrieved successfully')
  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : error,
    }, 'Metrics endpoint error')

    return ApiResponseBuilder.internalError()
  }
}