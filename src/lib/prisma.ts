// Conditional Prisma import for MVP deployment
let prisma: any;

if (process.env.DEMO_MODE === 'true' || process.env.VERCEL) {
  // Use stub for Vercel deployment
  const stub = require('./prisma-stub');
  prisma = stub.prisma || stub.default || stub;
} else {
  // Use real Prisma client in development
  try {
    const { PrismaClient } = require('@prisma/client');
    
    const globalForPrisma = globalThis as unknown as {
      prisma: any | undefined;
    };
    
    prisma = globalForPrisma.prisma ?? new PrismaClient();
    
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prisma;
    }
  } catch (error) {
    console.log('Prisma not available, using stub');
    const stub = require('./prisma-stub');
    prisma = stub.prisma || stub.default || stub;
  }
}

export { prisma };
export default prisma;