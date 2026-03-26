import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { Order } from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private orders: Order[] = [];
  private orders$ = new BehaviorSubject<Order[]>([]);

  constructor() {}

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
    return of(this.orders[index]).pipe(delay(200));
  }

  confirmPayment(orderId: string): Observable<Order | undefined> {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return of(undefined);
    order.paymentConfirmed = true;
    this.orders$.next(this.orders);
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

  listRecentOrders(limit = 10): Observable<Order[]> {
    return this.getOrderStream().pipe(map((orders) => orders.slice(0, limit)));
  }

  private calculatePrice(order: Order): number {
    const baseRate = order.printMode === 'color' ? 20 : 10;
    const sizeMultiplier = order.paperSize === 'A4' ? 1 : order.paperSize === 'short' ? 0.9 : 1.1;
    const pageCount = order.copies * order.pagesPerCopy;
    return Math.round((pageCount * baseRate * sizeMultiplier) * 100) / 100;
  }

  private generateId(): string {
    return 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
}

