import prisma from '../lib/db';
import { Order } from '@prisma/client';

export const orderService = {
  // Create a new order
  async createOrder(data: any) {
    try {
      const order = await prisma.order.create({
        data: {
          studentName: data.studentName,
          studentEmailOrPhone: data.studentEmailOrPhone,
          deliveryBuilding: data.deliveryBuilding,
          printMode: data.printMode,
          paperSize: data.paperSize,
          copies: data.copies,
          pagesPerCopy: data.pagesPerCopy,
          totalPages: data.totalPages,
          totalPrice: data.totalPrice,
          paymentMethod: data.paymentMethod,
          notes: data.notes,
          status: 'pending',
          files: {
            create: data.files?.map((file: any) => ({
              name: file.name,
              sizeInBytes: file.sizeInBytes,
              type: file.type,
            })) || [],
          },
        },
        include: { files: true },
      });

      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  },

  // Get all orders
  async getAllOrders() {
    try {
      const orders = await prisma.order.findMany({
        include: { files: true },
        orderBy: { createdAt: 'desc' },
      });
      return orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new Error('Failed to fetch orders');
    }
  },

  // Get order by ID
  async getOrderById(id: string) {
    try {
      const order = await prisma.order.findUnique({
        where: { id },
        include: { files: true, statusHistory: true },
      });
      return order;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw new Error('Failed to fetch order');
    }
  },

  // Update order status
  async updateOrderStatus(
    id: string,
    newStatus: string,
    changedBy: string = 'system'
  ) {
    try {
      const order = await prisma.order.findUnique({ where: { id } });
      if (!order) throw new Error('Order not found');

      // Create status history entry
      await prisma.orderStatusHistory.create({
        data: {
          orderId: id,
          previousStatus: order.status,
          newStatus,
          changedBy,
        },
      });

      // Update order
      const updatedOrder = await prisma.order.update({
        where: { id },
        data: {
          status: newStatus,
          estimatedCompletion:
            newStatus === 'completed' ? new Date() : order.estimatedCompletion,
        },
        include: { files: true },
      });

      return updatedOrder;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new Error('Failed to update order status');
    }
  },

  // Confirm payment
  async confirmPayment(orderId: string) {
    try {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentConfirmed: true,
          paymentConfirmedAt: new Date(),
        },
        include: { files: true },
      });

      return order;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw new Error('Failed to confirm payment');
    }
  },

  // Get orders by student email
  async getOrdersByStudent(email: string) {
    try {
      const orders = await prisma.order.findMany({
        where: { studentEmailOrPhone: email },
        include: { files: true },
        orderBy: { createdAt: 'desc' },
      });
      return orders;
    } catch (error) {
      console.error('Error fetching student orders:', error);
      throw new Error('Failed to fetch student orders');
    }
  },

  // Delete order (soft delete by cancelling)
  async cancelOrder(id: string) {
    try {
      const order = await prisma.order.update({
        where: { id },
        data: { status: 'cancelled' },
        include: { files: true },
      });
      return order;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw new Error('Failed to cancel order');
    }
  },

  // Get order statistics for dashboard
  async getOrderStats() {
    try {
      const total = await prisma.order.count();
      const pending = await prisma.order.count({
        where: { status: 'pending' },
      });
      const printing = await prisma.order.count({
        where: { status: 'printing' },
      });
      const delivering = await prisma.order.count({
        where: { status: 'delivering' },
      });
      const completed = await prisma.order.count({
        where: { status: 'completed' },
      });

      return { total, pending, printing, delivering, completed };
    } catch (error) {
      console.error('Error fetching order stats:', error);
      throw new Error('Failed to fetch order statistics');
    }
  },
};
