import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { User } from '@prisma/client'

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_EXPIRES_IN = '7d' // 7 days

export interface JWTPayload {
  userId: string
  email: string
  role: string
  organizationId: string
  schoolIds: string[]
  iat?: number
  exp?: number
}

export interface AuthUser {
  id: string
  email: string
  role: string
  organizationId: string
  schoolIds: string[]
}

export class AuthService {
  static generateToken(user: User & { schools?: any[] }): string {
    const schoolIds = user.schools?.map(s => s.schoolId) || []
    
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      schoolIds,
    }

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    })
  }

  static verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload
    } catch (error) {
      return null
    }
  }

  static extractTokenFromRequest(request: NextRequest): string | null {
    // Check Authorization header
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7)
    }

    // Check cookie
    const tokenFromCookie = request.cookies.get('auth-token')?.value
    if (tokenFromCookie) {
      return tokenFromCookie
    }

    return null
  }

  static getUserFromRequest(request: NextRequest): AuthUser | null {
    const token = this.extractTokenFromRequest(request)
    if (!token) {
      return null
    }

    const payload = this.verifyToken(token)
    if (!payload) {
      return null
    }

    return {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
      organizationId: payload.organizationId,
      schoolIds: payload.schoolIds,
    }
  }

  static generateRefreshToken(): string {
    return jwt.sign(
      { type: 'refresh', timestamp: Date.now() },
      JWT_SECRET,
      { expiresIn: '30d' }
    )
  }

  static verifyRefreshToken(token: string): boolean {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any
      return payload.type === 'refresh'
    } catch (error) {
      return false
    }
  }
}

// Role-based access control
export enum Roles {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ORG_ADMIN = 'ORG_ADMIN',
  SCHOOL_ADMIN = 'SCHOOL_ADMIN',
  TEACHER = 'TEACHER',
  ASSISTANT = 'ASSISTANT',
}

export enum Permissions {
  // Organization management
  MANAGE_ORGANIZATION = 'manage_organization',
  VIEW_ORGANIZATION = 'view_organization',
  
  // User management
  MANAGE_USERS = 'manage_users',
  VIEW_USERS = 'view_users',
  MANAGE_USER_ROLES = 'manage_user_roles',
  
  // School management
  MANAGE_SCHOOLS = 'manage_schools',
  VIEW_SCHOOLS = 'view_schools',
  MANAGE_SCHOOL_SETTINGS = 'manage_school_settings',
  
  // Student management
  MANAGE_STUDENTS = 'manage_students',
  VIEW_STUDENTS = 'view_students',
  VIEW_STUDENT_PROGRESS = 'view_student_progress',
  
  // Course management
  MANAGE_COURSES = 'manage_courses',
  VIEW_COURSES = 'view_courses',
  
  // Lesson management
  MANAGE_LESSONS = 'manage_lessons',
  VIEW_LESSONS = 'view_lessons',
  TAKE_ATTENDANCE = 'take_attendance',
  
  // Analytics
  VIEW_ANALYTICS = 'view_analytics',
  VIEW_FINANCIAL_DATA = 'view_financial_data',
  
  // System
  MANAGE_SUBSCRIPTIONS = 'manage_subscriptions',
  VIEW_AUDIT_LOGS = 'view_audit_logs',
}

const ROLE_PERMISSIONS: Record<string, Permissions[]> = {
  [Roles.SUPER_ADMIN]: [
    // All permissions
    ...Object.values(Permissions),
  ],
  
  [Roles.ORG_ADMIN]: [
    Permissions.MANAGE_ORGANIZATION,
    Permissions.VIEW_ORGANIZATION,
    Permissions.MANAGE_USERS,
    Permissions.VIEW_USERS,
    Permissions.MANAGE_USER_ROLES,
    Permissions.MANAGE_SCHOOLS,
    Permissions.VIEW_SCHOOLS,
    Permissions.MANAGE_SCHOOL_SETTINGS,
    Permissions.MANAGE_STUDENTS,
    Permissions.VIEW_STUDENTS,
    Permissions.VIEW_STUDENT_PROGRESS,
    Permissions.MANAGE_COURSES,
    Permissions.VIEW_COURSES,
    Permissions.MANAGE_LESSONS,
    Permissions.VIEW_LESSONS,
    Permissions.TAKE_ATTENDANCE,
    Permissions.VIEW_ANALYTICS,
    Permissions.VIEW_FINANCIAL_DATA,
    Permissions.MANAGE_SUBSCRIPTIONS,
    Permissions.VIEW_AUDIT_LOGS,
  ],
  
  [Roles.SCHOOL_ADMIN]: [
    Permissions.VIEW_ORGANIZATION,
    Permissions.VIEW_USERS,
    Permissions.MANAGE_SCHOOL_SETTINGS,
    Permissions.MANAGE_STUDENTS,
    Permissions.VIEW_STUDENTS,
    Permissions.VIEW_STUDENT_PROGRESS,
    Permissions.MANAGE_COURSES,
    Permissions.VIEW_COURSES,
    Permissions.MANAGE_LESSONS,
    Permissions.VIEW_LESSONS,
    Permissions.TAKE_ATTENDANCE,
    Permissions.VIEW_ANALYTICS,
  ],
  
  [Roles.TEACHER]: [
    Permissions.VIEW_ORGANIZATION,
    Permissions.VIEW_USERS,
    Permissions.VIEW_STUDENTS,
    Permissions.VIEW_STUDENT_PROGRESS,
    Permissions.VIEW_COURSES,
    Permissions.MANAGE_LESSONS,
    Permissions.VIEW_LESSONS,
    Permissions.TAKE_ATTENDANCE,
  ],
  
  [Roles.ASSISTANT]: [
    Permissions.VIEW_ORGANIZATION,
    Permissions.VIEW_USERS,
    Permissions.VIEW_STUDENTS,
    Permissions.VIEW_COURSES,
    Permissions.VIEW_LESSONS,
    Permissions.TAKE_ATTENDANCE,
  ],
}

export class AuthorizationService {
  static hasPermission(userRole: string, permission: Permissions): boolean {
    const permissions = ROLE_PERMISSIONS[userRole] || []
    return permissions.includes(permission)
  }

  static hasAnyPermission(userRole: string, permissions: Permissions[]): boolean {
    return permissions.some(permission => this.hasPermission(userRole, permission))
  }

  static hasAllPermissions(userRole: string, permissions: Permissions[]): boolean {
    return permissions.every(permission => this.hasPermission(userRole, permission))
  }

  static canAccessSchool(user: AuthUser, schoolId: string): boolean {
    // Super admin and org admin can access any school in their organization
    if (user.role === Roles.SUPER_ADMIN || user.role === Roles.ORG_ADMIN) {
      return true
    }

    // Other users can only access schools they're assigned to
    return user.schoolIds.includes(schoolId)
  }

  static canManageUser(currentUser: AuthUser, targetUserId: string, targetUserRole: string): boolean {
    // Super admin can manage anyone
    if (currentUser.role === Roles.SUPER_ADMIN) {
      return true
    }

    // Org admin can manage anyone except super admin
    if (currentUser.role === Roles.ORG_ADMIN && targetUserRole !== Roles.SUPER_ADMIN) {
      return true
    }

    // School admin can manage teachers and assistants in their schools
    if (currentUser.role === Roles.SCHOOL_ADMIN) {
      return [Roles.TEACHER, Roles.ASSISTANT].includes(targetUserRole as Roles)
    }

    // Users can manage themselves (for profile updates)
    return currentUser.id === targetUserId
  }
}