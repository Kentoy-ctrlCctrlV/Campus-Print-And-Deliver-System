import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import QRCode from 'qrcode';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.html'
})
export class AppComponent implements OnInit {
  gcashQrCode: string = '';

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const payload = '00020101021127830012com.p2pqrpay0111GXCHPHM2XXX02089996440303152170200000006560417DWQM4TK3JDO82W2HZ5204601653036085802PH5914KE*T AN***W Z.6011Poblacion 26104123463042AC9';

    QRCode.toDataURL(payload)
      .then((url: string) => {
        this.gcashQrCode = url;
        this.cdr.markForCheck();
      })
      .catch((err: any) => console.error('QR code generation failed', err));
  }
}