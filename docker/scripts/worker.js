#!/usr/bin/env node

const { EventService } = require('../dist/src/services/event.service')
const { EventRegistry } = require('../dist/src/lib/event-registry')
const { logger } = require('../dist/src/lib/logger')

// Worker process for handling background events
class EventWorker {
  constructor() {
    this.eventService = new EventService()
    this.isRunning = false
    this.processInterval = 5000 // 5 seconds
    this.cleanupInterval = 3600000 // 1 hour
  }

  async start() {
    logger.info('Starting event worker...')

    // Initialize event handlers
    EventRegistry.initialize()

    this.isRunning = true

    // Start processing loop
    this.processLoop()

    // Start cleanup loop
    this.cleanupLoop()

    // Handle graceful shutdown
    process.on('SIGINT', () => this.shutdown())
    process.on('SIGTERM', () => this.shutdown())

    logger.info('Event worker started successfully')
  }

  async processLoop() {
    while (this.isRunning) {
      try {
        logger.debug('Processing pending events...')
        
        const result = await this.eventService.processPendingEvents(50)
        
        if (result.success && result.data) {
          const { processed, failed } = result.data
          if (processed > 0 || failed > 0) {
            logger.info('Event processing batch completed', { processed, failed })
          }
        }
      } catch (error) {
        logger.error('Error in event processing loop', {
          error: error instanceof Error ? error.message : error,
        })
      }

      // Wait before next batch
      await this.sleep(this.processInterval)
    }
  }

  async cleanupLoop() {
    while (this.isRunning) {
      try {
        logger.debug('Running event cleanup...')
        
        const result = await this.eventService.cleanupProcessedEvents(7) // 7 days old
        
        if (result.success && result.data) {
          const { deleted } = result.data
          if (deleted > 0) {
            logger.info('Event cleanup completed', { deleted })
          }
        }
      } catch (error) {
        logger.error('Error in cleanup loop', {
          error: error instanceof Error ? error.message : error,
        })
      }

      // Wait before next cleanup (1 hour)
      await this.sleep(this.cleanupInterval)
    }
  }

  async shutdown() {
    logger.info('Shutting down event worker...')
    this.isRunning = false
    
    // Give some time for current operations to complete
    await this.sleep(2000)
    
    logger.info('Event worker stopped')
    process.exit(0)
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Start the worker if this file is run directly
if (require.main === module) {
  const worker = new EventWorker()
  worker.start().catch((error) => {
    logger.error('Failed to start event worker', {
      error: error instanceof Error ? error.message : error,
    })
    process.exit(1)
  })
}

module.exports = EventWorker