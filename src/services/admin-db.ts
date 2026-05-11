import { initPrisma, getPrisma } from '../lib/prisma';
import type { Admin, ActivityLog } from '@prisma/client';

export interface AdminUserRecord {
  id: string;
  username: string;
  email: string;
  password: string;
  role: string;
  createdAt: string;
}

export interface ActivityLogRecord {
  id: string;
  adminId: string;
  action: string;
  orderId?: string | null;
  details?: string | null;
  createdAt: string;
}

function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 11).toUpperCase()}`;
}

export const adminService = {
  async createAdmin(username: string, email: string, password: string): Promise<AdminUserRecord> {
    const prisma = await getPrisma();
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findFirst({
      where: {
        OR: [
          { username },
          { email },
        ],
      },
    });

    if (existingAdmin) {
      throw new Error('Username or email already exists');
    }

    const newAdmin = await prisma.admin.create({
      data: {
        username,
        email,
        password,
        role: 'admin',
      },
    });

    return this.transformAdminRecord(newAdmin);
  },

  async verifyAdminLogin(username: string, password: string): Promise<AdminUserRecord | null> {
    const prisma = await getPrisma();
    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin || admin.password !== password) {
      return null;
    }

    return this.transformAdminRecord(admin);
  },

  async getAdminById(id: string): Promise<AdminUserRecord | null> {
    const prisma = await getPrisma();
    const admin = await prisma.admin.findUnique({
      where: { id },
    });

    return admin ? this.transformAdminRecord(admin) : null;
  },

  async logActivity(adminId: string, action: string, orderId?: string, details?: any): Promise<ActivityLogRecord> {
    const prisma = await getPrisma();
    const log = await prisma.activityLog.create({
      data: {
        adminId,
        action,
        orderId,
        details: details ? JSON.stringify(details) : null,
      },
    });

    return this.transformActivityLogRecord(log);
  },

  async getActivityLogs(limit: number = 50): Promise<ActivityLogRecord[]> {
    const prisma = await getPrisma();
    const logs = await prisma.activityLog.findMany({
      include: {
        admin: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return logs.map((log: any) => this.transformActivityLogRecord(log));
  },

  // Initialize default admin users if they don't exist
  async initializeDefaultAdmins(): Promise<void> {
    const defaultAdmins = [
      {
        username: 'kentzayas@admin',
        email: 'kentzayas@admin',
        password: 'kentadmin69420',
      },
      {
        username: 'mydensaga@admin',
        email: 'mydensaga@admin',
        password: 'mydenadmin12345',
      },
      {
        username: 'vincentperez@admin',
        email: 'vincentperez@admin',
        password: 'vincentadmin6767',
      },
      {
        username: 'joshgalagnao@admin',
        email: 'joshgalagnao@admin',
        password: 'joshadmin6969',
      },
    ];

    for (const adminData of defaultAdmins) {
      try {
        await this.createAdmin(adminData.username, adminData.email, adminData.password);
      } catch (error) {
        // Admin already exists, skip
        console.log(`Admin ${adminData.username} already exists`);
      }
    }
  },

  // Helper method to transform Prisma Admin to AdminUserRecord
  transformAdminRecord(admin: Admin): AdminUserRecord {
    return {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      password: admin.password,
      role: admin.role,
      createdAt: admin.createdAt.toISOString(),
    };
  },

  // Helper method to transform Prisma ActivityLog to ActivityLogRecord
  transformActivityLogRecord(log: ActivityLog): ActivityLogRecord {
    return {
      id: log.id,
      adminId: log.adminId,
      action: log.action,
      orderId: log.orderId,
      details: log.details,
      createdAt: log.createdAt.toISOString(),
    };
  },
};
