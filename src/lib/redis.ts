import Redis from 'ioredis'
import { logger } from '@/lib/logger'

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
}

// Create Redis instance
let redis: Redis | null = null

export function getRedisClient(): Redis {
  if (!redis) {
    redis = new Redis(redisConfig)

    redis.on('connect', () => {
      logger.info('Redis connected successfully')
    })

    redis.on('error', (error) => {
      logger.error('Redis connection error', { error: error.message })
    })

    redis.on('reconnecting', () => {
      logger.info('Redis reconnecting...')
    })
  }

  return redis
}

// Cache key patterns for consistency
export const CACHE_KEYS = {
  // User cache
  USER_PROFILE: (userId: string) => `user:profile:${userId}`,
  USER_PERMISSIONS: (userId: string) => `user:permissions:${userId}`,
  USER_SCHOOLS: (userId: string) => `user:schools:${userId}`,

  // Organization cache
  ORGANIZATION: (orgId: string) => `org:${orgId}`,
  ORGANIZATION_USERS: (orgId: string) => `org:users:${orgId}`,
  ORGANIZATION_SCHOOLS: (orgId: string) => `org:schools:${orgId}`,
  ORGANIZATION_STATS: (orgId: string) => `org:stats:${orgId}`,

  // School cache
  SCHOOL: (schoolId: string) => `school:${schoolId}`,
  SCHOOL_USERS: (schoolId: string) => `school:users:${schoolId}`,
  SCHOOL_STUDENTS: (schoolId: string) => `school:students:${schoolId}`,
  SCHOOL_COURSES: (schoolId: string) => `school:courses:${schoolId}`,
  SCHOOL_ANALYTICS: (schoolId: string, period: string) => `school:analytics:${schoolId}:${period}`,

  // Student cache
  STUDENT: (studentId: string) => `student:${studentId}`,
  STUDENT_PROGRESS: (studentId: string) => `student:progress:${studentId}`,
  STUDENT_LESSONS: (studentId: string) => `student:lessons:${studentId}`,

  // Lesson cache
  LESSON: (lessonId: string) => `lesson:${lessonId}`,
  LESSON_ATTENDANCE: (lessonId: string) => `lesson:attendance:${lessonId}`,
  LESSONS_BY_DATE: (schoolId: string, date: string) => `lessons:${schoolId}:${date}`,

  // Rate limiting
  RATE_LIMIT: (identifier: string, window: string) => `rate_limit:${identifier}:${window}`,

  // Session cache
  SESSION: (sessionId: string) => `session:${sessionId}`,

  // Event processing
  EVENT_LOCK: (eventId: string) => `event:lock:${eventId}`,
  EVENT_PROCESSING: () => 'events:processing',
}

// Cache TTL values (in seconds)
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 1800, // 30 minutes
  EXTENDED: 3600, // 1 hour
  DAILY: 86400, // 24 hours
  WEEKLY: 604800, // 7 days
}

export class CacheService {
  private redis: Redis

  constructor() {
    this.redis = getRedisClient()
  }

  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      logger.error('Cache get error', { key, error })
      return null
    }
  }

  /**
   * Set a value in cache with TTL
   */
  async set(key: string, value: any, ttl: number = CACHE_TTL.MEDIUM): Promise<boolean> {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value))
      return true
    } catch (error) {
      logger.error('Cache set error', { key, ttl, error })
      return false
    }
  }

  /**
   * Delete a key from cache
   */
  async del(key: string): Promise<boolean> {
    try {
      await this.redis.del(key)
      return true
    } catch (error) {
      logger.error('Cache delete error', { key, error })
      return false
    }
  }

  /**
   * Delete multiple keys matching a pattern
   */
  async delPattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redis.keys(pattern)
      if (keys.length === 0) return 0

      await this.redis.del(...keys)
      return keys.length
    } catch (error) {
      logger.error('Cache delete pattern error', { pattern, error })
      return 0
    }
  }

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key)
      return result === 1
    } catch (error) {
      logger.error('Cache exists error', { key, error })
      return false
    }
  }

  /**
   * Get or set pattern - fetch from cache, or compute and cache if not found
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = CACHE_TTL.MEDIUM
  ): Promise<T> {
    try {
      // Try to get from cache first
      const cached = await this.get<T>(key)
      if (cached !== null) {
        return cached
      }

      // Fetch the data
      const data = await fetchFn()

      // Cache the result
      await this.set(key, data, ttl)

      return data
    } catch (error) {
      logger.error('Cache getOrSet error', { key, error })
      // Fallback to direct fetch
      return await fetchFn()
    }
  }

  /**
   * Increment a counter with expiry
   */
  async increment(key: string, ttl: number = CACHE_TTL.MEDIUM): Promise<number> {
    try {
      const multi = this.redis.multi()
      multi.incr(key)
      multi.expire(key, ttl)
      const results = await multi.exec()
      return results?.[0]?.[1] as number || 0
    } catch (error) {
      logger.error('Cache increment error', { key, error })
      return 0
    }
  }

  /**
   * Set with distributed lock
   */
  async setWithLock(
    key: string,
    value: any,
    ttl: number = CACHE_TTL.MEDIUM,
    lockTtl: number = 10
  ): Promise<boolean> {
    const lockKey = `lock:${key}`
    
    try {
      // Try to acquire lock
      const lockAcquired = await this.redis.set(lockKey, '1', 'EX', lockTtl, 'NX')
      if (!lockAcquired) {
        return false
      }

      // Set the value
      await this.set(key, value, ttl)

      // Release lock
      await this.redis.del(lockKey)
      
      return true
    } catch (error) {
      logger.error('Cache setWithLock error', { key, error })
      // Always try to release lock on error
      await this.redis.del(lockKey)
      return false
    }
  }

  /**
   * Bulk get multiple keys
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      if (keys.length === 0) return []
      
      const values = await this.redis.mget(...keys)
      return values.map(value => value ? JSON.parse(value) : null)
    } catch (error) {
      logger.error('Cache mget error', { keys, error })
      return keys.map(() => null)
    }
  }

  /**
   * Bulk set multiple keys
   */
  async mset(keyValues: Array<{ key: string; value: any; ttl?: number }>): Promise<boolean> {
    try {
      const multi = this.redis.multi()
      
      keyValues.forEach(({ key, value, ttl = CACHE_TTL.MEDIUM }) => {
        multi.setex(key, ttl, JSON.stringify(value))
      })

      await multi.exec()
      return true
    } catch (error) {
      logger.error('Cache mset error', { keyValues, error })
      return false
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<any> {
    try {
      const info = await this.redis.info('memory')
      const keyspace = await this.redis.info('keyspace')
      
      return {
        memory: info,
        keyspace,
        connected: this.redis.status === 'ready',
      }
    } catch (error) {
      logger.error('Cache stats error', { error })
      return null
    }
  }

  /**
   * Flush all cache (use with caution)
   */
  async flushAll(): Promise<boolean> {
    try {
      await this.redis.flushall()
      logger.warn('All cache flushed')
      return true
    } catch (error) {
      logger.error('Cache flush error', { error })
      return false
    }
  }

  /**
   * Close Redis connection
   */
  async disconnect(): Promise<void> {
    try {
      await this.redis.quit()
      logger.info('Redis connection closed')
    } catch (error) {
      logger.error('Redis disconnect error', { error })
    }
  }
}

// Create singleton instance
export const cacheService = new CacheService()

// Invalidation patterns for cache management
export class CacheInvalidation {
  private cache: CacheService

  constructor() {
    this.cache = new CacheService()
  }

  /**
   * Invalidate user-related caches
   */
  async invalidateUser(userId: string): Promise<void> {
    const patterns = [
      CACHE_KEYS.USER_PROFILE(userId),
      CACHE_KEYS.USER_PERMISSIONS(userId),
      CACHE_KEYS.USER_SCHOOLS(userId),
      `user:*:${userId}`,
    ]

    for (const pattern of patterns) {
      await this.cache.delPattern(pattern)
    }
  }

  /**
   * Invalidate organization-related caches
   */
  async invalidateOrganization(organizationId: string): Promise<void> {
    const patterns = [
      CACHE_KEYS.ORGANIZATION(organizationId),
      CACHE_KEYS.ORGANIZATION_USERS(organizationId),
      CACHE_KEYS.ORGANIZATION_SCHOOLS(organizationId),
      CACHE_KEYS.ORGANIZATION_STATS(organizationId),
      `org:*:${organizationId}`,
    ]

    for (const pattern of patterns) {
      await this.cache.delPattern(pattern)
    }
  }

  /**
   * Invalidate school-related caches
   */
  async invalidateSchool(schoolId: string): Promise<void> {
    const patterns = [
      CACHE_KEYS.SCHOOL(schoolId),
      CACHE_KEYS.SCHOOL_USERS(schoolId),
      CACHE_KEYS.SCHOOL_STUDENTS(schoolId),
      CACHE_KEYS.SCHOOL_COURSES(schoolId),
      `school:*:${schoolId}`,
    ]

    for (const pattern of patterns) {
      await this.cache.delPattern(pattern)
    }
  }

  /**
   * Invalidate student-related caches
   */
  async invalidateStudent(studentId: string): Promise<void> {
    const patterns = [
      CACHE_KEYS.STUDENT(studentId),
      CACHE_KEYS.STUDENT_PROGRESS(studentId),
      CACHE_KEYS.STUDENT_LESSONS(studentId),
      `student:*:${studentId}`,
    ]

    for (const pattern of patterns) {
      await this.cache.delPattern(pattern)
    }
  }
}

export const cacheInvalidation = new CacheInvalidation()