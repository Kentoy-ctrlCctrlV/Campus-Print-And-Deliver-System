import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order';
import { AdminService, AdminUser } from '../../services/admin';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminViewComponent implements OnInit {
  orders: Order[] = [];
  currentAdmin: AdminUser | null = null;
  isLoading = false;

  constructor(
    private orderService: OrderService,
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit() {
    // Fetch current admin info
    this.adminService.getCurrentAdmin().subscribe((admin) => {
      this.currentAdmin = admin;
    });

    // Load orders
    this.orderService.getOrderStream().subscribe((orders) => {
      this.orders = orders;
    });
  }

  getStatusBadgeClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      pending: 'badge-pending',
      printing: 'badge-printing',
      delivering: 'badge-delivering',
      completed: 'badge-completed',
      cancelled: 'badge-cancelled',
    };
    return statusClasses[status] || 'badge-pending';
  }

  downloadOrderFiles(order: Order): void {
    if (!order.files || order.files.length === 0) {
      alert('No files available for download');
      return;
    }

    // Simulate file download
    // In a real application, this would fetch the files from the backend
    alert(`Downloading ${order.files.length} file(s) for order ${order.id}`);

    order.files.forEach((file) => {
      const link = document.createElement('a');
      link.href = '#'; // In production, this would be a real file URL
      link.download = file.name;
      link.click();
    });
  }

  updateOrderStatus(order: Order, newStatus: Order['status']): void {
    this.isLoading = true;
    this.orderService.updateOrderStatus(order.id, newStatus).subscribe(() => {
      this.isLoading = false;
    });
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.adminService.logout();
      this.router.navigate(['/']);
    }
  }
}
