export interface AdminUserRecord {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'admin';
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

const admins: AdminUserRecord[] = [
  {
    id: 'ADMIN-KENTZAYAS',
    username: 'kentzayas@admin',
    email: 'kentzayas@admin',
    password: 'kentadmin69420',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ADMIN-MYDENSAGA',
    username: 'mydensaga@admin',
    email: 'mydensaga@admin',
    password: 'mydenadmin12345',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ADMIN-VINCENTPEREZ',
    username: 'vincentperez@admin',
    email: 'vincentperez@admin',
    password: 'vincentadmin6767',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ADMIN-JOSHGALAGNAO',
    username: 'joshgalagnao@admin',
    email: 'joshgalagnao@admin',
    password: 'joshadmin6969',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
];

const activityLogs: ActivityLogRecord[] = [];

function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 11).toUpperCase()}`;
}

export const adminService = {
  async createAdmin(username: string, email: string, password: string) {
    if (admins.some((admin) => admin.username === username || admin.email === email)) {
      throw new Error('Username or email already exists');
    }

    const newAdmin: AdminUserRecord = {
      id: generateId('ADMIN'),
      username,
      email,
      password,
      role: 'admin',
      createdAt: new Date().toISOString(),
    };

    admins.push(newAdmin);
    return { id: newAdmin.id, username: newAdmin.username, email: newAdmin.email };
  },

  async verifyAdminLogin(username: string, password: string) {
    const admin = admins.find((entry) => entry.username === username);
    if (!admin || admin.password !== password) {
      return null;
    }

    return { id: admin.id, username: admin.username, email: admin.email };
  },

  async getAdminById(id: string) {
    const admin = admins.find((entry) => entry.id === id);
    if (!admin) {
      return null;
    }

    return { id: admin.id, username: admin.username, email: admin.email, role: admin.role };
  },

  async logActivity(adminId: string, action: string, orderId?: string, details?: any) {
    const log: ActivityLogRecord = {
      id: generateId('LOG'),
      adminId,
      action,
      orderId: orderId || null,
      details: details ? JSON.stringify(details) : null,
      createdAt: new Date().toISOString(),
    };

    activityLogs.unshift(log);
    return log;
  },

  async getActivityLogs(limit: number = 50) {
    return activityLogs.slice(0, limit);
  },
};
