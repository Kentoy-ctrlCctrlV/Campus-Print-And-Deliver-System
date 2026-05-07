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
  status: string;
  paymentConfirmed: boolean;
  paymentConfirmedAt: string | null;
  estimatedCompletion: string | null;
  createdAt: string;
  updatedAt: string;
  files: OrderFile[];
  statusHistory: OrderStatusHistoryEntry[];
}

const orders: OrderRecord[] = [];

function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 11).toUpperCase()}`;
}

function nowIso() {
  return new Date().toISOString();
}

export const orderService = {
  async createOrder(data: any) {
    const newOrder: OrderRecord = {
      id: generateId('ORD'),
      studentName: data.studentName || 'Unknown',
      studentEmailOrPhone: data.studentEmailOrPhone || 'unknown',
      deliveryBuilding: data.deliveryBuilding || 'Lobby',
      printMode: data.printMode || 'black_and_white',
      paperSize: data.paperSize || 'A4',
      copies: Number(data.copies) || 1,
      pagesPerCopy: Number(data.pagesPerCopy) || 1,
      totalPages: Number(data.totalPages) || (Number(data.copies) || 1) * (Number(data.pagesPerCopy) || 1),
      totalPrice: Number(data.totalPrice) || 0,
      paymentMethod: data.paymentMethod || 'cash',
      notes: data.notes || '',
      status: 'pending',
      paymentConfirmed: false,
      paymentConfirmedAt: null,
      estimatedCompletion: null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      files: (data.files || []).map((file: any) => ({
        id: generateId('FILE'),
        name: file.name || 'document.pdf',
        sizeInBytes: Number(file.sizeInBytes) || 0,
        type: file.type || 'application/pdf',
      })),
      statusHistory: [],
    };

    orders.unshift(newOrder);
    return newOrder;
  },

  async getAllOrders() {
    return [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async getOrderById(id: string) {
    return orders.find((order) => order.id === id) || null;
  },

  async updateOrderStatus(id: string, newStatus: string, changedBy: string = 'system') {
    const order = orders.find((entry) => entry.id === id);
    if (!order) {
      throw new Error('Order not found');
    }

    const historyEntry: OrderStatusHistoryEntry = {
      id: generateId('HIST'),
      orderId: id,
      previousStatus: order.status,
      newStatus,
      changedBy,
      changedAt: nowIso(),
    };

    order.status = newStatus;
    order.updatedAt = nowIso();
    if (newStatus === 'completed') {
      order.estimatedCompletion = nowIso();
    }
    order.statusHistory.unshift(historyEntry);

    return order;
  },

  async confirmPayment(orderId: string) {
    const order = orders.find((entry) => entry.id === orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    order.paymentConfirmed = true;
    order.paymentConfirmedAt = nowIso();
    order.updatedAt = nowIso();
    return order;
  },

  async getOrdersByStudent(email: string) {
    return orders
      .filter((order) => order.studentEmailOrPhone === email)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async cancelOrder(id: string) {
    const order = orders.find((entry) => entry.id === id);
    if (!order) {
      throw new Error('Order not found');
    }

    order.status = 'cancelled';
    order.updatedAt = nowIso();
    return order;
  },

  async getOrderStats() {
    const total = orders.length;
    const pending = orders.filter((order) => order.status === 'pending').length;
    const printing = orders.filter((order) => order.status === 'printing').length;
    const delivering = orders.filter((order) => order.status === 'delivering').length;
    const completed = orders.filter((order) => order.status === 'completed').length;

    return { total, pending, printing, delivering, completed };
  },
};
