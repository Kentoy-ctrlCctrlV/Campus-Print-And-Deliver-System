import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order';
import { Order, FileItem } from '../../models/order.model';

@Component({
  selector: 'app-order-selection',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-selection.html',
  styleUrl: './order-selection.css',
})
export class OrderSelectionComponent {
  deliveryBuilding = '';
  printMode: Order['printMode'] = 'bw';
  paperSize: Order['paperSize'] = 'A4';
  copies = 1;
  pagesPerCopy = 1;
  paymentMethod: Order['paymentMethod'] = 'gcash';
  notes = '';
  files: FileItem[] = [];

  gcashQrPath: string = 'kzgcashqr.jpg';

  constructor(private orderService: OrderService, private router: Router) {}

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    Array.from(input.files).forEach((file) => {
      const fileItem: FileItem = {
        id: Math.random().toString(36).substring(2, 12),
        name: file.name,
        sizeInBytes: file.size,
        type: file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 
              file.name.toLowerCase().endsWith('.docx') ? 'docx' : 
              file.name.toLowerCase().endsWith('.doc') ? 'doc' : 'other',
        uploadedAt: new Date().toISOString(),
      };
      this.files.push(fileItem);
    });

    input.value = '';
  }

  submitOrder() {
    if (!this.deliveryBuilding.trim() || this.files.length === 0) {
      alert('Please choose a delivery building and upload at least one document.');
      return;
    }

    const studentName = typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem('studentName') || 'Unknown' : 'Unknown';
    const studentEmailOrPhone = typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem('studentEmailOrPhone') || '' : '';

    const order: Order = {
      id: '',
      studentName,
      studentEmailOrPhone,
      createdAt: '',
      status: 'pending',
      estimatedCompletion: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      deliveryBuilding: this.deliveryBuilding,
      printMode: this.printMode,
      paperSize: this.paperSize,
      copies: this.copies,
      pagesPerCopy: this.pagesPerCopy,
      totalPages: 0,
      totalPrice: 0,
      paymentMethod: this.paymentMethod,
      paymentConfirmed: false,
      files: this.files,
      notes: this.notes,
    };

    this.orderService.createOrder(order).subscribe(() => {
      alert('Order created successfully!');
      this.router.navigate(['/dashboard']);
    });
  }
}