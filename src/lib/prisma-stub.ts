// Stub Prisma client for MVP deployment
// This bypasses Prisma requirements during build

export const prisma = new Proxy({} as any, {
  get: (target, prop) => {
    // Return a function that returns a promise for any property access
    if (typeof prop === 'string') {
      return new Proxy(() => {}, {
        get: (_, method) => {
          // Return async functions for all Prisma methods
          return async (...args: any[]) => {
            console.log(`Prisma stub: ${String(prop)}.${String(method)} called`);
            
            // Return mock data based on the method
            switch (method) {
              case 'findMany':
              case 'findFirst':
              case 'findUnique':
                return [];
              case 'create':
              case 'update':
              case 'upsert':
                return { id: 'mock-id', ...args[0]?.data };
              case 'delete':
              case 'deleteMany':
                return { count: 0 };
              case 'count':
                return 0;
              default:
                return null;
            }
          };
        },
        apply: () => {
          // Handle direct function calls
          return Promise.resolve(null);
        }
      });
    }
    return undefined;
  }
});

export default prisma;