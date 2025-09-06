import prisma from '@/lib/prisma'
import { EventPayload, ServiceResponse } from '@/types/api'
import { BaseService } from './base.service'
import { Event, EventStatus } from '@/lib/prisma-stub'
import { logger } from '@/lib/logger'

export interface EventHandler {
  canHandle(eventType: string): boolean
  handle(event: Event): Promise<void>
}

export class EventService extends BaseService {
  private static handlers: Map<string, EventHandler> = new Map()

  constructor() {
    super('EventService')
  }

  /**
   * Register an event handler
   */
  static registerHandler(eventType: string, handler: EventHandler): void {
    this.handlers.set(eventType, handler)
    logger.info(`Event handler registered for type: ${eventType}`)
  }

  /**
   * Emit an event to be processed asynchronously
   */
  async emit(payload: EventPayload): Promise<ServiceResponse<Event>> {
    return await this.handleServiceCall(async () => {
      const event = await prisma.event.create({
        data: {
          type: payload.type,
          payload: payload.data,
          organizationId: payload.organizationId,
          userId: payload.userId,
          status: EventStatus.PENDING,
          retryCount: 0,
          maxRetries: 3,
        },
      })

      logger.info('Event emitted', {
        eventId: event.id,
        type: event.type,
        organizationId: event.organizationId,
        userId: event.userId,
      })

      // Attempt immediate processing (fire and forget)
      this.processEventAsync(event.id).catch((error) => {
        logger.warn('Immediate event processing failed, will retry later', {
          eventId: event.id,
          error: error instanceof Error ? error.message : error,
        })
      })

      return event
    }, 'emit')
  }

  /**
   * Process a single event
   */
  async processEvent(eventId: string): Promise<ServiceResponse<void>> {
    return await this.handleServiceCall(async () => {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
      })

      if (!event) {
        throw new Error('Event not found')
      }

      if (event.status === EventStatus.COMPLETED) {
        logger.debug('Event already processed', { eventId })
        return
      }

      if (event.status === EventStatus.PROCESSING) {
        logger.debug('Event already being processed', { eventId })
        return
      }

      // Mark as processing
      await prisma.event.update({
        where: { id: eventId },
        data: { status: EventStatus.PROCESSING },
      })

      try {
        // Find and execute handler
        const handler = EventService.handlers.get(event.type)
        if (!handler) {
          throw new Error(`No handler found for event type: ${event.type}`)
        }

        await handler.handle(event)

        // Mark as completed
        await prisma.event.update({
          where: { id: eventId },
          data: {
            status: EventStatus.COMPLETED,
            processedAt: new Date(),
          },
        })

        logger.info('Event processed successfully', {
          eventId,
          type: event.type,
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        
        // Increment retry count
        const updatedEvent = await prisma.event.update({
          where: { id: eventId },
          data: {
            retryCount: { increment: 1 },
          },
        })

        // Check if we should retry or mark as failed
        if (updatedEvent.retryCount >= updatedEvent.maxRetries) {
          await prisma.event.update({
            where: { id: eventId },
            data: {
              status: EventStatus.FAILED,
              payload: {
                ...event.payload,
                error: errorMessage,
              },
            },
          })

          logger.error('Event processing failed permanently', {
            eventId,
            type: event.type,
            error: errorMessage,
            retryCount: updatedEvent.retryCount,
          })
        } else {
          await prisma.event.update({
            where: { id: eventId },
            data: { status: EventStatus.PENDING },
          })

          logger.warn('Event processing failed, will retry', {
            eventId,
            type: event.type,
            error: errorMessage,
            retryCount: updatedEvent.retryCount,
          })
        }

        throw error
      }
    }, 'processEvent')
  }

  /**
   * Process events in batch
   */
  async processPendingEvents(limit: number = 100): Promise<ServiceResponse<{ processed: number; failed: number }>> {
    return await this.handleServiceCall(async () => {
      const events = await prisma.event.findMany({
        where: {
          status: EventStatus.PENDING,
          retryCount: { lt: prisma.event.fields.maxRetries },
        },
        orderBy: { createdAt: 'asc' },
        take: limit,
      })

      let processed = 0
      let failed = 0

      for (const event of events) {
        try {
          const result = await this.processEvent(event.id)
          if (result.success) {
            processed++
          } else {
            failed++
          }
        } catch {
          failed++
        }
      }

      logger.info('Batch event processing completed', {
        totalEvents: events.length,
        processed,
        failed,
      })

      return { processed, failed }
    }, 'processPendingEvents')
  }

  /**
   * Get event statistics
   */
  async getEventStats(organizationId: string, hours: number = 24): Promise<ServiceResponse<any>> {
    return await this.handleServiceCall(async () => {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000)

      const stats = await prisma.event.groupBy({
        by: ['status', 'type'],
        where: {
          organizationId,
          createdAt: { gte: since },
        },
        _count: {
          id: true,
        },
      })

      return stats.reduce((acc, stat) => {
        if (!acc[stat.type]) {
          acc[stat.type] = {}
        }
        acc[stat.type][stat.status] = stat._count.id
        return acc
      }, {} as any)
    }, 'getEventStats')
  }

  /**
   * Clean up old processed events
   */
  async cleanupProcessedEvents(daysOld: number = 30): Promise<ServiceResponse<{ deleted: number }>> {
    return await this.handleServiceCall(async () => {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000)

      const result = await prisma.event.deleteMany({
        where: {
          status: EventStatus.COMPLETED,
          processedAt: { lt: cutoffDate },
        },
      })

      logger.info('Cleaned up old processed events', {
        deleted: result.count,
        cutoffDate,
      })

      return { deleted: result.count }
    }, 'cleanupProcessedEvents')
  }

  /**
   * Retry failed events that might be transient failures
   */
  async retryFailedEvents(organizationId: string, eventType?: string): Promise<ServiceResponse<{ retried: number }>> {
    return await this.handleServiceCall(async () => {
      const where: any = {
        organizationId,
        status: EventStatus.FAILED,
        retryCount: { lt: prisma.event.fields.maxRetries },
      }

      if (eventType) {
        where.type = eventType
      }

      const result = await prisma.event.updateMany({
        where,
        data: {
          status: EventStatus.PENDING,
          retryCount: { increment: 1 },
        },
      })

      logger.info('Retried failed events', {
        organizationId,
        eventType,
        retried: result.count,
      })

      return { retried: result.count }
    }, 'retryFailedEvents')
  }

  /**
   * Process event asynchronously (don't wait for result)
   */
  private async processEventAsync(eventId: string): Promise<void> {
    setImmediate(async () => {
      try {
        await this.processEvent(eventId)
      } catch (error) {
        // Error is already logged in processEvent
      }
    })
  }
}