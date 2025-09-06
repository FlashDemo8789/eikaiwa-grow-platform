# EikaiwaGrow System Architecture

## Overview

EikaiwaGrow is a scalable, multi-tenant SaaS platform designed for Japanese English schools. The architecture is built to handle 10,000+ organizations with bank-level security, sub-100ms API responses, and 99.99% uptime.

## Architecture Principles

### 1. Scalability
- **Multi-tenant architecture** with proper data isolation
- **Horizontal scaling** through stateless services
- **Database sharding** capabilities for high-scale deployments
- **CDN integration** for global content delivery
- **Auto-scaling** based on demand

### 2. Performance
- **Sub-100ms API response time** targets
- **Redis caching** at multiple layers
- **Database query optimization** with proper indexing
- **Connection pooling** for database efficiency
- **Lazy loading** for frontend components

### 3. Security
- **Bank-level security** with encryption at rest and in transit
- **Multi-factor authentication** support
- **Role-based access control** (RBAC)
- **Data isolation** per tenant
- **Audit logging** for all actions
- **Rate limiting** to prevent abuse

### 4. Reliability
- **99.99% uptime** target architecture
- **Circuit breaker** patterns for external services
- **Health checks** and monitoring
- **Graceful degradation** under load
- **Automated failover** capabilities

### 5. Maintainability
- **Clean architecture** with SOLID principles
- **Separation of concerns** (Repository, Service, Controller layers)
- **Comprehensive testing** strategy
- **Documentation** and code standards
- **Automated deployment** pipelines

## System Components

### Frontend Layer
```
┌─────────────────┐
│   Next.js 14    │
│   App Router    │
│   TypeScript    │
│   Tailwind CSS  │
└─────────────────┘
```

**Technologies:**
- Next.js 14 with App Router for modern React development
- TypeScript for type safety
- Tailwind CSS for consistent styling
- React Hook Form for form management
- SWR for data fetching and caching

### API Layer
```
┌─────────────────┐
│   Next.js API   │
│   Routes        │
│   Middleware    │
└─────────────────┘
```

**Features:**
- RESTful API design
- JWT-based authentication
- Rate limiting and security headers
- Request/response logging
- Error handling and validation

### Business Logic Layer
```
┌─────────────────┐    ┌─────────────────┐
│   Services      │    │   Repositories  │
│   - User        │◄──►│   - Base        │
│   - School      │    │   - User        │
│   - Student     │    │   - School      │
│   - Event       │    │   - Student     │
└─────────────────┘    └─────────────────┘
```

**Architecture:**
- Service layer for business logic
- Repository layer for data access
- Dependency injection for testability
- Event-driven architecture for async processing

### Data Layer
```
┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │     Redis       │
│   - Primary DB  │    │   - Caching     │
│   - ACID        │    │   - Sessions    │
│   - JSONB       │    │   - Rate Limit  │
└─────────────────┘    └─────────────────┘
```

**Features:**
- PostgreSQL for ACID transactions
- JSONB for flexible schema
- Redis for high-performance caching
- Connection pooling
- Read replicas for scaling

### Infrastructure Layer
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Monitoring    │    │    Logging      │    │   Security      │
│   - Health      │    │   - Structured  │    │   - WAF         │
│   - Metrics     │    │   - Audit       │    │   - SSL/TLS     │
│   - Alerts      │    │   - Debug       │    │   - Encryption  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Multi-Tenant Architecture

### Data Isolation Strategy

**Row-Level Security (RLS):**
```sql
-- All tenant data is scoped by organizationId
CREATE POLICY tenant_isolation ON users
    FOR ALL TO application_user
    USING (organizationId = current_setting('app.current_organization_id'));
```

**Application-Level Isolation:**
```typescript
// Middleware automatically adds tenant context
const tenantContext = TenantService.getTenantContext(request)
const scopedPrisma = TenantService.createScopedConnection(organizationId)
```

**Benefits:**
- **Cost-effective**: Single database for all tenants
- **Scalable**: Easy to add new tenants
- **Secure**: Strong data isolation guarantees
- **Maintainable**: Single codebase for all tenants

## Event-Driven Architecture

### Event Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Action    │───►│   Event     │───►│  Handler    │
│  (Create    │    │  (user.     │    │  (Send      │
│   User)     │    │  created)   │    │   Email)    │
└─────────────┘    └─────────────┘    └─────────────┘
```

**Features:**
- Asynchronous processing
- Decoupled components  
- Event persistence and replay
- Automatic retry with backoff
- Dead letter queue for failed events

### Event Types
- `user.*` - User lifecycle events
- `school.*` - School management events  
- `student.*` - Student tracking events
- `lesson.*` - Lesson scheduling events
- `payment.*` - Billing and payment events

## Caching Strategy

### Cache Layers
```
┌─────────────────┐
│   Browser       │ ← Static assets, API responses
├─────────────────┤
│   CDN           │ ← Images, JS, CSS
├─────────────────┤  
│   Application   │ ← User sessions, permissions
├─────────────────┤
│   Database      │ ← Query results, aggregations
└─────────────────┘
```

### Cache Keys Pattern
```
user:profile:{userId}
org:schools:{organizationId}  
school:students:{schoolId}
lessons:{schoolId}:{date}
```

### Cache TTL Strategy
- **User data**: 30 minutes
- **Organization data**: 1 hour
- **School data**: 1 hour  
- **Analytics data**: 5 minutes
- **Static data**: 24 hours

## Security Architecture

### Authentication Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Login     │───►│    JWT      │───►│  Protected  │
│ Credentials │    │   Token     │    │   Resource  │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Authorization Model
```typescript
// Role hierarchy
SUPER_ADMIN > ORG_ADMIN > SCHOOL_ADMIN > TEACHER > ASSISTANT

// Permission system
permissions: {
  'manage_users': ['SUPER_ADMIN', 'ORG_ADMIN'],
  'view_analytics': ['ORG_ADMIN', 'SCHOOL_ADMIN'],
  'take_attendance': ['TEACHER', 'ASSISTANT']
}
```

### Data Encryption
- **At Rest**: AES-256 encryption for sensitive data
- **In Transit**: TLS 1.3 for all communications
- **Application**: bcrypt for password hashing
- **Database**: Encrypted columns for PII data

## Performance Optimizations

### Database Optimizations
- **Indexes** on frequently queried columns
- **Materialized views** for complex aggregations
- **Partitioning** for time-series data
- **Connection pooling** with PgBouncer
- **Query optimization** with EXPLAIN ANALYZE

### Application Optimizations
- **Response compression** with gzip
- **Image optimization** with Next.js Image component
- **Code splitting** for reduced bundle size  
- **Tree shaking** to eliminate dead code
- **Service worker** for offline capability

### Caching Optimizations
- **Redis clustering** for high availability
- **Cache warming** strategies
- **Intelligent invalidation** patterns
- **Edge caching** with CDN
- **Browser caching** with proper headers

## Monitoring and Observability

### Metrics Collection
```typescript
// Performance metrics
MetricsLogger.logTimer('api.response_time', duration)
MetricsLogger.logCounter('user.login_attempts', 1)

// Business metrics  
MetricsLogger.logGauge('active_students', count)
MetricsLogger.logHistogram('lesson_duration', minutes)
```

### Health Checks
- **Database connectivity**
- **Redis availability**  
- **Memory usage**
- **Disk space**
- **External API status**

### Alerting Rules
- **Response time > 1000ms**
- **Error rate > 1%**
- **Memory usage > 90%**
- **Database connections > 80%**
- **Failed health checks**

## Deployment Architecture

### Container Strategy
```dockerfile
# Multi-stage build for optimization
FROM node:18-alpine AS builder
# Build application
FROM node:18-alpine AS runner  
# Production runtime
```

### Environment Configuration
```yaml
# Production
NODE_ENV: production
DATABASE_URL: postgresql://...
REDIS_URL: redis://...
JWT_SECRET: <secure-secret>
LOG_LEVEL: info

# Staging  
NODE_ENV: staging
DATABASE_URL: postgresql://staging...
REDIS_URL: redis://staging...
LOG_LEVEL: debug
```

### Scaling Configuration
```yaml
# Horizontal Pod Autoscaler
minReplicas: 3
maxReplicas: 50
targetCPUUtilizationPercentage: 70
targetMemoryUtilizationPercentage: 80
```

## API Design

### RESTful Conventions
```
GET    /api/schools                 # List schools
POST   /api/schools                 # Create school
GET    /api/schools/{id}             # Get school  
PUT    /api/schools/{id}             # Update school
DELETE /api/schools/{id}             # Delete school
```

### Response Format
```json
{
  "success": true,
  "data": {...},
  "message": "Operation completed",
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

### Error Handling
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "field": "email"
  }
}
```

## Development Guidelines

### Code Structure
```
src/
├── app/                    # Next.js App Router
├── lib/                    # Shared utilities
├── services/               # Business logic
├── repositories/           # Data access  
├── types/                  # TypeScript types
├── hooks/                  # React hooks
├── contexts/               # React contexts
└── middleware/             # Request middleware
```

### Testing Strategy
- **Unit tests**: 80% coverage minimum
- **Integration tests**: Critical user flows
- **E2E tests**: Core business processes
- **Load tests**: Performance validation
- **Security tests**: Vulnerability scanning

### Quality Gates
- **TypeScript**: Strict mode enabled
- **ESLint**: Custom rules for consistency
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality
- **Commitizen**: Conventional commits

## Future Enhancements

### Phase 2 (6 months)
- **Mobile applications** (React Native)
- **Advanced analytics** with AI insights
- **Third-party integrations** (Zoom, Google Meet)
- **Multi-language support** (i18n)

### Phase 3 (12 months)  
- **Microservices** migration
- **Kubernetes** deployment
- **AI-powered** features
- **Global expansion** capabilities

## Conclusion

This architecture provides a solid foundation for EikaiwaGrow to scale from startup to enterprise. The design emphasizes:

1. **Scalability** through multi-tenant architecture
2. **Performance** with comprehensive caching
3. **Security** with defense-in-depth approach
4. **Reliability** through monitoring and health checks
5. **Maintainability** with clean code principles

The system is designed to handle rapid growth while maintaining performance, security, and reliability standards expected of enterprise SaaS platforms.