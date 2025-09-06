import { EventService } from '@/services/event.service'
import { UserEventHandler } from '@/services/event-handlers/user.handler'
import { logger } from '@/lib/logger'

/**
 * Central registry for event handlers
 * This ensures all event handlers are properly registered at startup
 */
export class EventRegistry {
  private static initialized = false

  static initialize(): void {
    if (this.initialized) {
      return
    }

    logger.info('Initializing event handlers...')

    // Register user event handler
    const userHandler = new UserEventHandler()
    EventService.registerHandler('user.created', userHandler)
    EventService.registerHandler('user.updated', userHandler)
    EventService.registerHandler('user.deleted', userHandler)
    EventService.registerHandler('user.assigned_to_school', userHandler)
    EventService.registerHandler('user.removed_from_school', userHandler)
    EventService.registerHandler('user.school_assignments_updated', userHandler)

    // TODO: Register other event handlers
    // EventService.registerHandler('school.*', new SchoolEventHandler())
    // EventService.registerHandler('student.*', new StudentEventHandler())
    // EventService.registerHandler('lesson.*', new LessonEventHandler())
    // EventService.registerHandler('payment.*', new PaymentEventHandler())

    this.initialized = true
    logger.info('Event handlers initialized successfully')
  }

  static isInitialized(): boolean {
    return this.initialized
  }
}

// Auto-initialize in production
if (process.env.NODE_ENV === 'production') {
  EventRegistry.initialize()
}