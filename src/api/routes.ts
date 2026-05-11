import express, { Request, Response } from 'express';
import { orderService } from '../services/order-db';
import { adminService } from '../services/admin-db';

const router = express.Router();

/**
 * ORDER ENDPOINTS
 */

// GET all orders
router.get('/orders', async (req: Request, res: Response) => {
  try {
    const orders = await orderService.getAllOrders();
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET order by ID
router.get('/orders/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    return res.json(order);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST create new order
router.post('/orders', async (req: Request, res: Response) => {
  try {
    const order = await orderService.createOrder(req.body);
    return res.status(201).json(order);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT update order status
router.put('/orders/:id/status', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { status, changedBy } = req.body;
    const order = await orderService.updateOrderStatus(
      req.params.id,
      status,
      changedBy
    );
    return res.json(order);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT confirm payment
router.put(
  '/orders/:id/confirm-payment',
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const order = await orderService.confirmPayment(req.params.id);
      return res.json(order);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
);

// GET orders by student email
router.get(
  '/orders/student/:email',
  async (req: Request<{ email: string }>, res: Response) => {
    try {
      const orders = await orderService.getOrdersByStudent(req.params.email);
      return res.json(orders);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
);

// PUT cancel order
router.put('/orders/:id/cancel', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const order = await orderService.cancelOrder(req.params.id);
    return res.json(order);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET order statistics
router.get('/orders/stats/dashboard', async (req: Request, res: Response) => {
  try {
    const stats = await orderService.getOrderStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * ADMIN ENDPOINTS
 */

// POST admin login
router.post('/admin/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const admin = await adminService.verifyAdminLogin(username, password);

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // In production, you'd want to create a JWT token here
    return res.json(admin);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST create new admin (should be protected)
router.post('/admin/users', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const admin = await adminService.createAdmin(username, email, password);
    res.status(201).json(admin);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET activity logs
router.get('/admin/logs', async (req: Request, res: Response) => {
  try {
    const logs = await adminService.getActivityLogs();
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST log activity
router.post('/admin/logs', async (req: Request, res: Response) => {
  try {
    const { adminId, action, orderId, details } = req.body;
    await adminService.logActivity(adminId, action, orderId, details);
    res.status(201).json({ message: 'Activity logged' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
