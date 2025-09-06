import { User } from '@/lib/prisma-stub'
import bcrypt from 'bcryptjs'
import { BaseService } from './base.service'
import { UserRepository } from '@/repositories/user.repository'
import { ServiceResponse, PaginationParams, FilterParams } from '@/types/api'
import { EventService } from './event.service'

export interface CreateUserData {
  email: string
  name?: string
  password?: string
  role: string
  organizationId: string
  schoolIds?: string[]
}

export interface UpdateUserData {
  name?: string
  role?: string
  status?: string
  schoolIds?: string[]
}

export class UserService extends BaseService {
  private userRepository: UserRepository
  private eventService: EventService

  constructor() {
    super('UserService')
    this.userRepository = new UserRepository()
    this.eventService = new EventService()
  }

  async createUser(data: CreateUserData): Promise<ServiceResponse<User>> {
    return await this.handleServiceCall(async () => {
      // Check if email already exists
      const existingUser = await this.userRepository.findByEmail(data.email)
      if (existingUser) {
        throw new Error('EMAIL_ALREADY_EXISTS')
      }

      // Hash password if provided
      let hashedPassword: string | undefined
      if (data.password) {
        hashedPassword = await bcrypt.hash(data.password, 12)
      }

      // Create user
      const user = await this.userRepository.createUser({
        ...data,
        password: hashedPassword,
      })

      // Emit user created event
      await this.eventService.emit({
        type: 'user.created',
        organizationId: data.organizationId,
        userId: user.id,
        data: {
          userId: user.id,
          email: user.email,
          role: user.role,
          schoolIds: data.schoolIds,
        },
      })

      return user
    }, 'createUser')
  }

  async getUserById(
    userId: string,
    organizationId: string
  ): Promise<ServiceResponse<User>> {
    return await this.handleServiceCall(async () => {
      const user = await this.userRepository.findById(userId, {
        organization: true,
        schools: {
          include: {
            school: true,
          },
        },
      })

      if (!user || user.organizationId !== organizationId) {
        throw new Error('USER_NOT_FOUND')
      }

      return user
    }, 'getUserById')
  }

  async getUserByEmail(email: string): Promise<ServiceResponse<User>> {
    return await this.handleServiceCall(async () => {
      const user = await this.userRepository.findByEmail(email)
      if (!user) {
        throw new Error('USER_NOT_FOUND')
      }
      return user
    }, 'getUserByEmail')
  }

  async getUsers(
    organizationId: string,
    pagination: PaginationParams = {},
    filters: FilterParams = {}
  ): Promise<ServiceResponse<{ users: User[]; total: number }>> {
    return await this.handleServiceCall(async () => {
      const validatedPagination = this.validatePagination(pagination)
      const sanitizedFilters = this.sanitizeFilters(filters)

      const { data: users, total } = await this.userRepository.findByOrganization(
        organizationId,
        validatedPagination,
        sanitizedFilters
      )

      return {
        users,
        total,
      }
    }, 'getUsers')
  }

  async getUsersBySchool(
    schoolId: string,
    organizationId: string,
    pagination: PaginationParams = {},
    filters: FilterParams = {}
  ): Promise<ServiceResponse<{ users: User[]; total: number }>> {
    return await this.handleServiceCall(async () => {
      const validatedPagination = this.validatePagination(pagination)
      const sanitizedFilters = this.sanitizeFilters(filters)

      const { data: users, total } = await this.userRepository.findBySchool(
        schoolId,
        organizationId,
        validatedPagination,
        sanitizedFilters
      )

      return {
        users,
        total,
      }
    }, 'getUsersBySchool')
  }

  async updateUser(
    userId: string,
    organizationId: string,
    data: UpdateUserData
  ): Promise<ServiceResponse<User>> {
    return await this.handleServiceCall(async () => {
      // Check if user exists and belongs to organization
      const existingUser = await this.userRepository.findById(userId)
      if (!existingUser || existingUser.organizationId !== organizationId) {
        throw new Error('USER_NOT_FOUND')
      }

      // Update user
      const updatedUser = await this.userRepository.update(userId, {
        name: data.name,
        role: data.role,
        status: data.status,
      })

      if (!updatedUser) {
        throw new Error('UPDATE_FAILED')
      }

      // Handle school assignments
      if (data.schoolIds) {
        // This would require more complex logic to handle school assignments
        // For now, we'll emit an event to handle this asynchronously
        await this.eventService.emit({
          type: 'user.school_assignments_updated',
          organizationId,
          userId,
          data: {
            userId,
            schoolIds: data.schoolIds,
          },
        })
      }

      // Emit user updated event
      await this.eventService.emit({
        type: 'user.updated',
        organizationId,
        userId,
        data: {
          userId,
          changes: data,
        },
      })

      return updatedUser
    }, 'updateUser')
  }

  async deleteUser(
    userId: string,
    organizationId: string
  ): Promise<ServiceResponse<void>> {
    return await this.handleServiceCall(async () => {
      // Check if user exists and belongs to organization
      const existingUser = await this.userRepository.findById(userId)
      if (!existingUser || existingUser.organizationId !== organizationId) {
        throw new Error('USER_NOT_FOUND')
      }

      // Soft delete user
      await this.userRepository.softDelete(userId)

      // Emit user deleted event
      await this.eventService.emit({
        type: 'user.deleted',
        organizationId,
        userId,
        data: {
          userId,
          email: existingUser.email,
        },
      })
    }, 'deleteUser')
  }

  async verifyPassword(
    email: string,
    password: string
  ): Promise<ServiceResponse<User>> {
    return await this.handleServiceCall(async () => {
      const user = await this.userRepository.findByEmail(email)
      if (!user || !user.password) {
        throw new Error('INVALID_CREDENTIALS')
      }

      const isValid = await bcrypt.compare(password, user.password)
      if (!isValid) {
        throw new Error('INVALID_CREDENTIALS')
      }

      if (user.status !== 'ACTIVE') {
        throw new Error('ACCOUNT_SUSPENDED')
      }

      // Update last login
      await this.userRepository.updateLastLogin(user.id)

      return user
    }, 'verifyPassword')
  }

  async assignUserToSchool(
    userId: string,
    schoolId: string,
    role: string,
    organizationId: string
  ): Promise<ServiceResponse<void>> {
    return await this.handleServiceCall(async () => {
      // Verify user belongs to organization
      const user = await this.userRepository.findById(userId)
      if (!user || user.organizationId !== organizationId) {
        throw new Error('USER_NOT_FOUND')
      }

      await this.userRepository.assignToSchool(userId, schoolId, role)

      // Emit event
      await this.eventService.emit({
        type: 'user.assigned_to_school',
        organizationId,
        userId,
        data: {
          userId,
          schoolId,
          role,
        },
      })
    }, 'assignUserToSchool')
  }

  async removeUserFromSchool(
    userId: string,
    schoolId: string,
    organizationId: string
  ): Promise<ServiceResponse<void>> {
    return await this.handleServiceCall(async () => {
      // Verify user belongs to organization
      const user = await this.userRepository.findById(userId)
      if (!user || user.organizationId !== organizationId) {
        throw new Error('USER_NOT_FOUND')
      }

      await this.userRepository.removeFromSchool(userId, schoolId)

      // Emit event
      await this.eventService.emit({
        type: 'user.removed_from_school',
        organizationId,
        userId,
        data: {
          userId,
          schoolId,
        },
      })
    }, 'removeUserFromSchool')
  }
}