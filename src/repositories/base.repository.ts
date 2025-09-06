import prisma from '@/lib/prisma'
import { PaginationParams, FilterParams, RepositoryResponse } from '@/types/api'

export abstract class BaseRepository<T> {
  protected abstract model: any // Prisma model
  protected abstract searchFields: string[] // Fields to search in

  // Generic find method with pagination and filtering
  protected async findMany(
    where: any = {},
    pagination: PaginationParams = {},
    include?: any
  ): Promise<RepositoryResponse<T[]>> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      this.model.findMany({
        where,
        include,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.model.count({ where }),
    ])

    return { data, total }
  }

  // Generic find by ID method
  protected async findById(id: string, include?: any): Promise<T | null> {
    return await this.model.findUnique({
      where: { id },
      include,
    })
  }

  // Generic create method
  protected async create(data: any, include?: any): Promise<T> {
    return await this.model.create({
      data,
      include,
    })
  }

  // Generic update method
  protected async update(id: string, data: any, include?: any): Promise<T | null> {
    return await this.model.update({
      where: { id },
      data,
      include,
    })
  }

  // Generic delete method
  protected async delete(id: string): Promise<T | null> {
    return await this.model.delete({
      where: { id },
    })
  }

  // Generic soft delete method (for models with status field)
  protected async softDelete(id: string, include?: any): Promise<T | null> {
    return await this.model.update({
      where: { id },
      data: { status: 'INACTIVE' },
      include,
    })
  }

  // Build search where clause
  protected buildSearchWhere(filters: FilterParams, organizationId: string): any {
    const where: any = { organizationId }

    if (filters.search) {
      where.OR = this.searchFields.map(field => ({
        [field]: {
          contains: filters.search,
          mode: 'insensitive',
        },
      }))
    }

    if (filters.status) {
      where.status = filters.status
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {}
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom)
      }
      if (filters.dateTo) {
        where.createdAt.lte = new Date(filters.dateTo)
      }
    }

    return where
  }

  // Batch operations
  protected async createMany(data: any[]): Promise<{ count: number }> {
    return await this.model.createMany({
      data,
      skipDuplicates: true,
    })
  }

  protected async updateMany(where: any, data: any): Promise<{ count: number }> {
    return await this.model.updateMany({
      where,
      data,
    })
  }

  protected async deleteMany(where: any): Promise<{ count: number }> {
    return await this.model.deleteMany({
      where,
    })
  }

  // Transaction support
  protected async transaction<R>(fn: (tx: any) => Promise<R>): Promise<R> {
    return await prisma.$transaction(fn)
  }
}