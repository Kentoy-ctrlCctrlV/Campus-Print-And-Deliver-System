import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrderService } from '../../services/order';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent {
  orders$: Observable<Order[]>;
  activeOrders = 0;
  documentsPrinted = 0;
  studentName = 'Student';
  private studentEmailOrPhone = '';

  constructor(private router: Router, private orderService: OrderService) {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedName = window.localStorage.getItem('studentName');
      const savedEmailOrPhone = window.localStorage.getItem('studentEmailOrPhone');
      if (savedName) {
        this.studentName = savedName;
      }
      if (savedEmailOrPhone) {
        this.studentEmailOrPhone = savedEmailOrPhone;
      }
    }

    this.orders$ = this.orderService.getOrderStream().pipe(
      map((orders) =>
        orders.filter((order) => order.studentEmailOrPhone === this.studentEmailOrPhone)
      )
    );

    this.orders$.subscribe((orders) => {
      this.activeOrders = orders.filter((order) => order.status !== 'completed' && order.status !== 'cancelled').length;
      this.documentsPrinted = orders.filter((order) => order.status === 'completed').reduce((acc, o) => acc + o.totalPages, 0);
    });
  }

  goToOrder() {
    this.router.navigate(['/order']);
  }

  logout() {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('studentName');
      window.localStorage.removeItem('studentEmailOrPhone');
    }
    this.router.navigate(['/']);
  }
}

