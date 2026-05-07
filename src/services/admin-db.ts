import prisma from '../lib/db';
import * as bcrypt from 'bcrypt';

export const adminService = {
  // Create admin user
  async createAdmin(username: string, email: string, password: string) {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const admin = await prisma.adminUser.create({
        data: {
          username,
          email,
          password: hashedPassword,
          role: 'admin',
        },
      });

      return { id: admin.id, username: admin.username, email: admin.email };
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error('Username or email already exists');
      }
      throw new Error('Failed to create admin user');
    }
  },

  // Verify admin credentials
  async verifyAdminLogin(username: string, password: string) {
    try {
      const admin = await prisma.adminUser.findUnique({
        where: { username },
      });

      if (!admin) {
        return null;
      }

      // Compare passwords
      const passwordMatch = await bcrypt.compare(password, admin.password);
      if (!passwordMatch) {
        return null;
      }

      return { id: admin.id, username: admin.username, email: admin.email };
    } catch (error) {
      console.error('Error verifying admin login:', error);
      throw new Error('Failed to verify admin credentials');
    }
  },

  // Get admin by ID
  async getAdminById(id: string) {
    try {
      const admin = await prisma.adminUser.findUnique({
        where: { id },
        select: { id: true, username: true, email: true, role: true },
      });
      return admin;
    } catch (error) {
      console.error('Error fetching admin:', error);
      throw new Error('Failed to fetch admin');
    }
  },

  // Log admin activity
  async logActivity(
    adminId: string,
    action: string,
    orderId?: string,
    details?: any
  ) {
    try {
      const log = await prisma.activityLog.create({
        data: {
          adminId,
          action,
          orderId,
          details: details ? JSON.stringify(details) : null,
        },
      });
      return log;
    } catch (error) {
      console.error('Error logging activity:', error);
      // Don't throw, just log errors
    }
  },

  // Get activity logs
  async getActivityLogs(limit: number = 50) {
    try {
      const logs = await prisma.activityLog.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { admin: { select: { username: true } } },
      });
      return logs;
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      throw new Error('Failed to fetch activity logs');
    }
  },
};
