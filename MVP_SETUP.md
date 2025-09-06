# EikaiwaGrow MVP Setup Guide

## Quick Start

This MVP demonstrates 5 core features of the EikaiwaGrow English school management system:

1. **LINE Photo Sharing** - Share lesson photos with parents via LINE
2. **Trial Lesson Booking** - Public booking form for new students  
3. **Payment Tracking** - Manage invoices and payments
4. **Student Database** - Demo data with 10 students and lessons
5. **Certificate Generator** - Create and download certificates

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database
```bash
# Create and populate SQLite database with demo data
npm run db:push
npx tsx prisma/seed.ts
```

### 3. Start Development Server
```bash
npm run dev
```

## Demo Access

The application will be available at: `http://localhost:3000`

### Key Demo Pages:

1. **Dashboard**: `/dashboard` - Main dashboard with navigation
2. **Photo Sharing**: `/dashboard/photos` - Upload and share lesson photos
3. **Trial Booking**: `/book-trial` - Public booking form for new students
4. **Payment Management**: `/dashboard/payments` - Invoice and payment tracking
5. **Certificate Generator**: `/dashboard/certificates` - Create certificates

### Demo Features:

- **Database**: Pre-seeded with 10 demo students, lessons, and invoices
- **Authentication**: Bypassed for demo (uses demo mode)
- **LINE Integration**: Mock implementation (logs messages instead of sending)
- **Payments**: Demo data showing paid/overdue invoices with "Mark as Paid" functionality
- **Certificates**: Canvas-based certificate generation with multiple templates

## Demo Data

The seed script creates:
- 10 demo students (mix of Japanese and Western names)
- 32 lessons (past and upcoming)
- 10 invoices (some paid, some overdue for demonstration)
- 3 course levels (Beginner, Intermediate, Advanced)
- Payment records linked to invoices

## MVP Features Demo

### 1. LINE Photo Sharing (`/dashboard/photos`)
- Upload lesson photos
- Select students to notify parents
- Include today's vocabulary words
- Mock LINE message sending (logs in console)

### 2. Trial Booking (`/book-trial`)
- Public-facing booking form
- Date/time selection with availability
- Student information collection
- Confirmation page with booking details
- Saves to database as scheduled lessons

### 3. Payment Tracking (`/dashboard/payments`)
- Real data from seeded database
- Invoice management with status tracking
- "Mark as Paid" functionality
- Payment reminder system
- Summary statistics dashboard

### 4. Student Database
- Pre-populated with 10 diverse students
- Attendance tracking
- Course enrollment
- Progress monitoring

### 5. Certificate Generator (`/dashboard/certificates`)
- Multiple Japanese certificate templates
- Student selection from database
- Customizable achievement text
- Canvas-based PDF-ready generation
- Download functionality

## Technical Architecture

- **Frontend**: Next.js 15 with React 19
- **Database**: SQLite with Prisma ORM
- **UI**: Tailwind CSS with shadcn/ui components
- **Forms**: React Hook Form with Zod validation
- **APIs**: Next.js API routes
- **Internationalization**: Japanese/English support

## Production Notes

For production deployment:
1. Switch to PostgreSQL database
2. Configure proper LINE Bot API credentials
3. Set up Stripe payment processing
4. Enable authentication system
5. Configure cloud storage for photo uploads
6. Set up email services for notifications

## File Structure

```
src/
├── app/
│   ├── dashboard/
│   │   ├── photos/          # Photo sharing feature
│   │   ├── payments/        # Payment management
│   │   └── certificates/    # Certificate generator
│   ├── book-trial/          # Public trial booking
│   └── api/
│       ├── demo/           # Demo-specific APIs
│       ├── photos/         # Photo upload APIs
│       └── bookings/       # Booking management APIs
├── services/
│   ├── line.service.ts     # LINE integration
│   └── payment/           # Payment services
└── lib/
    ├── prisma.ts          # Database client
    └── logger.ts          # Logging utilities
```

This MVP provides a fully functional demonstration of an English school management system with real database integration and working features.