import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { Order } from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly storageKey = 'campusPrintOrders';
  private orders: Order[] = [];
  private orders$ = new BehaviorSubject<Order[]>([]);

  constructor() {
    this.loadOrders();
  }

  private loadOrders(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    const saved = localStorage.getItem(this.storageKey);
    if (!saved) {
      this.orders$.next(this.orders);
      return;
    }

    try {
      this.orders = JSON.parse(saved) as Order[];
      this.orders$.next(this.orders);
    } catch (error) {
      console.error('Failed to load saved orders:', error);
      this.orders = [];
      this.orders$.next(this.orders);
    }
  }

  private saveOrders(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    localStorage.setItem(this.storageKey, JSON.stringify(this.orders));
  }

  getOrderStream(): Observable<Order[]> {
    return this.orders$.asObservable();
  }

  createOrder(order: Order): Observable<Order> {
    order.id = this.generateId();
    order.createdAt = new Date().toISOString();
    order.status = 'pending';
    order.paymentConfirmed = false;
    order.totalPages = order.copies * order.pagesPerCopy;
    order.totalPrice = this.calculatePrice(order);

    this.orders.unshift(order);
    this.orders$.next(this.orders);
    this.saveOrders();
    return of(order).pipe(delay(300));
  }

  updateOrderStatus(orderId: string, status: Order['status']): Observable<Order | undefined> {
    const index = this.orders.findIndex((o) => o.id === orderId);
    if (index === -1) return of(undefined);

    this.orders[index].status = status;
    if (status === 'completed') {
      this.orders[index].estimatedCompletion = new Date().toISOString();
    }

    this.orders$.next(this.orders);
    this.saveOrders();
    return of(this.orders[index]).pipe(delay(200));
  }

  confirmPayment(orderId: string): Observable<Order | undefined> {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return of(undefined);
    order.paymentConfirmed = true;
    this.orders$.next(this.orders);
    this.saveOrders();
    return of(order).pipe(delay(200));
  }

  startPrint(orderId: string): Observable<Order | undefined> {
    return this.updateOrderStatus(orderId, 'printing');
  }

  startDelivery(orderId: string): Observable<Order | undefined> {
    return this.updateOrderStatus(orderId, 'delivering');
  }

  completeOrder(orderId: string): Observable<Order | undefined> {
    return this.updateOrderStatus(orderId, 'completed');
  }

  deleteOrder(orderId: string): Observable<boolean> {
    const index = this.orders.findIndex((o) => o.id === orderId);
    if (index === -1) return of(false);

    this.orders.splice(index, 1);
    this.orders$.next(this.orders);
    this.saveOrders();
    return of(true).pipe(delay(200));
  }

  listRecentOrders(limit = 10): Observable<Order[]> {
    return this.getOrderStream().pipe(map((orders) => orders.slice(0, limit)));
  }

  private calculatePrice(order: Order): number {
    const baseRate = order.printMode === 'color' ? 8 : 6;
    const sizeMultiplier = order.paperSize === 'A4' ? 1 : order.paperSize === 'short' ? 0.9 : 1.1;
    const pageCount = order.copies * order.pagesPerCopy;
    return Math.round((pageCount * baseRate * sizeMultiplier) * 100) / 100;
  }

  private generateId(): string {
    return 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
}

