import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order';
import { AdminService, AdminUser } from '../../services/admin';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminViewComponent implements OnInit {
  orders: Order[] = [];
  currentAdmin: AdminUser | null = null;
  isLoading = false;
  selectedOrder: Order | null = null;
  showOrderDetails = false;
  searchTerm: string = '';
  selectedStatusFilter: Order['status'] | 'all' = 'all';
  statusOptions: (Order['status'] | 'all')[] = ['all', 'pending', 'printing', 'delivering', 'completed', 'cancelled'];

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

  getFilteredOrders(): Order[] {
    return this.orders.filter((order) => {
      // Filter by status
      if (
        this.selectedStatusFilter !== 'all' &&
        order.status !== this.selectedStatusFilter
      ) {
        return false;
      }

      // Filter by search term (name or order ID)
      if (this.searchTerm.trim()) {
        const searchLower = this.searchTerm.toLowerCase();
        const matchesName = order.studentName
          .toLowerCase()
          .includes(searchLower);
        const matchesId = order.id.toLowerCase().includes(searchLower);

        if (!matchesName && !matchesId) {
          return false;
        }
      }

      return true;
    });
  }

  clearSearch(): void {
    this.searchTerm = '';
  }

  deleteOrder(order: Order): void {
    const confirmDelete = confirm(
      `Are you sure you want to delete order ${order.id} for ${order.studentName}? This action cannot be undone.`
    );

    if (!confirmDelete) {
      return;
    }

    this.isLoading = true;
    this.orderService.deleteOrder(order.id).subscribe(() => {
      this.isLoading = false;
      alert('Order deleted successfully.');
    }, (error) => {
      this.isLoading = false;
      alert('Error deleting order. Please try again.');
      console.error('Delete error:', error);
    });
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.adminService.logout();
      this.router.navigate(['/']);
    }
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
    this.showOrderDetails = true;
  }

  closeOrderDetails(): void {
    this.showOrderDetails = false;
    this.selectedOrder = null;
  }

  downloadReceipt(order: Order): void {
    if (!order.receiptImage) {
      alert('No receipt available');
      return;
    }

    const link = document.createElement('a');
    link.href = order.receiptImage;
    link.download = `receipt-${order.id}.png`;
    link.click();
  }
}
