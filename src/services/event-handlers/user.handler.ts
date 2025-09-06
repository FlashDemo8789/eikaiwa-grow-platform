import { Event } from '@prisma/client'
import { EventHandler } from '../event.service'
import { logger } from '@/lib/logger'
import prisma from '@/lib/prisma'

export class UserEventHandler implements EventHandler {
  canHandle(eventType: string): boolean {
    return eventType.startsWith('user.')
  }

  async handle(event: Event): Promise<void> {
    const { type, payload } = event

    switch (type) {
      case 'user.created':
        await this.handleUserCreated(event, payload)
        break
      case 'user.updated':
        await this.handleUserUpdated(event, payload)
        break
      case 'user.deleted':
        await this.handleUserDeleted(event, payload)
        break
      case 'user.assigned_to_school':
        await this.handleUserAssignedToSchool(event, payload)
        break
      case 'user.removed_from_school':
        await this.handleUserRemovedFromSchool(event, payload)
        break
      case 'user.school_assignments_updated':
        await this.handleSchoolAssignmentsUpdated(event, payload)
        break
      default:
        throw new Error(`Unhandled user event type: ${type}`)
    }
  }

  private async handleUserCreated(event: Event, payload: any): Promise<void> {
    logger.info('Processing user.created event', {
      eventId: event.id,
      userId: payload.userId,
      email: payload.email,
    })

    // Send welcome email (would integrate with email service)
    await this.sendWelcomeEmail(payload.email, payload.userId)

    // Create user profile defaults
    await this.createUserDefaults(payload.userId)

    // Log audit trail
    await this.logAuditEvent('user_created', event.organizationId, payload.userId, {
      email: payload.email,
      role: payload.role,
    })
  }

  private async handleUserUpdated(event: Event, payload: any): Promise<void> {
    logger.info('Processing user.updated event', {
      eventId: event.id,
      userId: payload.userId,
      changes: payload.changes,
    })

    // Invalidate user cache
    await this.invalidateUserCache(payload.userId)

    // If role changed, handle permissions update
    if (payload.changes.role) {
      await this.handleRoleChange(payload.userId, payload.changes.role)
    }

    // Log audit trail
    await this.logAuditEvent('user_updated', event.organizationId, payload.userId, {
      changes: payload.changes,
    })
  }

  private async handleUserDeleted(event: Event, payload: any): Promise<void> {
    logger.info('Processing user.deleted event', {
      eventId: event.id,
      userId: payload.userId,
      email: payload.email,
    })

    // Clean up user-related data
    await this.cleanupUserData(payload.userId)

    // Invalidate user cache
    await this.invalidateUserCache(payload.userId)

    // Log audit trail
    await this.logAuditEvent('user_deleted', event.organizationId, payload.userId, {
      email: payload.email,
    })
  }

  private async handleUserAssignedToSchool(event: Event, payload: any): Promise<void> {
    logger.info('Processing user.assigned_to_school event', {
      eventId: event.id,
      userId: payload.userId,
      schoolId: payload.schoolId,
      role: payload.role,
    })

    // Send notification to school admins
    await this.notifySchoolAdmins(payload.schoolId, 'user_assigned', {
      userId: payload.userId,
      role: payload.role,
    })

    // Invalidate user cache
    await this.invalidateUserCache(payload.userId)

    // Log audit trail
    await this.logAuditEvent('user_assigned_to_school', event.organizationId, payload.userId, {
      schoolId: payload.schoolId,
      role: payload.role,
    })
  }

  private async handleUserRemovedFromSchool(event: Event, payload: any): Promise<void> {
    logger.info('Processing user.removed_from_school event', {
      eventId: event.id,
      userId: payload.userId,
      schoolId: payload.schoolId,
    })

    // Send notification to school admins
    await this.notifySchoolAdmins(payload.schoolId, 'user_removed', {
      userId: payload.userId,
    })

    // Invalidate user cache
    await this.invalidateUserCache(payload.userId)

    // Log audit trail
    await this.logAuditEvent('user_removed_from_school', event.organizationId, payload.userId, {
      schoolId: payload.schoolId,
    })
  }

  private async handleSchoolAssignmentsUpdated(event: Event, payload: any): Promise<void> {
    logger.info('Processing user.school_assignments_updated event', {
      eventId: event.id,
      userId: payload.userId,
      schoolIds: payload.schoolIds,
    })

    // Get current assignments
    const currentAssignments = await prisma.schoolUser.findMany({
      where: { userId: payload.userId },
      select: { schoolId: true },
    })

    const currentSchoolIds = currentAssignments.map(a => a.schoolId)
    const newSchoolIds = payload.schoolIds || []

    // Find schools to add and remove
    const schoolsToAdd = newSchoolIds.filter((id: string) => !currentSchoolIds.includes(id))
    const schoolsToRemove = currentSchoolIds.filter(id => !newSchoolIds.includes(id))

    // Remove user from schools
    if (schoolsToRemove.length > 0) {
      await prisma.schoolUser.deleteMany({
        where: {
          userId: payload.userId,
          schoolId: { in: schoolsToRemove },
        },
      })
    }

    // Add user to schools
    if (schoolsToAdd.length > 0) {
      await prisma.schoolUser.createMany({
        data: schoolsToAdd.map((schoolId: string) => ({
          userId: payload.userId,
          schoolId,
          role: 'TEACHER', // Default role
        })),
      })
    }

    // Invalidate user cache
    await this.invalidateUserCache(payload.userId)
  }

  // Helper methods
  private async sendWelcomeEmail(email: string, userId: string): Promise<void> {
    // TODO: Integrate with email service (e.g., Resend, SendGrid)
    logger.info('Welcome email would be sent', { email, userId })
  }

  private async createUserDefaults(userId: string): Promise<void> {
    // Create default user settings or preferences
    logger.info('User defaults would be created', { userId })
  }

  private async handleRoleChange(userId: string, newRole: string): Promise<void> {
    // Handle any role-specific setup or cleanup
    logger.info('Role change would be processed', { userId, newRole })
  }

  private async cleanupUserData(userId: string): Promise<void> {
    // Clean up any user-specific data that should be removed
    logger.info('User data cleanup would be performed', { userId })
  }

  private async invalidateUserCache(userId: string): Promise<void> {
    // TODO: Invalidate Redis cache for user
    logger.info('User cache would be invalidated', { userId })
  }

  private async notifySchoolAdmins(schoolId: string, action: string, data: any): Promise<void> {
    // TODO: Send notifications to school administrators
    logger.info('School admin notification would be sent', { schoolId, action, data })
  }

  private async logAuditEvent(
    action: string,
    organizationId: string,
    userId: string,
    data: any
  ): Promise<void> {
    // TODO: Log to audit system
    logger.info('Audit event would be logged', {
      action,
      organizationId,
      userId,
      data,
    })
  }
}