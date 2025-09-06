# EikaiwaGrow MVP - Quick Start Guide

## 🚀 One-Command Demo Setup

```bash
./demo-setup.sh
```

OR manually:

```bash
npm install
npm run db:push
npx tsx prisma/seed.ts  
npm run dev
```

## 📖 Demo Instructions

1. **Access the demo**: http://localhost:3000
2. **Follow the demo script**: See `DEMO_GUIDE.md`
3. **Key demo routes**:
   - Dashboard: http://localhost:3000/dashboard
   - Trial Booking: http://localhost:3000/book-trial
   - Photo Sharing: http://localhost:3000/dashboard/photos
   - Payments: http://localhost:3000/dashboard/payments
   - Certificates: http://localhost:3000/dashboard/certificates

## ✨ Demo Features Working

✅ **Database**: Initialized with sample data  
✅ **LINE Photo Sharing**: Full Japanese interface with vocabulary  
✅ **Trial Booking**: Complete booking form in Japanese  
✅ **Payment Tracking**: Dashboard with loading states  
✅ **Certificate Generation**: 4 professional templates  
✅ **Demo Mode**: Authentication bypassed  
✅ **Japanese UI**: Native Japanese text throughout  
✅ **Mobile Responsive**: Works on all devices  

## 🎯 Demo Flow

1. **Start with Dashboard** - Show overview & statistics
2. **Photo Sharing** - The WOW factor feature  
3. **Trial Booking** - Show lead generation
4. **Payments** - Business management
5. **Certificates** - Student retention tools

## 📊 Sample Data Included

- **254 students** across different age groups
- **¥892,400 monthly revenue** 
- **96% payment rate**
- **Vocabulary with translations**
- **Multiple certificate templates**

## 🔧 Troubleshooting

**Server won't start?**
```bash
# Kill any existing processes
pkill -f "next dev"

# Restart fresh
npm run dev
```

**Database issues?**
```bash
rm -f prisma/dev.db
npm run db:push
npx tsx prisma/seed.ts
```

**Import errors?**
```bash
# Clear Next.js cache
rm -rf .next

# Restart
npm run dev
```

---

**Ready to wow school owners? Follow the DEMO_GUIDE.md script! 🎬**