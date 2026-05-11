import { initPrisma, getPrisma } from '../lib/prisma';
import type { Order, FileItem, OrderStatusHistory } from '@prisma/client';

export interface OrderFile {
  id: string;
  name: string;
  sizeInBytes: number;
  type: string;
}

export interface OrderStatusHistoryEntry {
  id: string;
  orderId: string;
  previousStatus: string;
  newStatus: string;
  changedBy: string;
  changedAt: string;
}

export interface OrderRecord {
  id: string;
  studentName: string;
  studentEmailOrPhone: string;
  deliveryBuilding: string;
  printMode: string;
  paperSize: string;
  copies: number;
  pagesPerCopy: number;
  totalPages: number;
  totalPrice: number;
  paymentMethod: string;
  notes?: string;
  receiptImage?: string;
  status: string;
  paymentConfirmed: boolean;
  paymentConfirmedAt: string | null;
  estimatedCompletion: string | null;
  createdAt: string;
  updatedAt: string;
  files: OrderFile[];
  statusHistory: OrderStatusHistoryEntry[];
}

function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 11).toUpperCase()}`;
}

function nowIso() {
  return new Date().toISOString();
}

export const orderService = {
  async createOrder(data: any): Promise<OrderRecord> {
    const prisma = await getPrisma();
    
    try {
      console.log('Creating order with data:', {
        studentName: data.studentName,
        studentEmailOrPhone: data.studentEmailOrPhone,
        deliveryBuilding: data.deliveryBuilding,
        totalPrice: data.totalPrice,
        paymentMethod: data.paymentMethod,
        filesCount: (data.files || []).length,
      });

      const newOrder = await prisma.order.create({
        data: {
          studentName: data.studentName || 'Unknown',
          studentEmailOrPhone: data.studentEmailOrPhone || 'unknown',
          deliveryAddress: data.deliveryAddress || data.deliveryBuilding || '',
          deliveryBuilding: data.deliveryBuilding || 'Lobby',
          printMode: (data.printMode || 'bw') as any,
          paperSize: (data.paperSize || 'A4') as any,
          copies: Math.max(1, Number(data.copies) || 1),
          pagesPerCopy: Math.max(1, Number(data.pagesPerCopy) || 1),
          totalPages: Number(data.totalPages) || Math.max(1, Number(data.copies) || 1) * Math.max(1, Number(data.pagesPerCopy) || 1),
          totalPrice: Number(data.totalPrice) || 0,
          paymentMethod: data.paymentMethod || 'cash',
          paymentStatus: data.paymentMethod === 'gcash' ? 'pending' : 'confirmed',
          receiptUrl: data.receiptImage || null,
          notes: data.notes || '',
          status: 'pending' as any,
          paymentConfirmed: false,
          paymentConfirmedAt: null,
          estimatedCompletion: null,
          fileItems: {
            create: (data.files || []).map((file: any) => ({
              fileName: file.name || file.fileName || 'document.pdf',
              fileUrl: '',
              sizeInBytes: Number(file.sizeInBytes) || 0,
              type: file.type || 'application/pdf',
              copies: Math.max(1, Number(file.copies) || 1),
              colorMode: (file.colorMode || data.printMode || 'bw') as any,
              paperSize: (file.paperSize || data.paperSize || 'A4') as any,
              pageCount: Math.max(1, Number(file.pageCount) || 1),
            })),
          },
          statusHistory: {
            create: [{
              previousStatus: 'pending',
              newStatus: 'pending',
              changedBy: 'system',
            }],
          },
        },
        include: {
          fileItems: true,
          statusHistory: true,
        },
      });

      console.log('Order created successfully:', newOrder.id);
      return this.transformOrderRecord(newOrder as any);
    } catch (error: any) {
      console.error('Error creating order:', error);
      throw new Error(`Failed to create order: ${error.message}`);
    }
  },

  async getAllOrders(): Promise<OrderRecord[]> {
    const prisma = await getPrisma();
    const orders = await prisma.order.findMany({
      include: {
        fileItems: true,
        statusHistory: {
          orderBy: {
            changedAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders.map((order: any) => this.transformOrderRecord(order));
  },

  async getOrderById(id: string): Promise<OrderRecord | null> {
    const prisma = await getPrisma();
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        fileItems: true,
        statusHistory: {
          orderBy: {
            changedAt: 'desc',
          },
        },
      },
    });

    return order ? this.transformOrderRecord(order) : null;
  },

  async updateOrderStatus(id: string, newStatus: string, changedBy: string = 'system'): Promise<OrderRecord> {
    const prisma = await getPrisma();
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        fileItems: true,
        statusHistory: {
          orderBy: {
            changedAt: 'desc',
          },
        },
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Create status history entry
    await prisma.orderStatusHistory.create({
      data: {
        orderId: id,
        previousStatus: order.status,
        newStatus: newStatus as any,
        changedBy,
      },
    });

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: newStatus as any,
        updatedAt: new Date(),
        estimatedCompletion: newStatus === 'completed' ? new Date() : null,
      },
      include: {
        fileItems: true,
        statusHistory: {
          orderBy: {
            changedAt: 'desc',
          },
        },
      },
    });

    return this.transformOrderRecord(updatedOrder);
  },

  async confirmPayment(orderId: string): Promise<OrderRecord> {
    const prisma = await getPrisma();
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentConfirmed: true,
        paymentConfirmedAt: new Date(),
        paymentStatus: 'confirmed',
        updatedAt: new Date(),
      },
      include: {
        fileItems: true,
        statusHistory: {
          orderBy: {
            changedAt: 'desc',
          },
        },
      },
    });

    return this.transformOrderRecord(updatedOrder);
  },

  async getOrdersByStudent(email: string): Promise<OrderRecord[]> {
    const prisma = await getPrisma();
    const orders = await prisma.order.findMany({
      where: {
        studentEmailOrPhone: email,
      },
      include: {
        fileItems: true,
        statusHistory: {
          orderBy: {
            changedAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders.map((order: any) => this.transformOrderRecord(order));
  },

  async cancelOrder(id: string): Promise<OrderRecord> {
    const prisma = await getPrisma();
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!existingOrder) {
      throw new Error('Order not found');
    }

    await prisma.orderStatusHistory.create({
      data: {
        orderId: id,
        previousStatus: existingOrder.status,
        newStatus: 'cancelled',
        changedBy: 'system',
      },
    });

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'cancelled',
        updatedAt: new Date(),
      },
      include: {
        fileItems: true,
        statusHistory: {
          orderBy: {
            changedAt: 'desc',
          },
        },
      },
    });

    return this.transformOrderRecord(updatedOrder);
  },

  async getOrderStats() {
    const prisma = await getPrisma();
    const [total, pending, printing, delivering, completed] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.order.count({ where: { status: 'printing' } }),
      prisma.order.count({ where: { status: 'delivering' } }),
      prisma.order.count({ where: { status: 'completed' } }),
    ]);

    return { total, pending, printing, delivering, completed };
  },

  // Helper method to transform Prisma Order to OrderRecord
  transformOrderRecord(order: Order & { fileItems: FileItem[]; statusHistory: OrderStatusHistory[] }): OrderRecord {
    return {
      id: order.id,
      studentName: order.studentName,
      studentEmailOrPhone: order.studentEmailOrPhone,
      deliveryBuilding: order.deliveryBuilding || '',
      printMode: order.printMode || 'bw',
      paperSize: order.paperSize || 'A4',
      copies: order.copies,
      pagesPerCopy: order.pagesPerCopy,
      totalPages: order.totalPages || 0,
      totalPrice: Number(order.totalPrice),
      paymentMethod: order.paymentMethod || 'cash',
      notes: order.notes || '',
      receiptImage: order.receiptUrl || undefined,
      status: order.status,
      paymentConfirmed: order.paymentConfirmed,
      paymentConfirmedAt: order.paymentConfirmedAt?.toISOString() || null,
      estimatedCompletion: order.estimatedCompletion?.toISOString() || null,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      files: order.fileItems.map(file => ({
        id: file.id,
        name: file.fileName,
        sizeInBytes: Number(file.sizeInBytes),
        type: file.type || 'application/pdf',
      })),
      statusHistory: order.statusHistory.map(history => ({
        id: history.id,
        orderId: history.orderId,
        previousStatus: history.previousStatus,
        newStatus: history.newStatus,
        changedBy: history.changedBy,
        changedAt: history.changedAt.toISOString(),
      })),
    };
  },
};
