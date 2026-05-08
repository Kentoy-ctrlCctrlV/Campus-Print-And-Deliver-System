export type PrintMode = 'bw' | 'color';
export type PaperSize = 'A4' | 'short' | 'long';
export type PayMethod = 'gcash' | 'cod';

export interface FileItem {
  id: string;
  name: string;
  sizeInBytes: number;
  type: 'pdf' | 'doc' | 'docx' | 'other';
  uploadedAt: string;
}

export interface Order {
  id: string;
  studentName: string;
  studentEmailOrPhone: string;
  createdAt: string;
  status: 'pending' | 'printing' | 'delivering' | 'completed' | 'cancelled';
  estimatedCompletion: string;
  deliveryBuilding: string;
  printMode: PrintMode;
  paperSize: PaperSize;
  copies: number;
  pagesPerCopy: number;
  totalPages: number;
  totalPrice: number;
  paymentMethod: PayMethod;
  paymentConfirmed: boolean;
  files: FileItem[];
  notes?: string;
  receiptImage?: string;
}
