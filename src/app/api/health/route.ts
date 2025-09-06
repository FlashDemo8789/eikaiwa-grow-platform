import { NextRequest } from 'next/server'
import { ApiResponseBuilder } from '@/lib/api-response'
import { healthCheckService, initializeHealthChecks } from '@/lib/monitoring'
import { logger } from '@/lib/logger'

// Initialize health checks on module load
initializeHealthChecks()

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const checkName = url.searchParams.get('check')

    if (checkName) {
      // Run specific health check
      const result = await healthCheckService.runCheck(checkName)
      
      if (result.healthy) {
        return ApiResponseBuilder.success(result, `Health check ${checkName} passed`)
      } else {
        return ApiResponseBuilder.error(
          'HEALTH_CHECK_FAILED',
          `Health check ${checkName} failed`,
          503
        )
      }
    } else {
      // Run all health checks
      const results = await healthCheckService.runAllChecks()
      
      if (results.healthy) {
        return ApiResponseBuilder.success(results, 'All health checks passed')
      } else {
        return ApiResponseBuilder.error(
          'HEALTH_CHECK_FAILED',
          'One or more health checks failed',
          503
        )
      }
    }
  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : error,
    }, 'Health check endpoint error')

    return ApiResponseBuilder.internalError('Health check endpoint failed')
  }
}

// Liveness probe - simple check that the application is running
export async function HEAD() {
  return new Response(null, { status: 200 })
}