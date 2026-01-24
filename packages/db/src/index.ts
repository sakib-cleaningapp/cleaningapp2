import { PrismaClient } from '@prisma/client';

// Global instance to prevent multiple connections in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Configure database URL for SQLite
const databaseUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Re-export Prisma types for use in other packages
export * from '@prisma/client';

// Helper functions for common operations
export const db = {
  // User/Profile operations
  async createProfile(data: {
    userId: string;
    fullName: string;
    role?: string;
  }) {
    try {
      return await prisma.profile.create({
        data: {
          userId: data.userId,
          fullName: data.fullName,
          role: data.role || 'CUSTOMER',
        },
      });
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  },

  async getProfile(userId: string) {
    try {
      return await prisma.profile.findUnique({
        where: { userId },
        include: {
          business: {
            include: {
              services: true,
            },
          },
          bookings: {
            include: {
              service: true,
              business: true,
            },
          },
        },
      });
    } catch (error) {
      console.error('Error getting profile:', error);
      throw error;
    }
  },

  // Business operations
  async createBusiness(data: {
    ownerId: string;
    businessName: string;
    bio: string;
    serviceCategory: string;
  }) {
    try {
      return await prisma.business.create({
        data,
        include: {
          services: true,
        },
      });
    } catch (error) {
      console.error('Error creating business:', error);
      throw error;
    }
  },

  async getBusinesses(serviceCategory?: string) {
    try {
      return await prisma.business.findMany({
        where: serviceCategory ? { serviceCategory } : undefined,
        include: {
          owner: true,
          services: true,
        },
      });
    } catch (error) {
      console.error('Error getting businesses:', error);
      throw error;
    }
  },

  // Service operations
  async createService(data: {
    businessId: string;
    name: string;
    description: string;
    price: number;
  }) {
    try {
      return await prisma.service.create({
        data: {
          ...data,
          price: data.price,
        },
        include: {
          business: true,
        },
      });
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  },

  async getServices(businessId?: string) {
    try {
      return await prisma.service.findMany({
        where: businessId ? { businessId } : undefined,
        include: {
          business: {
            include: {
              owner: true,
            },
          },
        },
      });
    } catch (error) {
      console.error('Error getting services:', error);
      // Return empty array if database is not available
      console.warn('Database not available, returning empty services array');
      return [];
    }
  },

  // Booking operations
  async createBooking(data: {
    customerId: string;
    businessId: string;
    serviceId: string;
    bookingDate: Date;
    totalCost: number;
  }) {
    try {
      return await prisma.booking.create({
        data: {
          ...data,
          totalCost: data.totalCost,
        },
        include: {
          customer: true,
          business: true,
          service: true,
        },
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  async getBookings(customerId?: string, businessId?: string) {
    try {
      return await prisma.booking.findMany({
        where: {
          ...(customerId && { customerId }),
          ...(businessId && { businessId }),
        },
        include: {
          customer: true,
          business: true,
          service: true,
        },
        orderBy: {
          bookingDate: 'desc',
        },
      });
    } catch (error) {
      console.error('Error getting bookings:', error);
      throw error;
    }
  },

  // Admin/utility operations
  async getStats() {
    try {
      const [profiles, businesses, services, bookings] = await Promise.all([
        prisma.profile.count(),
        prisma.business.count(),
        prisma.service.count(),
        prisma.booking.count(),
      ]);

      return {
        profiles,
        businesses,
        services,
        bookings,
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      throw error;
    }
  },

  // Test database connection
  async testConnection() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  },
};
