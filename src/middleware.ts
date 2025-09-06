import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AuthService } from '@/lib/auth'
import { logger } from '@/lib/logger'
import createIntlMiddleware from 'next-intl/middleware'

// Internationalization configuration
const intlMiddleware = createIntlMiddleware({
  locales: ['en', 'ja'],
  defaultLocale: 'ja', // Default to Japanese for Japanese market
  localePrefix: 'as-needed'
});

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/line',
  '/api/auth/line/callback',
  '/api/line/webhook',
  '/api/health',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
]

// Routes that require specific roles
const ROLE_RESTRICTED_ROUTES: Record<string, string[]> = {
  '/api/admin': ['SUPER_ADMIN'],
  '/api/organizations': ['SUPER_ADMIN', 'ORG_ADMIN'],
  '/admin': ['SUPER_ADMIN'],
  '/organization-settings': ['SUPER_ADMIN', 'ORG_ADMIN'],
}

// Rate limiting configuration
const RATE_LIMITS: Record<string, { maxRequests: number; windowMs: number }> = {
  '/api/auth/login': { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 requests per 15 minutes
  '/api/auth/register': { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 requests per hour
  '/api/auth/forgot-password': { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 requests per hour
  default: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
}

// In-memory rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route))
}

function getRoleRequirement(pathname: string): string[] | null {
  for (const [route, roles] of Object.entries(ROLE_RESTRICTED_ROUTES)) {
    if (pathname.startsWith(route)) {
      return roles
    }
  }
  return null
}

function checkRateLimit(request: NextRequest): boolean {
  const { pathname } = request.nextUrl
  const clientIp = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown'
  
  const config = RATE_LIMITS[pathname] || RATE_LIMITS.default
  const key = `${clientIp}:${pathname}`
  const now = Date.now()
  
  const existing = rateLimitStore.get(key)
  
  if (!existing || now > existing.resetTime) {
    // First request or window expired
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    return true
  }
  
  if (existing.count >= config.maxRequests) {
    return false
  }
  
  existing.count++
  return true
}

function createTenantContext(request: NextRequest, user: any) {
  // Add tenant context to request headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-organization-id', user.organizationId)
  requestHeaders.set('x-user-id', user.id)
  requestHeaders.set('x-user-role', user.role)
  requestHeaders.set('x-school-ids', JSON.stringify(user.schoolIds))
  
  return requestHeaders
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isApiRoute = pathname.startsWith('/api')

  // Skip internationalization for demo mode to simplify routing
  if (process.env.DEMO_MODE === 'true') {
    // Skip i18n in demo mode
  } else {
    // Handle internationalization for non-API routes
    if (!isApiRoute && !pathname.startsWith('/_next') && !pathname.startsWith('/favicon')) {
      // Check if this is a Japanese user based on headers or previous visits
      const acceptLanguage = request.headers.get('accept-language');
      const isJapaneseUser = acceptLanguage?.includes('ja') || 
                            request.cookies.get('preferred-locale')?.value === 'ja';

      // Apply internationalization middleware
      const intlResponse = intlMiddleware(request);
      
      // If user prefers Japanese and no locale is set, redirect to Japanese version
      if (isJapaneseUser && !pathname.startsWith('/ja') && !pathname.startsWith('/en')) {
        const url = request.nextUrl.clone();
        url.pathname = `/ja${pathname}`;
        return NextResponse.redirect(url);
      }

      if (intlResponse) {
        return intlResponse;
      }
    }
  }

  // Log request for monitoring
  logger.info('Request', {
    method: request.method,
    pathname,
    userAgent: request.headers.get('user-agent'),
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
    acceptLanguage: request.headers.get('accept-language'),
  })

  // Check rate limiting
  if (!checkRateLimit(request)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests',
        },
      },
      { status: 429 }
    )
  }

  // Skip authentication for public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Skip authentication in demo mode
  if (process.env.DEMO_MODE === 'true') {
    return NextResponse.next()
  }

  // Extract and verify authentication
  const user = AuthService.getUserFromRequest(request)

  if (!user) {
    if (isApiRoute) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      )
    } else {
      // Redirect to login for web routes
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Check role-based access
  const requiredRoles = getRoleRequirement(pathname)
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    if (isApiRoute) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions',
          },
        },
        { status: 403 }
      )
    } else {
      // Redirect to unauthorized page
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  // Add tenant context to the request
  const requestHeaders = createTenantContext(request, user)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}