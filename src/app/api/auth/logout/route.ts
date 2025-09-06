import { NextRequest } from 'next/server'
import { ApiResponseBuilder } from '@/lib/api-response'
import { AuthService } from '@/lib/auth'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    // Get user from token before invalidating
    const user = AuthService.getUserFromRequest(request)
    
    // Log logout
    if (user) {
      logger.info('User logged out', {
        userId: user.id,
        email: user.email,
        organizationId: user.organizationId,
      })
    }

    // Create response
    const response = ApiResponseBuilder.success(null, 'Logged out successfully')

    // Clear auth cookies
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })

    response.cookies.set('refresh-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/api/auth',
    })

    return response
  } catch (error) {
    logger.error('Logout error', {
      error: error instanceof Error ? error.message : error,
    })

    return ApiResponseBuilder.internalError()
  }
}