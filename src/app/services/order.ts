import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Order } from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = '/api';
  private orders$ = new BehaviorSubject<Order[]>([]);
  private studentEmailOrPhone: string | null = null;

  constructor(private http: HttpClient) {
    if (typeof localStorage !== 'undefined') {
      this.studentEmailOrPhone = localStorage.getItem('studentEmailOrPhone');
    }
  }

  setStudentInfo(emailOrPhone: string): void {
    this.studentEmailOrPhone = emailOrPhone;
  }

  loadOrdersForStudent(emailOrPhone: string): Observable<Order[]> {
    this.studentEmailOrPhone = emailOrPhone;
    return this.http.get<Order[]>(`${this.apiUrl}/orders/student/${emailOrPhone}`).pipe(
      tap((orders) => {
        this.orders$.next(orders);
      }),
      catchError((error) => {
        console.error('Failed to load orders:', error);
        this.orders$.next([]);
        return of([]);
      })
    );
  }

  getOrderStream(): Observable<Order[]> {
    return this.orders$.asObservable();
  }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders`).pipe(
      tap((orders) => {
        this.orders$.next(orders);
      }),
      catchError((error) => {
        console.error('Failed to fetch all orders:', error);
        return of([]);
      })
    );
  }

  createOrder(order: Order): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders`, order).pipe(
      tap((createdOrder) => {
        if (!createdOrder.receiptImage && order.receiptImage) {
          createdOrder.receiptImage = order.receiptImage;
        }
        const current = this.orders$.getValue();
        this.orders$.next([createdOrder, ...current]);
      }),
      catchError((error) => {
        console.error('Failed to create order:', error);
        throw error;
      })
    );
  }

  getOrderById(id: string): Observable<Order | null> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${id}`).pipe(
      catchError((error) => {
        console.error('Failed to fetch order:', error);
        return of(null);
      })
    );
  }

  updateOrderStatus(orderId: string, status: Order['status']): Observable<Order | undefined> {
    return this.http.put<Order>(`${this.apiUrl}/orders/${orderId}/status`, { status }).pipe(
      tap((updatedOrder) => {
        const current = this.orders$.getValue();
        const index = current.findIndex((o) => o.id === orderId);
        if (index !== -1) {
          current[index] = updatedOrder;
          this.orders$.next([...current]);
        }
      }),
      catchError((error) => {
        console.error('Failed to update order status:', error);
        return of(undefined);
      })
    );
  }

  confirmPayment(orderId: string): Observable<Order | undefined> {
    return this.http.put<Order>(`${this.apiUrl}/orders/${orderId}/confirm-payment`, {}).pipe(
      tap((updatedOrder) => {
        const current = this.orders$.getValue();
        const index = current.findIndex((o) => o.id === orderId);
        if (index !== -1) {
          current[index] = updatedOrder;
          this.orders$.next([...current]);
        }
      }),
      catchError((error) => {
        console.error('Failed to confirm payment:', error);
        return of(undefined);
      })
    );
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
    return this.http.put<Order>(`${this.apiUrl}/orders/${orderId}/cancel`, {}).pipe(
      tap(() => {
        const current = this.orders$.getValue();
        const filtered = current.filter((o) => o.id !== orderId);
        this.orders$.next(filtered);
      }),
      map(() => true),
      catchError((error) => {
        console.error('Failed to delete order:', error);
        return of(false);
      })
    );
  }

  listRecentOrders(limit = 10): Observable<Order[]> {
    return this.getOrderStream().pipe(
      map((orders) => orders.slice(0, limit))
    );
  }

  private calculatePrice(order: Order): number {
    const baseRate = order.printMode === 'color' ? 11 : 6;
    const sizeMultiplier = order.paperSize === 'A4' ? 1 : order.paperSize === 'short' ? 0.9 : 1.1;
    const pageCount = order.copies * order.pagesPerCopy;
    return Math.round((pageCount * baseRate * sizeMultiplier) * 100) / 100;
  }
}

