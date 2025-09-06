import { NextRequest } from 'next/server'
import { ApiResponseBuilder } from '@/lib/api-response'
import { EventService } from '@/services/event.service'
import { EventRegistry } from '@/lib/event-registry'
import { logger } from '@/lib/logger'

// Ensure event handlers are registered
EventRegistry.initialize()

export async function POST(request: NextRequest) {
  try {
    // This endpoint should be protected and only callable by cron jobs or internal systems
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.INTERNAL_API_TOKEN

    if (!authHeader || !expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return ApiResponseBuilder.unauthorizedError('Invalid internal API token')
    }

    const eventService = new EventService()
    const result = await eventService.processPendingEvents()

    if (!result.success) {
      return ApiResponseBuilder.error(
        result.error?.code || 'PROCESSING_ERROR',
        result.error?.message || 'Failed to process events'
      )
    }

    return ApiResponseBuilder.success(result.data, 'Events processed successfully')
  } catch (error) {
    logger.error('Event processing endpoint error', {
      error: error instanceof Error ? error.message : error,
    })

    return ApiResponseBuilder.internalError()
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get event statistics
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.INTERNAL_API_TOKEN

    if (!authHeader || !expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return ApiResponseBuilder.unauthorizedError('Invalid internal API token')
    }

    const url = new URL(request.url)
    const organizationId = url.searchParams.get('organizationId')
    const hours = parseInt(url.searchParams.get('hours') || '24')

    if (!organizationId) {
      return ApiResponseBuilder.validationError('Organization ID is required')
    }

    const eventService = new EventService()
    const result = await eventService.getEventStats(organizationId, hours)

    if (!result.success) {
      return ApiResponseBuilder.error(
        result.error?.code || 'STATS_ERROR',
        result.error?.message || 'Failed to get event statistics'
      )
    }

    return ApiResponseBuilder.success(result.data, 'Event statistics retrieved successfully')
  } catch (error) {
    logger.error('Event stats endpoint error', {
      error: error instanceof Error ? error.message : error,
    })

    return ApiResponseBuilder.internalError()
  }
}