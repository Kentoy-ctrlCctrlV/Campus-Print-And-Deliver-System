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

  constructor(private router: Router, private orderService: OrderService) {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem('studentName');
      if (saved) {
        this.studentName = saved;
      }
    }
    this.orders$ = this.orderService.getOrderStream();
    this.orders$.subscribe((orders) => {
      this.activeOrders = orders.filter((order) => order.status !== 'completed' && order.status !== 'cancelled').length;
      this.documentsPrinted = orders.filter((order) => order.status === 'completed').reduce((acc, o) => acc + o.totalPages, 0);
    });
  }

  goToOrder() {
    this.router.navigate(['/order']);
  }
}

