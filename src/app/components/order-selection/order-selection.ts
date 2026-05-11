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
  receiptImage: string | null = null;
  receiptFileName: string = '';

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

  onReceiptFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.receiptImage = e.target?.result as string;
      this.receiptFileName = file.name;
    };
    reader.onerror = () => {
      alert('Error reading file. Please try again.');
      input.value = '';
    };
    reader.readAsDataURL(file);
  }

  clearReceipt() {
    this.receiptImage = null;
    this.receiptFileName = '';
  }

  removeFile(fileId: string) {
    this.files = this.files.filter((f) => f.id !== fileId);
  }

  private getBaseRate(): number {
    return this.printMode === 'color' ? 11 : 6;
  }

  private getSizeMultiplier(): number {
    if (this.paperSize === 'A4') return 1;
    if (this.paperSize === 'short') return 0.9;
    return 1.1; // long
  }

  getTotalPages(): number {
    return this.copies * this.pagesPerCopy * this.files.length;
  }

  getPricePerPage(): number {
    const baseRate = this.getBaseRate();
    const multiplier = this.getSizeMultiplier();
    return Math.round((baseRate * multiplier) * 100) / 100;
  }

  getTotalPrice(): number {
    const pricePerPage = this.getPricePerPage();
    const totalPages = this.getTotalPages();
    return Math.round((pricePerPage * totalPages) * 100) / 100;
  }

  getPricePerFile(): number {
    const pricePerPage = this.getPricePerPage();
    const pagesPerFile = this.copies * this.pagesPerCopy;
    return Math.round((pricePerPage * pagesPerFile) * 100) / 100;
  }

  submitOrder() {
    if (!this.deliveryBuilding.trim() || this.files.length === 0) {
      alert('Please choose a delivery building and upload at least one document.');
      return;
    }

    if (this.paymentMethod === 'gcash' && !this.receiptImage) {
      alert('Please upload a GCash payment receipt to proceed.');
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
      totalPages: this.getTotalPages(),
      totalPrice: this.getTotalPrice(),
      paymentMethod: this.paymentMethod,
      paymentConfirmed: false,
      files: this.files,
      notes: this.notes,
      receiptImage: this.receiptImage ?? undefined,
    };

    console.log('Submitting order:', order);
    
    this.orderService.createOrder(order).subscribe(
      (createdOrder) => {
        console.log('Order created successfully:', createdOrder);
        alert('Order created successfully!');
        this.orderService.setStudentInfo(studentEmailOrPhone);
        // Reset form
        this.files = [];
        this.deliveryBuilding = '';
        this.notes = '';
        this.receiptImage = null;
        this.receiptFileName = '';
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        console.error('Error creating order:', error);
        alert('Failed to create order. Please try again. Check console for details.');
      }
    );
  }
}