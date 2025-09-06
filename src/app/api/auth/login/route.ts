import { NextRequest } from 'next/server'
import { z } from 'zod'
import { ApiResponseBuilder } from '@/lib/api-response'
import { AuthService } from '@/lib/auth'
import { UserService } from '@/services/user.service'
import { logger } from '@/lib/logger'

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      return ApiResponseBuilder.validationError(
        (validation.error as any).errors[0].message,
        (validation.error as any).errors[0].path[0] as string
      )
    }

    const { email, password } = validation.data
    const userService = new UserService()

    // Verify credentials
    const result = await userService.verifyPassword(email, password)
    
    if (!result.success || !result.data) {
      // Log failed login attempt
      logger.warn('Failed login attempt', {
        email,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
      })

      if (result.error?.code === 'INVALID_CREDENTIALS') {
        return ApiResponseBuilder.unauthorizedError('Invalid email or password')
      }
      
      if (result.error?.code === 'ACCOUNT_SUSPENDED') {
        return ApiResponseBuilder.forbiddenError('Account has been suspended')
      }

      return ApiResponseBuilder.internalError()
    }

    const user = result.data

    // Generate JWT token
    const token = AuthService.generateToken(user)
    const refreshToken = AuthService.generateRefreshToken()

    // Log successful login
    logger.info('User logged in', {
      userId: user.id,
      email: user.email,
      organizationId: user.organizationId,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
    })

    // Return success response with token
    const response = ApiResponseBuilder.success({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
        status: user.status,
      },
      token,
      refreshToken,
    }, 'Login successful')

    // Set HTTP-only cookie for web clients
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    response.cookies.set('refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/api/auth',
    })

    return response
  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : error,
    }, 'Login error')

    return ApiResponseBuilder.internalError()
  }
}