# EikaiwaGrow - Business Growth Platform for Japanese English Schools

## Overview

EikaiwaGrow is a comprehensive, scalable SaaS platform designed specifically for Japanese English schools (Eikaiwa). Built with modern technologies and enterprise-grade architecture, it helps schools manage students, schedule lessons, track progress, and grow their business.

## 🚀 Features

### Core Functionality
- **Multi-tenant Architecture** - Secure data isolation for multiple organizations
- **Student Management** - Complete student lifecycle management
- **Lesson Scheduling** - Flexible lesson planning and scheduling system
- **Progress Tracking** - Detailed student progress and analytics
- **User Management** - Role-based access control for different user types
- **School Administration** - Multi-school support with centralized management

### Technical Features
- **Sub-100ms API Performance** - Optimized for speed and efficiency
- **Bank-level Security** - Enterprise-grade security and encryption
- **99.99% Uptime Architecture** - Highly available and reliable system
- **Real-time Updates** - Live data synchronization
- **Comprehensive Analytics** - Business intelligence and reporting
- **Event-driven Architecture** - Scalable async processing

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form management
- **SWR** - Data fetching and caching

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Database ORM with type safety
- **PostgreSQL** - Primary database
- **Redis** - Caching and session storage
- **JWT Authentication** - Secure token-based auth

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Development orchestration
- **Nginx** - Reverse proxy and load balancing
- **Pino** - Structured logging
- **Health Checks** - System monitoring

## 🏗️ Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Layer     │    │   Database      │
│   Next.js 14    │◄──►│   Next.js API   │◄──►│   PostgreSQL    │
│   TypeScript    │    │   Middleware    │    │   Redis Cache   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Multi-tenant Data Isolation
- Row-level security (RLS) in PostgreSQL
- Organization-scoped queries
- Secure tenant context middleware
- Plan-based feature access control

### Event-driven Processing
- Asynchronous event handling
- Event persistence and replay
- Automatic retry mechanisms
- Dead letter queue for failed events

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- Docker and Docker Compose
- PostgreSQL 15+
- Redis 7+

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd eikaiwa-grow-app
   ```

2. **Start the development environment**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Application: http://localhost:3000
   - Database Admin: http://localhost:8080 (Adminer)
   - Redis Admin: http://localhost:8081 (Redis Commander)

### Manual Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Set up the database**
   ```bash
   npm run db:push
   npm run db:seed
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── (auth)/            # Authentication pages
│   └── (dashboard)/       # Main application pages
├── lib/                   # Shared utilities
│   ├── auth.ts           # Authentication logic
│   ├── prisma.ts         # Database client
│   ├── redis.ts          # Cache client
│   └── monitoring.ts     # Health checks & metrics
├── services/              # Business logic layer
│   ├── base.service.ts   # Base service class
│   ├── user.service.ts   # User management
│   └── event.service.ts  # Event processing
├── repositories/          # Data access layer
│   ├── base.repository.ts
│   └── user.repository.ts
├── types/                 # TypeScript type definitions
├── middleware/            # Request middleware
└── schemas/               # Validation schemas
```

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/eikaiwa_grow
POSTGRES_DB=eikaiwa_grow
POSTGRES_USER=eikaiwa_grow_user
POSTGRES_PASSWORD=secure_password

# Redis
REDIS_URL=redis://localhost:6379

# Authentication  
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
JWT_SECRET=your-jwt-secret

# Application
NODE_ENV=development
LOG_LEVEL=info
```

### Docker Configuration

The application includes production-ready Docker configurations:

- **Dockerfile** - Multi-stage build for optimization
- **docker-compose.yml** - Development environment
- **Nginx configuration** - Production reverse proxy
- **Health checks** - Container health monitoring

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📊 Monitoring & Observability

### Health Checks
- **Database connectivity**
- **Redis availability**
- **Memory usage monitoring**
- **Disk space monitoring**

### Metrics & Logging
- **Structured logging** with Pino
- **Performance metrics** collection
- **Business metrics** tracking
- **Error tracking** and alerting

### API Endpoints
- `GET /api/health` - System health check
- `GET /api/metrics` - Application metrics
- `POST /api/events/process` - Process pending events

## 🔒 Security Features

### Authentication & Authorization
- **JWT-based authentication**
- **Role-based access control (RBAC)**
- **Multi-factor authentication support**
- **Session management**

### Data Protection
- **Encryption at rest and in transit**
- **Input validation and sanitization**
- **SQL injection prevention**
- **XSS protection**
- **CSRF protection**

### Rate Limiting
- **API rate limiting**
- **Login attempt protection**
- **DDoS protection**

## 🚀 Deployment

### Development
```bash
docker-compose up -d
```

### Production
```bash
# Build production images
docker build -t eikaiwa-grow .

# Deploy with production compose
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Checklist
- [ ] Set production environment variables
- [ ] Configure SSL certificates
- [ ] Set up monitoring alerts
- [ ] Configure backup strategies
- [ ] Set up CDN for static assets
- [ ] Configure auto-scaling policies

## 📈 Performance Targets

### Response Times
- **API endpoints**: < 100ms (95th percentile)
- **Database queries**: < 50ms (average)
- **Cache hits**: < 1ms (average)

### Scalability
- **Concurrent users**: 10,000+
- **Organizations**: 10,000+
- **Database connections**: 200 max
- **Redis operations**: 100,000 ops/sec

### Availability
- **Uptime target**: 99.99%
- **Recovery time**: < 5 minutes
- **Backup frequency**: Every 4 hours
- **Data retention**: 7 years

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Open an issue on GitHub
- Contact the development team
- Check the documentation

---

Built with ❤️ for the Japanese English education community.
