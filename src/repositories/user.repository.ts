import { User } from '@prisma/client'
import prisma from '@/lib/prisma'
import { BaseRepository } from './base.repository'
import { PaginationParams, FilterParams, RepositoryResponse } from '@/types/api'

export class UserRepository extends BaseRepository<User> {
  protected model = prisma.user
  protected searchFields = ['name', 'email']

  async findByEmail(email: string): Promise<User | null> {
    return await this.model.findUnique({
      where: { email },
      include: {
        organization: true,
        schools: {
          include: {
            school: true,
          },
        },
      },
    })
  }

  async findByOrganization(
    organizationId: string,
    pagination: PaginationParams = {},
    filters: FilterParams = {}
  ): Promise<RepositoryResponse<User[]>> {
    const where = this.buildSearchWhere(filters, organizationId)
    
    if (filters.role) {
      where.role = filters.role
    }

    return await this.findMany(where, pagination, {
      schools: {
        include: {
          school: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    })
  }

  async findBySchool(
    schoolId: string,
    organizationId: string,
    pagination: PaginationParams = {},
    filters: FilterParams = {}
  ): Promise<RepositoryResponse<User[]>> {
    const where = {
      organizationId,
      schools: {
        some: {
          schoolId,
        },
      },
    }

    if (filters.search) {
      where.OR = this.searchFields.map(field => ({
        [field]: {
          contains: filters.search,
          mode: 'insensitive',
        },
      }))
    }

    if (filters.role) {
      where.schools = {
        some: {
          schoolId,
          role: filters.role,
        },
      }
    }

    return await this.findMany(where, pagination, {
      schools: {
        where: { schoolId },
        include: {
          school: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    })
  }

  async createUser(data: {
    email: string
    name?: string
    password?: string
    role: string
    organizationId: string
    schoolIds?: string[]
  }): Promise<User> {
    return await this.transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          name: data.name,
          password: data.password,
          role: data.role,
          organizationId: data.organizationId,
        },
      })

      if (data.schoolIds && data.schoolIds.length > 0) {
        await tx.schoolUser.createMany({
          data: data.schoolIds.map(schoolId => ({
            userId: user.id,
            schoolId,
            role: data.role === 'SCHOOL_ADMIN' ? 'ADMIN' : 'TEACHER',
          })),
        })
      }

      return user
    })
  }

  async updateUserRole(
    userId: string,
    organizationId: string,
    role: string
  ): Promise<User | null> {
    return await this.model.update({
      where: {
        id: userId,
        organizationId,
      },
      data: { role },
    })
  }

  async assignToSchool(
    userId: string,
    schoolId: string,
    role: string
  ): Promise<void> {
    await prisma.schoolUser.upsert({
      where: {
        schoolId_userId: {
          schoolId,
          userId,
        },
      },
      create: {
        userId,
        schoolId,
        role,
      },
      update: {
        role,
      },
    })
  }

  async removeFromSchool(userId: string, schoolId: string): Promise<void> {
    await prisma.schoolUser.delete({
      where: {
        schoolId_userId: {
          schoolId,
          userId,
        },
      },
    })
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.model.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    })
  }

  async getActiveUsersCount(organizationId: string): Promise<number> {
    return await this.model.count({
      where: {
        organizationId,
        status: 'ACTIVE',
      },
    })
  }
}